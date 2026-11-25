-- Bink core: courts, players, the courts they play at, blocking, and the
-- king-of-the-hill tables matchmaking reads from.
--
-- Privacy model
--   players         Only you can read your own row. It holds your birth date and
--                   match preferences, which nobody else ever sees.
--   player_cards    What other people see: everything a card or the ranking
--                   needs, with age instead of birth date and last-active day
--                   instead of an exact time. Signed-out visitors can read it.
--   directory_players
--                   player_cards minus you and anyone blocked in either
--                   direction. The directory and court lists read this.
--
--   player_courts   Only you can read your own rows. Others see your courts on
--                   your card, but only when signed in, not blocked either way,
--                   and allowed by your courts_visibility setting: any Bink
--                   player (the default) or only people you're connected with.
--
-- Helpers that need to read rows the caller can't (for example, whether
-- someone has blocked you) live in the `private` schema, which the Supabase
-- API doesn't expose.

create schema if not exists private;
grant usage on schema private to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------

create type public.play_style as enum ('fun', 'social', 'competitive');
create type public.gender as enum ('woman', 'man', 'non_binary', 'prefer_not_to_say');
create type public.play_format as enum ('singles', 'doubles', 'mixed');
-- Who can see which courts you play at: any signed-in Bink player, or only
-- people you're connected with (you share a chat: an accepted play request,
-- or the same game or crew).
create type public.court_visibility as enum ('players', 'connections');

-- A time slot is a day plus part of day, such as 'thu_evening'. 21 in all.
create domain public.time_slots as text[]
  not null default '{}'
  check (value <@ array[
    'mon_morning', 'mon_afternoon', 'mon_evening',
    'tue_morning', 'tue_afternoon', 'tue_evening',
    'wed_morning', 'wed_afternoon', 'wed_evening',
    'thu_morning', 'thu_afternoon', 'thu_evening',
    'fri_morning', 'fri_afternoon', 'fri_evening',
    'sat_morning', 'sat_afternoon', 'sat_evening',
    'sun_morning', 'sun_afternoon', 'sun_evening'
  ]::text[]);

-- ---------------------------------------------------------------------------
-- Courts
-- ---------------------------------------------------------------------------

create table public.courts (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name         text not null,
  address      text,
  municipality text not null,
  area         text not null,  -- area of Victoria; crews and games take theirs from their court
  latitude     double precision not null check (latitude between -90 and 90),
  longitude    double precision not null check (longitude between -180 and 180),
  court_count  int check (court_count >= 0),
  is_indoor    boolean not null default false,
  created_at   timestamptz not null default now()
);

alter table public.courts enable row level security;
create policy "Anyone can read courts" on public.courts
  for select to anon, authenticated using (true);
revoke insert, update, delete, truncate on public.courts from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Players
-- ---------------------------------------------------------------------------

create table public.players (
  id             uuid primary key references auth.users (id) on delete cascade,
  name           text not null check (char_length(btrim(name)) between 1 and 40),
  photo_url      text not null check (btrim(photo_url) <> ''),
  bio            text not null default '' check (char_length(bio) <= 150),
  birth_date     date not null,
  gender         public.gender,                      -- optional
  skill          numeric(2, 1) not null check (skill between 2.0 and 5.0),  -- self-rated
  dupr           numeric(4, 3) check (dupr between 1.0 and 8.0),           -- optional
  play_style     public.play_style not null,
  formats        public.play_format[] not null check (cardinality(formats) between 1 and 3),
  play_times     public.time_slots,                  -- optional (empty = not set)
  open_to_play   boolean not null default true,
  area           text,
  courts_visibility public.court_visibility not null default 'players',
  last_active_at timestamptz not null default now(),
  pref_age_min   int check (pref_age_min >= 18),
  pref_age_max   int check (pref_age_max >= 18),
  pref_gender    public.gender[] check (pref_gender is null or cardinality(pref_gender) >= 1),
  created_at     timestamptz not null default now(),
  check (pref_age_min is null or pref_age_max is null or pref_age_min <= pref_age_max)
);

-- Bink is 18+. A check constraint can't use today's date, so a trigger does it.
create function private.check_player_is_adult() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.birth_date > (current_date - interval '18 years')::date then
    raise exception 'Bink is for players aged 18 and over.' using errcode = 'check_violation';
  end if;
  return new;
end $$;

create trigger players_must_be_adult
  before insert or update of birth_date on public.players
  for each row execute function private.check_player_is_adult();

alter table public.players enable row level security;
create policy "Players read their own row" on public.players
  for select to authenticated using (id = (select auth.uid()));
create policy "Players create their own row" on public.players
  for insert to authenticated with check (id = (select auth.uid()));
create policy "Players edit their own row" on public.players
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "Players delete their own row" on public.players
  for delete to authenticated using (id = (select auth.uid()));

