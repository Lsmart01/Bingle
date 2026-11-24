-- King of the Court, version 1.
-- Not applied anywhere yet: the app uses a local JSON file until Supabase is
-- connected (see features/king-of-the-hill/store.ts). These tables match the
-- types in features/king-of-the-hill/types.ts.
--
-- Access rules (row level security) are left for when sign-in exists, since
-- they depend on auth.uid(). Sketch of what they need to enforce:
--   games insert: the signed-in player is logged_by and is on team_a
--   games update: only a team_b player, and only from 'pending'
--   crowns: written by the server only

create table players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);

create table courts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);

create type game_format as enum ('singles', 'doubles');
create type game_status as enum ('pending', 'confirmed', 'disputed');

create table games (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references courts (id),
  format game_format not null,
  -- team_a is the side that logged the game; team_b confirms or disputes it.
  team_a uuid[] not null,
  team_b uuid[] not null,
  score_a int not null check (score_a >= 0),
  score_b int not null check (score_b >= 0),
  status game_status not null default 'pending',
  logged_by uuid not null references players (id),
  played_at timestamptz not null default now(),
  responded_by uuid references players (id),
  responded_at timestamptz,

  constraint team_sizes check (
    cardinality(team_a) = case format when 'singles' then 1 else 2 end
    and cardinality(team_b) = cardinality(team_a)
  ),
  -- Games go to 11, win by 2.
  constraint valid_score check (
    greatest(score_a, score_b) >= 11
    and (
      (greatest(score_a, score_b) = 11 and least(score_a, score_b) <= 9)
      or (greatest(score_a, score_b) > 11 and abs(score_a - score_b) = 2)
    )
  )
);

create index games_board on games (court_id, format, played_at) where status = 'confirmed';

-- One row per spell at first place. ended_at is null while it's still held.
create table crowns (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references courts (id),
  format game_format not null,
  player_ids uuid[] not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

-- Only one current crown per court and format.
create unique index one_current_crown on crowns (court_id, format) where ended_at is null;
