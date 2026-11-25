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
              play_times, open_to_play, area, pref_age_min, pref_age_max, pref_gender)
  on public.players to authenticated;
-- Birth date can't be changed after sign-up; last_active_at is set by touch_last_active().
grant update (name, photo_url, bio, gender, skill, dupr, play_style, formats, play_times,
              open_to_play, area, pref_age_min, pref_age_max, pref_gender)
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

alter table public.player_courts enable row level security;
create policy "Anyone can read player courts" on public.player_courts
  for select to anon, authenticated using (true);
create policy "Players add their own courts" on public.player_courts
  for insert to authenticated with check (player_id = (select auth.uid()));
create policy "Players edit their own courts" on public.player_courts
  for update to authenticated using (player_id = (select auth.uid())) with check (player_id = (select auth.uid()));
create policy "Players remove their own courts" on public.player_courts
  for delete to authenticated using (player_id = (select auth.uid()));
revoke all on public.player_courts from anon;
grant select on public.player_courts to anon;

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
  (select pc.court_id from public.player_courts pc where pc.player_id = p.id and pc.is_home) as home_court_id,
  coalesce(
    (select array_agg(pc.court_id order by pc.court_id) from public.player_courts pc where pc.player_id = p.id),
    '{}'
  ) as court_ids
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

create table public.hill_matches (
  id               uuid primary key default gen_random_uuid(),
  court_id         uuid not null references public.courts (id) on delete cascade,
  winner_id        uuid not null references public.players (id) on delete cascade,
  loser_id         uuid not null references public.players (id) on delete cascade,
  score            text not null check (char_length(score) between 1 and 40),
  played_at        timestamptz not null default now(),
  winner_confirmed boolean not null default false,
  loser_confirmed  boolean not null default false,
  recorded_by      uuid not null references public.players (id) on delete cascade,
  created_at       timestamptz not null default now(),
  check (winner_id <> loser_id),
  check (recorded_by in (winner_id, loser_id))
);
create index hill_matches_court on public.hill_matches (court_id, played_at desc);

alter table public.hill_matches enable row level security;
create policy "Anyone reads confirmed results; players read their own" on public.hill_matches
  for select to anon, authenticated
  using ((winner_confirmed and loser_confirmed) or (select auth.uid()) in (winner_id, loser_id));
-- Either player records a result, confirming only their own side.
create policy "Players record their own results" on public.hill_matches
  for insert to authenticated
  with check (
    recorded_by = (select auth.uid())
    and (select auth.uid()) in (winner_id, loser_id)
    and (not winner_confirmed or winner_id = (select auth.uid()))
    and (not loser_confirmed or loser_id = (select auth.uid()))
  );
revoke all on public.hill_matches from anon;
grant select on public.hill_matches to anon;
revoke update, delete, truncate on public.hill_matches from authenticated;  -- use confirm_hill_match()

-- The current king of each court and their streak, from confirmed results only.
create view public.hill_streaks with (security_barrier = true) as
with confirmed as (
  select court_id, winner_id,
         row_number() over (partition by court_id order by played_at desc, created_at desc) as rn
  from public.hill_matches
  where winner_confirmed and loser_confirmed
),
kings as (
  select court_id, winner_id as player_id from confirmed where rn = 1
)
select k.court_id, k.player_id,
       (select count(*) from confirmed c
         where c.court_id = k.court_id
           and c.rn < coalesce((select min(c2.rn) from confirmed c2
                                 where c2.court_id = k.court_id and c2.winner_id <> k.player_id),
                               2147483647))::int as streak
from kings k;

revoke all on public.hill_streaks from anon, authenticated;
grant select on public.hill_streaks to anon, authenticated;

create function public.confirm_hill_match(p_match_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := auth.uid();
begin
  update public.hill_matches
     set winner_confirmed = winner_confirmed or winner_id = me,
         loser_confirmed  = loser_confirmed  or loser_id  = me
   where id = p_match_id and me in (winner_id, loser_id);
  if not found then
    raise exception 'You can only confirm results you played in.' using errcode = '42501';
  end if;
  return true;
end $$;
revoke execute on function public.confirm_hill_match(uuid) from public, anon;
grant execute on function public.confirm_hill_match(uuid) to authenticated;