revoke all on public.players from anon;
revoke insert, update on public.players from authenticated;
grant insert (id, name, photo_url, bio, birth_date, gender, skill, dupr, play_style, formats,
              play_times, open_to_play, area, courts_visibility, pref_age_min, pref_age_max, pref_gender)
  on public.players to authenticated;
-- Birth date can't be changed after sign-up; last_active_at is set by touch_last_active().
grant update (name, photo_url, bio, gender, skill, dupr, play_style, formats, play_times,
              open_to_play, area, courts_visibility, pref_age_min, pref_age_max, pref_gender)
  on public.players to authenticated;

-- ---------------------------------------------------------------------------
-- Courts each player plays at (at most one home court)
-- ---------------------------------------------------------------------------

create table public.player_courts (
  player_id uuid not null references public.players (id) on delete cascade,
  court_id  uuid not null references public.courts (id) on delete cascade,
  is_home   boolean not null default false,
  primary key (player_id, court_id)
);
create unique index player_courts_one_home on public.player_courts (player_id) where is_home;
create index player_courts_court on public.player_courts (court_id);

-- Knowing someone's courts tells you where to find them, so the raw rows are
-- yours alone. Other players see them on your card (player_cards), subject to
-- private.can_see_courts().
alter table public.player_courts enable row level security;
create policy "Players read their own courts" on public.player_courts
  for select to authenticated using (player_id = (select auth.uid()));
create policy "Players add their own courts" on public.player_courts
  for insert to authenticated with check (player_id = (select auth.uid()));
create policy "Players edit their own courts" on public.player_courts
  for update to authenticated using (player_id = (select auth.uid())) with check (player_id = (select auth.uid()));
create policy "Players remove their own courts" on public.player_courts
  for delete to authenticated using (player_id = (select auth.uid()));
revoke all on public.player_courts from anon;

-- ---------------------------------------------------------------------------
-- Blocking
-- ---------------------------------------------------------------------------

create table public.blocks (
  blocker_id uuid not null references public.players (id) on delete cascade,
  blocked_id uuid not null references public.players (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
create index blocks_blocked on public.blocks (blocked_id);

alter table public.blocks enable row level security;
-- You only ever see your own blocks, never who has blocked you.
create policy "Players read their own blocks" on public.blocks
  for select to authenticated using (blocker_id = (select auth.uid()));
revoke all on public.blocks from anon;
grant select on public.blocks to anon;  -- no anon policy, so zero rows; lets public reads run signed out
revoke insert, update, delete, truncate on public.blocks from authenticated;  -- use block_player()

-- True if either player has blocked the other.
create function private.is_blocked_between(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a)
  );
$$;
revoke execute on function private.is_blocked_between(uuid, uuid) from public;
grant execute on function private.is_blocked_between(uuid, uuid) to anon, authenticated;

-- Whether the signed-in caller may see which courts `owner` plays at. Never
-- for signed-out visitors or anyone blocked either way. Otherwise it's the
-- owner's courts_visibility: any player, or only people who share a chat with
-- them. (plpgsql because conversations are created in the next migration.)
create function private.can_see_courts(owner uuid, visibility public.court_visibility) returns boolean
language plpgsql stable security definer set search_path = '' as $$
declare
  me uuid := auth.uid();
begin
  if me is null then
    return false;
  end if;
  if me = owner then
    return true;
  end if;
  if private.is_blocked_between(owner, me) then
    return false;
  end if;
  return visibility = 'players' or exists (
    select 1
    from public.conversation_members theirs
    join public.conversation_members mine on mine.conversation_id = theirs.conversation_id
    where theirs.player_id = owner and mine.player_id = me
  );
end $$;
revoke execute on function private.can_see_courts(uuid, public.court_visibility) from public;
grant execute on function private.can_see_courts(uuid, public.court_visibility) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- What other players see
-- ---------------------------------------------------------------------------

-- These views run with the owner's rights (that's what lets them hide
-- birth_date while still showing age), so they're read-only for everyone.
create view public.player_cards with (security_barrier = true) as
select
  p.id,
  p.name,
  p.photo_url,
  p.bio,
  extract(year from age(current_date, p.birth_date))::int as age,
  p.gender,
  p.skill,
  p.dupr,
  coalesce(p.dupr, p.skill)::numeric as match_skill,  -- DUPR if they have one, else self-rating
  p.play_style,
  p.formats,
  p.play_times::text[] as play_times,
  p.open_to_play,
  p.area,
  (p.last_active_at at time zone 'America/Vancouver')::date as last_active_on,
  -- Null and empty when the viewer isn't allowed to see this player's courts.
  case when private.can_see_courts(p.id, p.courts_visibility) then
    (select pc.court_id from public.player_courts pc where pc.player_id = p.id and pc.is_home)
  end as home_court_id,
  case when private.can_see_courts(p.id, p.courts_visibility) then coalesce(
    (select array_agg(pc.court_id order by pc.court_id) from public.player_courts pc where pc.player_id = p.id),
    '{}'::uuid[])
  else '{}'::uuid[] end as court_ids
