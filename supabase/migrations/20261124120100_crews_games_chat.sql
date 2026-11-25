-- Crews, games, requests (join a crew, join a game, or play with a player)
-- and in-app chat.
--
-- Anything that touches more than one table (accepting a request adds you to
-- the game and its chat) goes through a function below, so it all happens at
-- once and can't overfill a game. Those functions check who's calling
-- themselves, then run with full rights.

-- ---------------------------------------------------------------------------
-- Crews: standing groups of 2–3 looking to make 4
-- ---------------------------------------------------------------------------

create table public.crews (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(btrim(name)) between 1 and 40),
  home_court_id uuid not null references public.courts (id),
  format        public.play_format not null,
  play_style    public.play_style not null,
  play_times    public.time_slots,
  is_open       boolean not null default true,  -- still looking
  guest_count   int not null default 0 check (guest_count between 0 and 3),  -- regulars not on Bink
  created_by    uuid references public.players (id) on delete set null,
  created_at    timestamptz not null default now()
);

create table public.crew_members (
  crew_id   uuid not null references public.crews (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (crew_id, player_id)
);
create index crew_members_player on public.crew_members (player_id);

-- ---------------------------------------------------------------------------
-- Games: one-off sessions that need 1–3 more players
-- ---------------------------------------------------------------------------

create table public.games (
  id           uuid primary key default gen_random_uuid(),
  court_id     uuid not null references public.courts (id),
  starts_at    timestamptz not null,
  format       public.play_format not null,
  target_level numeric(2, 1) check (target_level between 2.0 and 8.0),
  play_style   public.play_style,
  note         text check (char_length(note) <= 150),
  host_id      uuid not null references public.players (id) on delete cascade,
  guest_count  int not null default 0 check (guest_count between 0 and 3),  -- already playing, not on Bink
  cancelled_at timestamptz,
  created_at   timestamptz not null default now()
);
create index games_upcoming on public.games (starts_at) where cancelled_at is null;
create index games_court on public.games (court_id, starts_at);

create table public.game_players (
  game_id   uuid not null references public.games (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (game_id, player_id)
);
create index game_players_player on public.game_players (player_id);

-- Singles is 2 players, doubles and mixed are 4.
create function private.game_capacity(f public.play_format) returns int
language sql immutable set search_path = '' as $$
  select case when f = 'singles' then 2 else 4 end;
$$;

-- ---------------------------------------------------------------------------
-- Requests: ask to join a crew or game, or ask a player to play
-- ---------------------------------------------------------------------------

create type public.request_status as enum ('pending', 'accepted', 'declined');

create table public.join_requests (
  id           uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.players (id) on delete cascade,
  game_id      uuid references public.games (id) on delete cascade,
  crew_id      uuid references public.crews (id) on delete cascade,
  player_id    uuid references public.players (id) on delete cascade,  -- a play request
  status       public.request_status not null default 'pending',
  created_at   timestamptz not null default now(),
  responded_at timestamptz,
  check (num_nonnulls(game_id, crew_id, player_id) = 1),
  check (player_id is distinct from requester_id)
);
create unique index join_requests_one_pending_game on public.join_requests (requester_id, game_id)
  where status = 'pending' and game_id is not null;
create unique index join_requests_one_pending_crew on public.join_requests (requester_id, crew_id)
  where status = 'pending' and crew_id is not null;
create unique index join_requests_one_pending_player on public.join_requests (requester_id, player_id)
  where status = 'pending' and player_id is not null;
create index join_requests_game on public.join_requests (game_id) where game_id is not null;
create index join_requests_crew on public.join_requests (crew_id) where crew_id is not null;
create index join_requests_player on public.join_requests (player_id) where player_id is not null;

-- ---------------------------------------------------------------------------
-- Chat
-- ---------------------------------------------------------------------------

create type public.conversation_kind as enum ('direct', 'game', 'crew');

create table public.conversations (
  id         uuid primary key default gen_random_uuid(),
  kind       public.conversation_kind not null,
  game_id    uuid unique references public.games (id) on delete cascade,
  crew_id    uuid unique references public.crews (id) on delete cascade,
  direct_key text unique,  -- '<smaller id>:<larger id>' for one-to-one chats
  created_at timestamptz not null default now(),
  check ((kind = 'game') = (game_id is not null)),
  check ((kind = 'crew') = (crew_id is not null)),
  check ((kind = 'direct') = (direct_key is not null))
);

create table public.conversation_members (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  player_id       uuid not null references public.players (id) on delete cascade,
  joined_at       timestamptz not null default now(),
  primary key (conversation_id, player_id)
);
create index conversation_members_player on public.conversation_members (player_id);

create table public.messages (
  id              bigint generated always as identity primary key,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id       uuid not null default auth.uid() references public.players (id) on delete cascade,
  body            text not null check (char_length(btrim(body)) between 1 and 2000),
  sent_at         timestamptz not null default now()
);
create index messages_conversation on public.messages (conversation_id, id desc);

-- ---------------------------------------------------------------------------
-- Helpers used by the access rules (they read past RLS, so they're private)
-- ---------------------------------------------------------------------------

create function private.is_game_player(g uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.game_players where game_id = g and player_id = (select auth.uid()));
$$;

create function private.is_crew_member(c uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.crew_members where crew_id = c and player_id = (select auth.uid()));
$$;

create function private.is_conversation_member(c uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.conversation_members where conversation_id = c and player_id = (select auth.uid()));
$$;

-- You can post if you're a member, the game isn't cancelled, and, in a
-- one-to-one chat, neither of you has blocked the other.
create function private.can_post(c uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.conversations conv
    join public.conversation_members me
      on me.conversation_id = conv.id and me.player_id = (select auth.uid())
    left join public.games g on g.id = conv.game_id
    where conv.id = c
      and g.cancelled_at is null
      and not (conv.kind = 'direct' and exists (
        select 1 from public.conversation_members other
        where other.conversation_id = conv.id
          and other.player_id <> me.player_id
          and private.is_blocked_between(other.player_id, me.player_id)))
  );
$$;

revoke execute on function private.is_game_player(uuid), private.is_crew_member(uuid),
  private.is_conversation_member(uuid), private.can_post(uuid), private.game_capacity(public.play_format)
  from public;
grant execute on function private.is_game_player(uuid), private.is_crew_member(uuid),
  private.is_conversation_member(uuid), private.can_post(uuid), private.game_capacity(public.play_format)
  to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Access rules
-- ---------------------------------------------------------------------------

alter table public.crews enable row level security;
alter table public.crew_members enable row level security;
alter table public.games enable row level security;
alter table public.game_players enable row level security;
alter table public.join_requests enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

-- Signed-out visitors can browse, so crews and upcoming games are public.
create policy "Anyone can read crews" on public.crews
  for select to anon, authenticated using (true);
create policy "Anyone can read crew members" on public.crew_members
  for select to anon, authenticated using (true);
create policy "Members edit their crew" on public.crews
  for update to authenticated using (private.is_crew_member(id)) with check (private.is_crew_member(id));

create policy "Anyone reads upcoming games; players read their own" on public.games
  for select to anon, authenticated
  using ((cancelled_at is null and starts_at > now()) or private.is_game_player(id));
create policy "Anyone reads players of games they can see" on public.game_players
  for select to anon, authenticated
  using (exists (select 1 from public.games g where g.id = game_id));
create policy "Hosts edit their game" on public.games
  for update to authenticated using (host_id = (select auth.uid())) with check (host_id = (select auth.uid()));

create policy "Players see requests they sent or that are for them" on public.join_requests
  for select to authenticated
  using (
    requester_id = (select auth.uid())
    or player_id = (select auth.uid())
    or (game_id is not null and exists (select 1 from public.games g where g.id = game_id and g.host_id = (select auth.uid())))
    or (crew_id is not null and private.is_crew_member(crew_id))
  );

create policy "Members read their conversations" on public.conversations
  for select to authenticated using (private.is_conversation_member(id));
create policy "Members see who's in their conversations" on public.conversation_members
  for select to authenticated using (private.is_conversation_member(conversation_id));
-- In a group chat you don't see messages from someone you've blocked.
create policy "Members read messages, minus people they blocked" on public.messages
  for select to authenticated
  using (
    private.is_conversation_member(conversation_id)
    and not exists (select 1 from public.blocks b
                    where b.blocker_id = (select auth.uid()) and b.blocked_id = sender_id)
  );
create policy "Members post where they're allowed" on public.messages
  for insert to authenticated
  with check (sender_id = (select auth.uid()) and private.can_post(conversation_id));

-- Table privileges: reading is governed by the policies above. All writes go
-- through the functions below, except editing a crew or game and sending a
-- message, which are limited to these columns.
revoke all on public.crews, public.crew_members, public.games, public.game_players,
  public.join_requests, public.conversations, public.conversation_members, public.messages
  from anon, authenticated;
grant select on public.crews, public.crew_members, public.games, public.game_players to anon, authenticated;
grant select on public.join_requests, public.conversations, public.conversation_members, public.messages
  to authenticated;
-- The public read functions mention these tables, so signed-out visitors need
-- the privilege to run them. With no policy for anon they still see no rows.
grant select on public.join_requests, public.conversations to anon;
grant update (name, home_court_id, format, play_style, play_times, is_open) on public.crews to authenticated;
grant update (starts_at, target_level, play_style, note) on public.games to authenticated;
grant insert (conversation_id, body) on public.messages to authenticated;

-- Live chat: Supabase Realtime streams new messages to members (it applies the
-- policies above). The publication only exists on Supabase itself.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Internal helpers for the write functions
-- ---------------------------------------------------------------------------

-- The signed-in player, or an error if not signed in / no profile yet.
create function private.require_player() returns uuid
language plpgsql stable security definer set search_path = '' as $$
declare
  me uuid := auth.uid();
begin
  if me is null then
    raise exception 'Sign in first.' using errcode = '42501';
  end if;
  if not exists (select 1 from public.players where id = me) then
    raise exception 'Finish your profile first.' using errcode = '42501';
  end if;
  return me;
end $$;

create function private.add_to_conversation(c uuid, p uuid) returns void
language sql security definer set search_path = '' as $$
  insert into public.conversation_members (conversation_id, player_id)
  values (c, p) on conflict do nothing;
$$;

-- Opens (or reuses) the one-to-one chat between two players, with both in it.
create function private.open_direct_chat(a uuid, b uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  k text := least(a, b)::text || ':' || greatest(a, b)::text;
  conv uuid;
begin
  insert into public.conversations (kind, direct_key) values ('direct', k)
    on conflict (direct_key) do nothing;
  select id into conv from public.conversations where direct_key = k;
  perform private.add_to_conversation(conv, a);
  perform private.add_to_conversation(conv, b);
  return conv;
end $$;

revoke execute on function private.require_player(), private.add_to_conversation(uuid, uuid),
  private.open_direct_chat(uuid, uuid) from public;

-- ---------------------------------------------------------------------------
-- Games
-- ---------------------------------------------------------------------------

create function public.create_game(
  p_court_id uuid,
  p_starts_at timestamptz,
  p_format public.play_format,
  p_target_level numeric default null,
  p_play_style public.play_style default null,
  p_note text default null,
  p_guest_count int default 0
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := private.require_player();
  new_id uuid;
  conv uuid;
begin
  if p_starts_at <= now() then
    raise exception 'A game has to start in the future.' using errcode = 'check_violation';
  end if;
  if 1 + coalesce(p_guest_count, 0) >= private.game_capacity(p_format) then
    raise exception 'That game is already full.' using errcode = 'check_violation';
  end if;

  insert into public.games (court_id, starts_at, format, target_level, play_style, note, host_id, guest_count)
  values (p_court_id, p_starts_at, p_format, p_target_level, p_play_style, nullif(btrim(p_note), ''), me,
          coalesce(p_guest_count, 0))
  returning id into new_id;

  insert into public.game_players (game_id, player_id) values (new_id, me);
  insert into public.conversations (kind, game_id) values ('game', new_id) returning id into conv;
  perform private.add_to_conversation(conv, me);
  return new_id;
end $$;

create function public.cancel_game(p_game_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := private.require_player();
begin
  update public.games set cancelled_at = now()
   where id = p_game_id and host_id = me and cancelled_at is null;
  if not found then
    raise exception 'Only the host can cancel this game.' using errcode = '42501';
  end if;
  update public.join_requests set status = 'declined', responded_at = now()
   where game_id = p_game_id and status = 'pending';
  return true;
end $$;

create function public.leave_game(p_game_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := private.require_player();
begin
  if exists (select 1 from public.games where id = p_game_id and host_id = me) then
    raise exception 'Hosts can''t leave their own game. Cancel it instead.' using errcode = 'check_violation';
  end if;
  delete from public.game_players where game_id = p_game_id and player_id = me;
  if not found then
    raise exception 'You''re not in this game.' using errcode = 'check_violation';
  end if;
  delete from public.conversation_members
   where player_id = me and conversation_id = (select id from public.conversations where game_id = p_game_id);
  return true;
end $$;

-- ---------------------------------------------------------------------------
-- Crews
-- ---------------------------------------------------------------------------

create function public.create_crew(
  p_name text,
  p_home_court_id uuid,
  p_format public.play_format,
  p_play_style public.play_style,
  p_play_times text[] default '{}',
  p_guest_count int default 1
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := private.require_player();
  new_id uuid;
  conv uuid;
begin
  -- A crew starts with 2 or 3 people (you plus regulars who aren't on Bink).
  if coalesce(p_guest_count, 0) not between 1 and 2 then
    raise exception 'A crew starts with 2 or 3 players: you plus 1 or 2 others.' using errcode = 'check_violation';
  end if;

  insert into public.crews (name, home_court_id, format, play_style, play_times, guest_count, created_by)
  values (btrim(p_name), p_home_court_id, p_format, p_play_style, coalesce(p_play_times, '{}'), p_guest_count, me)
  returning id into new_id;

  insert into public.crew_members (crew_id, player_id) values (new_id, me);
  insert into public.conversations (kind, crew_id) values ('crew', new_id) returning id into conv;
  perform private.add_to_conversation(conv, me);
  return new_id;
end $$;

create function public.set_crew_open(p_crew_id uuid, p_is_open boolean) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := private.require_player();
begin
  if not exists (select 1 from public.crew_members where crew_id = p_crew_id and player_id = me) then
    raise exception 'Only crew members can change this.' using errcode = '42501';
  end if;
  update public.crews set is_open = p_is_open where id = p_crew_id;
  return true;
end $$;

create function public.leave_crew(p_crew_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := private.require_player();
begin
  perform 1 from public.crews where id = p_crew_id for update;
  delete from public.crew_members where crew_id = p_crew_id and player_id = me;
  if not found then
    raise exception 'You''re not in this crew.' using errcode = 'check_violation';
  end if;
  delete from public.conversation_members
   where player_id = me and conversation_id = (select id from public.conversations where crew_id = p_crew_id);
  -- The last Bink member leaving ends the crew.
  if not exists (select 1 from public.crew_members where crew_id = p_crew_id) then
    delete from public.crews where id = p_crew_id;
  end if;
  return true;
end $$;

-- ---------------------------------------------------------------------------
-- Requests
-- ---------------------------------------------------------------------------

create function public.request_to_join_game(p_game_id uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := private.require_player();
  g public.games;
  existing uuid;
  new_id uuid;
begin
  select * into g from public.games where id = p_game_id;
  if g.id is null or g.cancelled_at is not null or g.starts_at <= now() then
    raise exception 'This game isn''t open any more.' using errcode = 'check_violation';
  end if;
  if exists (select 1 from public.game_players where game_id = g.id and player_id = me) then
    raise exception 'You''re already in this game.' using errcode = 'check_violation';
  end if;
  if (select count(*) from public.game_players where game_id = g.id) + g.guest_count
     >= private.game_capacity(g.format) then
    raise exception 'This game is full.' using errcode = 'check_violation';
  end if;

  select id into existing from public.join_requests
   where requester_id = me and game_id = g.id and status = 'pending';
  if existing is not null then
    return existing;
  end if;

  -- A host who has blocked you never sees your request. You aren't told why.
  insert into public.join_requests (requester_id, game_id, status, responded_at)
  select me, g.id,
         case when b then 'declined'::public.request_status else 'pending' end,
         case when b then now() end
  from (select exists (select 1 from public.blocks where blocker_id = g.host_id and blocked_id = me) as b) x
  returning id into new_id;
  return new_id;
end $$;

create function public.request_to_join_crew(p_crew_id uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := private.require_player();
  c public.crews;
  existing uuid;
  new_id uuid;
begin
  select * into c from public.crews where id = p_crew_id;
  if c.id is null or not c.is_open
     or (select count(*) from public.crew_members where crew_id = c.id) + c.guest_count >= 4 then
    raise exception 'This crew isn''t looking for players right now.' using errcode = 'check_violation';
  end if;
  if exists (select 1 from public.crew_members where crew_id = c.id and player_id = me) then
    raise exception 'You''re already in this crew.' using errcode = 'check_violation';
  end if;

  select id into existing from public.join_requests
   where requester_id = me and crew_id = c.id and status = 'pending';
  if existing is not null then
    return existing;
  end if;

  -- Declined silently if any member has blocked you.
  insert into public.join_requests (requester_id, crew_id, status, responded_at)
  select me, c.id,
         case when b then 'declined'::public.request_status else 'pending' end,
         case when b then now() end
  from (select exists (select 1 from public.blocks bl join public.crew_members m on m.player_id = bl.blocker_id
                        where m.crew_id = c.id and bl.blocked_id = me) as b) x
  returning id into new_id;
  return new_id;
end $$;

-- If they've already asked you, your request answers theirs: both are
-- accepted and the one-to-one chat opens.
create function public.request_to_play(p_player_id uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := private.require_player();
  existing uuid;
  theirs uuid;
  new_id uuid;
begin
  if p_player_id = me then
    raise exception 'You can''t send a play request to yourself.' using errcode = 'check_violation';
  end if;
  if not exists (select 1 from public.players where id = p_player_id) then
    raise exception 'That player doesn''t exist.' using errcode = 'check_violation';
  end if;
  if exists (select 1 from public.blocks where blocker_id = me and blocked_id = p_player_id) then
    raise exception 'Unblock this player before asking them to play.' using errcode = 'check_violation';
  end if;

  -- Two players asking each other at the same moment would otherwise each
  -- miss the other's request and both sit waiting. This lock makes requests
  -- between the same two players take turns, so the second always sees the first.
  perform pg_advisory_xact_lock(
    hashtextextended('play:' || least(me, p_player_id)::text || ':' || greatest(me, p_player_id)::text, 0));

  select id into existing from public.join_requests
   where requester_id = me and player_id = p_player_id and status = 'pending';
  if existing is not null then
    return existing;
  end if;

  select id into theirs from public.join_requests
   where requester_id = p_player_id and player_id = me and status = 'pending'
   for update;
  if theirs is not null and not private.is_blocked_between(me, p_player_id) then
    update public.join_requests set status = 'accepted', responded_at = now() where id = theirs;
    perform private.open_direct_chat(me, p_player_id);
    insert into public.join_requests (requester_id, player_id, status, responded_at)
    values (me, p_player_id, 'accepted', now())
    returning id into new_id;
    return new_id;
  end if;

  insert into public.join_requests (requester_id, player_id, status, responded_at)
  select me, p_player_id,
         case when b then 'declined'::public.request_status else 'pending' end,
         case when b then now() end
  from (select exists (select 1 from public.blocks where blocker_id = p_player_id and blocked_id = me) as b) x
  returning id into new_id;
  return new_id;
end $$;

-- Withdraw a request you sent that hasn't been answered.
create function public.cancel_request(p_request_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := private.require_player();
begin
  delete from public.join_requests where id = p_request_id and requester_id = me and status = 'pending';
  return found;
end $$;

-- Accept or decline. The game host, any crew member, or the asked player can
-- answer. Accepting adds the requester to the game or crew and its chat, or
-- opens a one-to-one chat for a play request. Returns the conversation id on
-- accept (null on decline).
create function public.respond_to_request(p_request_id uuid, p_accept boolean) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := private.require_player();
  r public.join_requests;
  g public.games;
  c public.crews;
  conv uuid;
begin
  select * into r from public.join_requests where id = p_request_id for update;
  -- Careful: every branch must be true/false, never null, or `not (...)` lets anyone through.
  if r.id is null
     or not (
       (r.game_id is not null and exists (select 1 from public.games where id = r.game_id and host_id = me))
       or (r.crew_id is not null and exists (select 1 from public.crew_members where crew_id = r.crew_id and player_id = me))
       or coalesce(r.player_id = me, false)
     ) then
    raise exception 'You can''t answer this request.' using errcode = '42501';
  end if;
  if r.status <> 'pending' then
    raise exception 'This request has already been answered.' using errcode = 'check_violation';
  end if;

  if not p_accept then
    update public.join_requests set status = 'declined', responded_at = now() where id = r.id;
    return null;
  end if;

  if r.game_id is not null then
    select * into g from public.games where id = r.game_id for update;  -- one accept at a time
    if g.cancelled_at is not null or g.starts_at <= now() then
      raise exception 'This game isn''t open any more.' using errcode = 'check_violation';
    end if;
    if (select count(*) from public.game_players where game_id = g.id) + g.guest_count
       >= private.game_capacity(g.format) then
      raise exception 'This game is already full.' using errcode = 'check_violation';
    end if;
    insert into public.game_players (game_id, player_id) values (g.id, r.requester_id) on conflict do nothing;
    select id into conv from public.conversations where game_id = g.id;

  elsif r.crew_id is not null then
    select * into c from public.crews where id = r.crew_id for update;
    if (select count(*) from public.crew_members where crew_id = c.id) + c.guest_count >= 4 then
      raise exception 'This crew is already full.' using errcode = 'check_violation';
    end if;
    insert into public.crew_members (crew_id, player_id) values (c.id, r.requester_id) on conflict do nothing;
    -- A full crew stops looking.
    if (select count(*) from public.crew_members where crew_id = c.id) + c.guest_count >= 4 then
      update public.crews set is_open = false where id = c.id;
    end if;
    select id into conv from public.conversations where crew_id = c.id;

  else
    conv := private.open_direct_chat(r.requester_id, me);
  end if;

  perform private.add_to_conversation(conv, r.requester_id);
  update public.join_requests set status = 'accepted', responded_at = now() where id = r.id;
  return conv;
end $$;

-- ---------------------------------------------------------------------------
-- Blocking
-- ---------------------------------------------------------------------------

create function public.block_player(p_player_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := private.require_player();
begin
  if p_player_id = me then
    raise exception 'You can''t block yourself.' using errcode = 'check_violation';
  end if;
  insert into public.blocks (blocker_id, blocked_id) values (me, p_player_id) on conflict do nothing;
  -- Their pending requests to you, your games and your crews are declined.
  update public.join_requests r set status = 'declined', responded_at = now()
   where r.requester_id = p_player_id and r.status = 'pending'
     and (r.player_id = me
          or r.game_id in (select id from public.games where host_id = me)
          or r.crew_id in (select crew_id from public.crew_members where player_id = me));
  return true;
end $$;

create function public.unblock_player(p_player_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := private.require_player();
begin
  delete from public.blocks where blocker_id = me and blocked_id = p_player_id;
  return found;
end $$;

-- ---------------------------------------------------------------------------
-- Activity and chat
-- ---------------------------------------------------------------------------

-- Call when the player opens the app.
create function public.touch_last_active() returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := private.require_player();
begin
  update public.players set last_active_at = now() where id = me;
  return true;
end $$;

-- Runs as the caller, so the message rules above decide whether it's allowed.
create function public.send_message(p_conversation_id uuid, p_body text) returns bigint
language plpgsql security invoker set search_path = '' as $$
declare
  new_id bigint;
begin
  insert into public.messages (conversation_id, body)
  values (p_conversation_id, btrim(p_body))
  returning id into new_id;
  return new_id;
end $$;

-- Only signed-in users can call the write functions.
revoke execute on function
  public.create_game(uuid, timestamptz, public.play_format, numeric, public.play_style, text, int),
  public.cancel_game(uuid), public.leave_game(uuid),
  public.create_crew(text, uuid, public.play_format, public.play_style, text[], int),
  public.set_crew_open(uuid, boolean), public.leave_crew(uuid),
  public.request_to_join_game(uuid), public.request_to_join_crew(uuid), public.request_to_play(uuid),
  public.cancel_request(uuid), public.respond_to_request(uuid, boolean),
  public.block_player(uuid), public.unblock_player(uuid),
  public.touch_last_active(), public.send_message(uuid, text)
  from public, anon;
grant execute on function
  public.create_game(uuid, timestamptz, public.play_format, numeric, public.play_style, text, int),
  public.cancel_game(uuid), public.leave_game(uuid),
  public.create_crew(text, uuid, public.play_format, public.play_style, text[], int),
  public.set_crew_open(uuid, boolean), public.leave_crew(uuid),
  public.request_to_join_game(uuid), public.request_to_join_crew(uuid), public.request_to_play(uuid),
  public.cancel_request(uuid), public.respond_to_request(uuid, boolean),
  public.block_player(uuid), public.unblock_player(uuid),
  public.touch_last_active(), public.send_message(uuid, text)
  to authenticated;