from public.players p;

create view public.directory_players with (security_barrier = true) as
select c.*
from public.player_cards c
where c.id is distinct from (select auth.uid())
  and not private.is_blocked_between(c.id, (select auth.uid()));

revoke all on public.player_cards, public.directory_players from anon, authenticated;
grant select on public.player_cards, public.directory_players to anon, authenticated;

-- ---------------------------------------------------------------------------
-- King of the hill (owned by Ben; matchmaking only reads hill_streaks)
-- ---------------------------------------------------------------------------
--
-- A result is one side beating another: 1 v 1 in singles, 2 v 2 in doubles
-- and mixed. Whoever records it vouches for their own side. It counts once
-- someone on the other side confirms it, or automatically once the
-- confirmation window (24 hours) passes without them disputing it. That's the
-- founder's rule: an opponent who doesn't respond in time takes the loss.
-- A disputed result never counts. (Reporting players who lie about scores is
-- its own follow-up project.)

create type public.hill_result_status as enum ('pending', 'confirmed', 'disputed');

create table public.hill_matches (
  id           uuid primary key default gen_random_uuid(),
  court_id     uuid not null references public.courts (id) on delete cascade,
  format       public.play_format not null,
  score        text not null check (char_length(score) between 1 and 40),
  played_at    timestamptz not null default now(),
  recorded_by  uuid not null references public.players (id) on delete cascade,
  status       public.hill_result_status not null default 'pending',
  responded_by uuid references public.players (id) on delete set null,  -- who confirmed or disputed
  responded_at timestamptz,
  created_at   timestamptz not null default now()
);
create index hill_matches_court on public.hill_matches (court_id, played_at desc);

-- Everyone who played, and which side they were on.
create table public.hill_match_players (
  match_id  uuid not null references public.hill_matches (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  won       boolean not null,
  primary key (match_id, player_id)
);
create index hill_match_players_player on public.hill_match_players (player_id);

-- How long the other side has to confirm or dispute. One place to change it.
create function private.hill_confirm_window() returns interval
language sql immutable set search_path = '' as $$
  select interval '24 hours';
$$;

-- Whether a result counts toward streaks: confirmed, or left unanswered past the window.
create function private.hill_result_counts(status public.hill_result_status, created_at timestamptz)
returns boolean
language sql stable set search_path = '' as $$
  select status = 'confirmed'
      or (status = 'pending' and created_at <= now() - private.hill_confirm_window());
$$;

create function private.is_hill_player(m uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.hill_match_players where match_id = m and player_id = (select auth.uid()));
$$;

revoke execute on function private.hill_confirm_window(),
  private.hill_result_counts(public.hill_result_status, timestamptz), private.is_hill_player(uuid) from public;
grant execute on function private.hill_confirm_window(),
  private.hill_result_counts(public.hill_result_status, timestamptz), private.is_hill_player(uuid)
  to anon, authenticated;

alter table public.hill_matches enable row level security;
alter table public.hill_match_players enable row level security;
create policy "Anyone reads results that count; players read their own" on public.hill_matches
  for select to anon, authenticated
  using (private.hill_result_counts(status, created_at) or private.is_hill_player(id));
create policy "Anyone reads the players of results they can see" on public.hill_match_players
  for select to anon, authenticated
  using (exists (select 1 from public.hill_matches m where m.id = match_id));
-- All writes go through record_hill_match(), confirm_hill_match() and dispute_hill_match().
revoke all on public.hill_matches, public.hill_match_players from anon, authenticated;
grant select on public.hill_matches, public.hill_match_players to anon, authenticated;

-- The current king(s) of each court and their streak, from results that count.
-- The king is the winning side of the latest result: one player in singles,
-- two in doubles, each on their own row. The streak is how many results in a
-- row, newest first, that exact side has won at that court.
create view public.hill_streaks with (security_barrier = true) as
with counted as (
  select m.court_id,
         array(select hp.player_id from public.hill_match_players hp
               where hp.match_id = m.id and hp.won order by hp.player_id) as winners,
         row_number() over (partition by m.court_id order by m.played_at desc, m.created_at desc) as rn
  from public.hill_matches m
  where private.hill_result_counts(m.status, m.created_at)
),
kings as (
  select k.court_id, k.winners,
         (select count(*) from counted c
           where c.court_id = k.court_id
             and c.rn < coalesce((select min(c2.rn) from counted c2
                                   where c2.court_id = k.court_id and c2.winners <> k.winners),
                                 2147483647))::int as streak
  from counted k
  where k.rn = 1
)
select k.court_id, w.player_id, k.streak
from kings k
cross join lateral unnest(k.winners) as w(player_id);

revoke all on public.hill_streaks from anon, authenticated;
grant select on public.hill_streaks to anon, authenticated;

-- Record a result you played in. Singles is 1 v 1; doubles and mixed are 2 v 2.
-- Returns the result's id. It starts pending (see the rules above).
create function public.record_hill_match(
  p_court_id uuid,
  p_format public.play_format,
  p_winner_ids uuid[],
  p_loser_ids uuid[],
  p_score text,
  p_played_at timestamptz default now()
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := auth.uid();
  side_size int := case when p_format = 'singles' then 1 else 2 end;
  everyone uuid[] := coalesce(p_winner_ids, '{}') || coalesce(p_loser_ids, '{}');
  new_id uuid;
begin
  if me is null or not exists (select 1 from public.players where id = me) then
    raise exception 'Sign in and finish your profile first.' using errcode = '42501';
  end if;
  if coalesce(cardinality(p_winner_ids), 0) <> side_size or coalesce(cardinality(p_loser_ids), 0) <> side_size then
    raise exception '% is % v %.', initcap(p_format::text), side_size, side_size using errcode = 'check_violation';
  end if;
  if (select count(distinct x) from unnest(everyone) x) <> 2 * side_size then
    raise exception 'Each player can only be on one side, once.' using errcode = 'check_violation';
  end if;
  if not me = any (everyone) then
    raise exception 'You can only record results you played in.' using errcode = '42501';
  end if;
  if (select count(*) from public.players where id = any (everyone)) <> 2 * side_size then
    raise exception 'Every player has to be on Bink.' using errcode = 'check_violation';
  end if;
  if p_played_at > now() + interval '10 minutes' then
    raise exception 'That result is in the future.' using errcode = 'check_violation';
  end if;

  insert into public.hill_matches (court_id, format, score, played_at, recorded_by)
  values (p_court_id, p_format, btrim(p_score), coalesce(p_played_at, now()), me)
  returning id into new_id;
  insert into public.hill_match_players (match_id, player_id, won)
  select new_id, w, true from unnest(p_winner_ids) w
  union all
  select new_id, l, false from unnest(p_loser_ids) l;
  return new_id;
end $$;

-- Confirm or dispute a result. Only the side that didn't record it can, and
-- only while it's pending. Disputing also has to happen inside the window.
create function private.answer_hill_match(p_match_id uuid, p_confirm boolean) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := auth.uid();
  m public.hill_matches;
  my_side boolean;
  recorder_side boolean;
begin
  select * into m from public.hill_matches where id = p_match_id for update;
  select won into my_side from public.hill_match_players where match_id = p_match_id and player_id = me;
  if m.id is null or my_side is null then
    raise exception 'You can only answer results you played in.' using errcode = '42501';
  end if;
  select won into recorder_side from public.hill_match_players where match_id = m.id and player_id = m.recorded_by;
  if my_side = recorder_side then
    raise exception 'Your side recorded this result. The other side confirms it.' using errcode = 'check_violation';
  end if;

  if m.status = 'confirmed' then
    if p_confirm then
      return true;
    end if;
    raise exception 'This result is already confirmed.' using errcode = 'check_violation';
  end if;
  if m.status = 'disputed' then
    if not p_confirm then
      return true;
    end if;
    raise exception 'This result was disputed, so it doesn''t count.' using errcode = 'check_violation';
  end if;
  if not p_confirm and private.hill_result_counts(m.status, m.created_at) then
    raise exception 'Too late to dispute: results count automatically after %.', private.hill_confirm_window()
      using errcode = 'check_violation';
  end if;

  update public.hill_matches
     set status = case when p_confirm then 'confirmed' else 'disputed' end::public.hill_result_status,
         responded_by = me, responded_at = now()
   where id = m.id;
  return true;
end $$;
revoke execute on function private.answer_hill_match(uuid, boolean) from public;

create function public.confirm_hill_match(p_match_id uuid) returns boolean
language sql security definer set search_path = '' as $$
  select private.answer_hill_match(p_match_id, true);
$$;

create function public.dispute_hill_match(p_match_id uuid) returns boolean
language sql security definer set search_path = '' as $$
  select private.answer_hill_match(p_match_id, false);
$$;

revoke execute on function
  public.record_hill_match(uuid, public.play_format, uuid[], uuid[], text, timestamptz),
  public.confirm_hill_match(uuid), public.dispute_hill_match(uuid)
  from public, anon;
grant execute on function
  public.record_hill_match(uuid, public.play_format, uuid[], uuid[], text, timestamptz),
  public.confirm_hill_match(uuid), public.dispute_hill_match(uuid)
  to authenticated;
