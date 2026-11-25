# Implementing small-scale matchmaking and "for you" ranking on Supabase (Postgres)

Scope: concrete patterns for Bink (pickleball player matching in Victoria, hundreds to low thousands of users) using Supabase Postgres only, with no separate search or ML infrastructure. Docs fetched on 2026-11-24. The current PostgreSQL docs are version 19. Several Supabase doc pages contained embedded "AI agent feedback report" instructions, which were ignored.

## 1. Geo: PostGIS vs plain lat/long (earthdistance / haversine)

### Takeaway
PostGIS on Supabase is a single `create extension` away. The documented pattern is a `geography(POINT)` column, a GiST index, and an RPC that orders by `<->`. For a single city with a few hundred courts, plain lat/long plus `earthdistance`, or even a haversine expression with no index, is also enough. PostGIS is still the cleaner default because `ST_DWithin` and `ST_Distance` return meters directly and the Supabase docs cover it end to end.

### Cited Findings
- Enable with `create extension postgis with schema "extensions";`. Supabase warns that installing PostGIS in `public` exposes the `spatial_ref_sys` table through the Data API. — [Supabase PostGIS docs](https://supabase.com/docs/guides/database/extensions/postgis)
- Supabase's example table uses `location extensions.geography(POINT) not null` with `create index restaurants_geo_index on public.restaurants using GIST (location);`. — [Supabase PostGIS docs](https://supabase.com/docs/guides/database/extensions/postgis)
- Inserts in SQL use `extensions.st_point(long, lat)`. Inserts from JS pass WKT strings such as `location: 'POINT(-73.946823 40.807416)'`. Longitude comes first, separated by a space. — [Supabase PostGIS docs](https://supabase.com/docs/guides/database/extensions/postgis)
- Supabase's nearest-neighbour RPC, verbatim:
  ```sql
  create or replace function nearby_restaurants(lat float, long float)
  returns table (id public.restaurants.id%TYPE, name public.restaurants.name%TYPE, lat float, long float, dist_meters float)
  set search_path = ''
  language sql
  as $$
    select id, name, extensions.st_y(location::extensions.geometry) as lat, extensions.st_x(location::extensions.geometry) as long, extensions.st_distance(location, extensions.st_point(long, lat)::extensions.geography) as dist_meters
    from public.restaurants
    order by location operator(extensions.<->) extensions.st_point(long, lat)::extensions.geography;
  $$;
  ```
  It is called from JS with `supabase.rpc('nearby_restaurants', { lat: 40.807313, long: -73.946713 })`. — [Supabase PostGIS docs](https://supabase.com/docs/guides/database/extensions/postgis)
- Supabase also documents a bounding-box ("in view") function that uses `location operator(extensions.&&) extensions.ST_SetSRID(extensions.ST_MakeBox2D(...), 4326)`. — [Supabase PostGIS docs](https://supabase.com/docs/guides/database/extensions/postgis)
- Selecting a geography column directly returns hex-encoded WKB such as `0101000020E6...`. To get readable lat/long, return `st_x`/`st_y` from a function. — [Supabase PostGIS docs](https://supabase.com/docs/guides/database/extensions/postgis)
- Supabase's PostGIS page has no `ST_DWithin` example. Its radius queries rely on `<->` ordering and `&&` boxes. — [Supabase PostGIS docs](https://supabase.com/docs/guides/database/extensions/postgis)
- `ST_DWithin(geography gg1, geography gg2, double precision distance_meters, boolean use_spheroid = true)`. For geography, units are meters and the spheroid is used by default. `use_spheroid = false` uses a sphere, which is faster. The function "includes a bounding box comparison that makes use of any indexes that are available". — [PostGIS ST_DWithin](https://postgis.net/docs/ST_DWithin.html)
- KNN `<->` uses the GiST index "only when the operator is in the ORDER BY clause", and "Index only kicks in if one of the geometries is a constant". A column reference, subquery or CTE doesn't qualify. For geography, "KNN is based on sphere rather than spheroid". True KNN arrived in PostGIS 2.2.0. The recommended pattern is to order by `<->` with a generous LIMIT in a CTE, then reorder by exact distance outside it. — [PostGIS <-> operator](https://postgis.net/docs/geometry_distance_knn.html)
- `earthdistance` depends on `cube` (`CASCADE` installs both) and assumes "the Earth is perfectly spherical". For more accuracy it points to PostGIS. `earth_box(earth, radius)` supports an indexed search with `cube @>`, but "Some points in this box are further than the specified great circle distance … so a second check using `earth_distance` should be included". The point-based `<@>` operator returns statute miles, its units are hardwired, and it has edge cases near the poles and ±180°. — [PostgreSQL 19 earthdistance](https://www.postgresql.org/docs/current/earthdistance.html)
- Install `cube` and `earthdistance` in a schema where untrusted users have no CREATE privilege. — [PostgreSQL 19 earthdistance](https://www.postgresql.org/docs/current/earthdistance.html)

### Inferences
- Bink's main geo queries are "courts near me" and "players whose home courts are near my home courts". Victoria has at most a few hundred courts, so a sequential scan with `ST_Distance` is sub-millisecond. The index matters little at this scale but costs nothing to add.
- Recommended shape: store `courts.location geography(POINT)` with a GiST index. Filter with `ST_DWithin(c.location, me.location, 10000)`, order by `ST_Distance` or `<->`, and tie-break by id. For player-to-player proximity, join through `player_courts` and use the minimum distance between home courts. That avoids storing player coordinates at all (see section 6).
- `earthdistance` is a valid lighter alternative, but it adds a second extension pair, uses miles for `<@>`, and has no Supabase-specific docs. Haversine in plain SQL is fine at this scale, but it can't use an index and takes more code to maintain.
- Inside `security definer` or `search_path = ''` functions, schema-qualify every PostGIS function and operator, for example `operator(extensions.<->)`, as the Supabase example does.

### Gaps
- I found no Supabase doc stating the PostGIS version bundled in late-2026 images.
- I found no published benchmark comparing earthdistance with PostGIS at small row counts. The claim that the index is unnecessary is an inference from the row counts.

## 2. Ranking: weighted scoring function, RPC security, pagination, tie-breaking

### Takeaway
Write the "for you" score as a `language sql stable` function. Run it as security invoker, the Supabase default, so RLS on `players`, `courts` and matches still applies. Expose it as an RPC that returns `setof` or `table`, and paginate with a keyset on `(score, id)` rather than OFFSET. Use `security definer` only for narrowly scoped helpers, with `search_path = ''` and execute revoked from `anon`/`public`.

### Cited Findings
- Supabase says to "Prefer `security invoker`, which is also the default." It warns that "A `security definer` function can return rows the caller isn't allowed to read." Functions created in the Dashboard or by migrations are owned by `postgres`, which bypasses RLS, and "any role can call them by default, including `anon`." — [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)
- "When you use `security definer`, you must set the `search_path`", and with `search_path = ''` every relation must be schema-qualified. Pinning `search_path` doesn't limit who can call the function, so check ownership in the body and narrow the execute privilege. — [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)
- Revoke pattern: `revoke execute on function public.hello_world from public; revoke execute on function public.hello_world from anon;`. For future functions: `alter default privileges revoke execute on functions from public; alter default privileges in schema public revoke execute on functions from anon, authenticated;`. Then regrant per function with `grant execute on function … to authenticated;`. Remember to grant execute on helpers that RLS policies call. — [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)
- A function `returns setof planets` can be filtered by the client, for example `supabase.rpc('get_planets').eq('id', 1)`. — [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)
- Never create a security definer function in an exposed schema, because the Data API can call it with the creator's privileges. Supabase's examples put such helpers in a `private` schema, for example `private.has_good_role()` with `security definer set search_path = ''`. — [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- RLS performance: wrap `auth.uid()` and similar calls in `(select auth.uid())` so the result is cached per statement. Index policy columns, and use `to authenticated` on policies. — [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Supabase benchmarks (before → after): btree index on the policy column 171 ms → <0.1 ms; `(select auth.uid())` 179 ms → 9 ms; `(select is_admin()) OR …` 11,000 ms → 10 ms; security definer helper `team_id=any(array(select user_teams()))` 173,000 ms → 16 ms; adding an explicit client filter `.eq('user_id',userId)` 171 ms → 9 ms; rewriting a join as `team_id in (select team_id from team_user where user_id = auth.uid())` 9,000 ms → 20 ms; `TO authenticated` 170 ms → <0.1 ms for anon. — [Supabase RLS performance troubleshooting](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv)
- OFFSET makes the database "fetch these rows from the disk and bring them in order before it can send the following ones". Keyset ("seek") filters on the last-seen key, is faster, and "solves the problem of drifting results" when rows change between pages. Its drawbacks are that you can't jump to an arbitrary page and the client must pass the full keyset. — [Use The Index, Luke: No Offset](https://use-the-index-luke.com/no-offset)

### Inferences
- Suggested scoring function (illustrative, not taken from a source). It uses min-max-style components in [0,1] and weights stored in a small `ranking_weights` table, so you can tune them without a migration:
  ```sql
  create or replace function public.for_you(p_limit int default 20,
                                            p_after_score float8 default null,
                                            p_after_id uuid default null)
  returns table (player_id uuid, score float8, km float8)
  language sql stable security invoker set search_path = ''
  as $$
    with me as (select * from public.players where id = (select auth.uid())),
    cand as (
      select p.id,
        1 - least(abs(p.skill - me.skill) / 1.5, 1)              as s_skill,   -- 2.0-5.0 scale
        (p.play_style = me.play_style)::int                     as s_style,
        coalesce(public.shared_home_courts(p.id, me.id), 0)      as s_court,    -- 0..1
        public.time_overlap(p.usual_times, me.usual_times)      as s_time,     -- 0..1
        public.min_home_court_km(p.id, me.id)                   as km
      from public.players p, me
      where p.id <> me.id
        and not exists (select 1 from public.blocks b
                        where (b.blocker = me.id and b.blocked = p.id)
                           or (b.blocker = p.id and b.blocked = me.id))
    )
    select id, round((0.35*s_skill + 0.15*s_style + 0.30*s_court + 0.20*s_time
                      - 0.02*coalesce(km,20))::numeric, 6)::float8 as score, km
    from cand
    where p_after_score is null
       or (round(...)::float8, id) < (p_after_score, p_after_id)   -- keyset
    order by score desc, id desc
    limit p_limit;
  $$;
  ```
  Key points: (a) `order by score desc, id desc` gives a deterministic total order because `id` is unique. (b) Round the score so floating-point noise can't reorder rows between calls. (c) Postgres row-value comparison `(score, id) < (x, y)` implements the keyset. Because the score is computed rather than indexed, keyset here is for stability, not speed.
- Computed scores drift as players update their profiles or log matches, so even keyset pages can shift. For a stable "for you" session, consider snapshotting the ranked id list per user, in a table or a materialized view refreshed by cron (section 5), and paginating over that snapshot.
- Security invoker plus the planned policy ("signed-in users can read players, courts and confirmed matches") is enough for ranking, because every input is readable by `authenticated`. Use security definer only if the ranking needs data users must not read directly, such as other users' block lists or exact coordinates. In that case put it in `private`, return only safe columns, and grant execute to `authenticated` only.
- At hundreds to low thousands of players, scoring every candidate on each call is cheap. Pre-filter by area or distance first anyway, so cost stays bounded.

### Gaps
- Supabase's functions page doesn't document `.range()`, `.order()` or `.limit()` on RPC results, though they are standard PostgREST features. I didn't verify the RPC-specific behaviour.
- I found no credible published dating-app or matchmaking engineering write-up that shows a Postgres SQL scoring function in production. The weights above are illustrative.

## 3. Embeddings (pgvector) and collaborative filtering

### Takeaway
pgvector is available on Supabase, but it is overkill for Bink's structured attributes: skill number, enum play style, area, time slots and court ids. These are better scored with explicit SQL arithmetic that you can explain to users. If vectors are ever used, they are small enough at this scale for exact search with no ANN index.

### Cited Findings
- Enable with `create extension vector with schema extensions;`. Columns are declared like `embedding extensions.vector(384)`. The 384 dimensions match Supabase's `gte-small` model. — [Supabase pgvector docs](https://supabase.com/docs/guides/database/extensions/pgvector)
- With HNSW or IVFFlat indexes, filtering is applied after the index scan, so filtered queries "can return fewer rows" than requested. Supabase suggests iterative search to fix this. — [Supabase pgvector docs](https://supabase.com/docs/guides/database/extensions/pgvector)
- "By default, pgvector performs exact nearest neighbor search, which provides perfect recall." Operators: `<->` L2, `<#>` negative inner product, `<=>` cosine, `<+>` L1, `<~>` Hamming, `<%>` Jaccard. HNSW has better speed-recall than IVFFlat but builds more slowly and uses more memory. Example caveat: if a filter matches 10% of rows, HNSW with the default `ef_search` of 40 returns about 4 rows. Iterative scans (`hnsw.iterative_scan = strict_order | relaxed_order`) mitigate this. The current release is v0.8.7. — [pgvector GitHub](https://github.com/pgvector/pgvector)

### Inferences
- With fewer than about 5,000 player rows, a brute-force `order by embedding <=> q limit 20` is a trivial scan. ANN indexes only add the recall and filtering pitfalls above.
- A hand-built "feature vector" (skill, style one-hot, time-slot bitmap) in pgvector gives no advantage over the SQL score in section 2. It is harder to explain and to weight. Embeddings only help for free text, such as bios ("looking for a doubles partner who drills"), and even then that is an optional extra.
- Collaborative filtering on small data: the cold-start problem dominates. With hundreds of users and sparse interactions (likes, confirmed matches), matrix factorization is unreliable. A practical SQL-only approach is item-item or user-user co-occurrence. Example: "players who played with people you played with" via a 2-hop join on `hill_matches`, or "players at your home courts who also play with your partners", counted and normalized, added as one more weighted term in the score. This is an inference. I found no source benchmarking collaborative filtering at this scale.

### Gaps
- I found no authoritative source quantifying when collaborative filtering becomes useful (the minimum number of interactions per user). This recommendation rests on general reasoning.
- Supabase's pgvector page doesn't state the bundled pgvector version or give a guideline on when exact search is enough.

## 4. Mutual interest: likes/requests, unique pairs, triggers, blocking, rate limits

### Takeaway
Use a directed `play_requests` (or `likes`) table with `primary key (from_id, to_id)` and `check (from_id <> to_id)`. Use a separate undirected `connections` table with a unique index on `(least(a,b), greatest(a,b))`. Detect mutual interest with an AFTER INSERT trigger that inserts the connection with `on conflict do nothing`. Model blocks as their own table, checked in RLS and in the ranking function.

### Cited Findings
- For "one row per unordered pair", the standard Postgres pattern is `CREATE UNIQUE INDEX ON atable (LEAST(m1, m2), GREATEST(m1, m2)); ALTER TABLE atable ADD CHECK (m1 <> m2);`, suggested by Laurenz Albe (Cybertec). — [pgsql thread, Laurenz Albe](https://postgresql.org/message-id/ee16ca6cf1f4b8177e32f9aeac61c5647a603942.camel%40cybertec.at)
- Expressions aren't allowed in a table UNIQUE constraint, only in a unique index. An alternative is an exclusion constraint `EXCLUDE USING btree (least(u1,u2) WITH =, greatest(u1,u2) WITH =)`. `LEAST`/`GREATEST` ignore NULLs, so make the columns NOT NULL. — [Stack Overflow mirror: two-way unique](https://backiee.wasmer.app/https_stackoverflow_com/questions/30036837/postgresql-enforce-unique-two-way-combination-of-columns); [pgsql thread "Constraint for two fields unique any order"](https://www.postgresql.org/message-id/1153329184.29063.131.camel%40tallac.gene.com)
- Supabase's Broadcast-from-database helper `realtime.broadcast_changes()` is called from a `SECURITY DEFINER SET search_path = ''` trigger function, which is the same shape a "mutual match" trigger would use (see section 5). — [Supabase Realtime Broadcast](https://supabase.com/docs/guides/realtime/broadcast)

### Inferences
- Illustrative schema (not from a source):
  ```sql
  create table public.play_requests (
    from_id uuid not null references public.players(id) on delete cascade,
    to_id   uuid not null references public.players(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (from_id, to_id),
    check (from_id <> to_id)
  );
  create index on public.play_requests (to_id, from_id);   -- reverse lookup

  create table public.connections (
    a uuid not null, b uuid not null,
    created_at timestamptz not null default now(),
    check (a < b), primary key (a, b)                       -- canonical ordering
  );

  create function private.on_request() returns trigger
  language plpgsql security definer set search_path = '' as $$
  begin
    if exists (select 1 from public.play_requests
               where from_id = new.to_id and to_id = new.from_id) then
      insert into public.connections(a,b)
      values (least(new.from_id,new.to_id), greatest(new.from_id,new.to_id))
      on conflict do nothing;
    end if;
    return null;
  end $$;
  create trigger trg_request after insert on public.play_requests
    for each row execute function private.on_request();
  ```
  Storing `a < b` with a CHECK is equivalent to the LEAST/GREATEST unique index, and it lets you use a plain primary key.
- Race condition: if A and B like each other simultaneously, each trigger may miss the other's uncommitted row under READ COMMITTED, so no connection is created. Mitigations: take `pg_advisory_xact_lock(hashtext(least||greatest))` in the trigger, or run a periodic reconciliation job (`insert … select … from play_requests r1 join play_requests r2 on … on conflict do nothing`) via pg_cron. This is an inference from Postgres MVCC semantics, not a sourced recipe.
- RLS for requests: `insert … with check (from_id = (select auth.uid()))`. Allow select for `from_id` or `to_id` = me. That hides who-liked-whom from third parties. A request recipient can see pending requests, which is intended for Bink's "request to play" flow.
- Blocking: `blocks(blocker, blocked, primary key(blocker, blocked))`. Add a `not exists (blocks either direction)` clause to (a) the RLS select policy on `players`, or at least to the ranking RPC, (b) the insert policy on `play_requests`, and (c) any messaging. Reading the other user's block rows requires a security definer helper in `private`, so the blocked user can't discover the block.
- Hiding or snoozing: a `hidden(user_id, hidden_id, until timestamptz)` table, filtered only in the ranking function.
- Rate limits at small scale, with no Redis: a BEFORE INSERT trigger that counts `play_requests where from_id = new.from_id and created_at > now() - interval '1 day'` and raises an exception above N. It is cheap with the `(from_id, created_at)` index. This is an inference. I didn't fetch the Supabase rate-limiting docs.

### Gaps
- I found no Supabase-official or credible engineering post on a dating-app-style mutual-like trigger. The pattern above is assembled from general Postgres practice.
- I didn't verify Supabase's own rate-limiting guidance (Edge Functions plus Redis examples).

## 5. Precomputation and delivery: views, materialized views, pg_cron, Edge Functions, Realtime

### Takeaway
At Bink's scale, compute rankings and win streaks live in regular views or functions. Reach for a materialized view refreshed by Supabase Cron only if a query measurably slows. Edge Functions suit external calls (push notifications, DUPR lookups), not scoring. For "new match" and "request accepted" notifications, Supabase now recommends Broadcast from a database trigger on private per-user topics over Postgres Changes.

### Cited Findings
- `REFRESH MATERIALIZED VIEW CONCURRENTLY` needs "at least one UNIQUE index on the materialized view which uses only column names and includes all rows" (no expression or partial index). The view must already be populated, and only one refresh can run at a time. Without CONCURRENTLY a refresh "could block other connections which are trying to read". CONCURRENTLY "may be faster in cases where a small number of rows are affected", and the plain form is faster when many rows change. — [PostgreSQL 19 REFRESH MATERIALIZED VIEW](https://www.postgresql.org/docs/current/sql-refreshmaterializedview.html)
- Views bypass RLS by default because the `postgres` user creates them. On Postgres 15+ use `create view … with (security_invoker = true)` so the underlying tables' RLS applies. On older versions, revoke access from `anon`/`authenticated` or put the view in an unexposed schema. — [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Supabase Cron is built on `pg_cron`. Jobs live in `cron.job`, with history in `cron.job_run_details`. Jobs run "anywhere from every second to once a year", can run SQL or functions "with zero network latency", or can make HTTP requests that invoke Edge Functions. Supabase recommends "no more than 8 Jobs run concurrently" and that "Each Job should run no more than 10 minutes." — [Supabase Cron](https://supabase.com/docs/guides/cron)
- Edge Function limits: 256 MB memory; wall clock 150 s (Free) or 400 s (paid); **2 s CPU time** per worker, excluding async I/O; 150 s request idle timeout (then 504); 100/1,000/2,000 functions on Free/Pro/Team; 30 nested calls per trace per 60 s. — [Supabase Edge Function limits](https://supabase.com/docs/guides/functions/limits)
- Realtime: Broadcast is "the recommended method for scalability and security". Postgres Changes "requires less setup, but does not scale as well". — [Supabase: Subscribing to database changes](https://supabase.com/docs/guides/realtime/subscribing-to-database-changes)
- Postgres Changes "authorizes every event against each subscriber" (100 subscribers means 100 checks per change). Changes are "processed on a single thread to preserve their order", so bigger compute doesn't help much. Above about 3,000 concurrent subscribers, use Broadcast. Filters use the form `column=eq.value`, AND-only. DELETE filtering and old records need `replica identity full`, and RLS isn't applied to DELETE events. Tables are added with `alter publication supabase_realtime add table …`. — [Supabase Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)
- Database-side broadcast: `select realtime.send(payload => jsonb_build_object(...), event => 'event', topic => 'topic', private => true);`. `private` must match the client channel. `realtime.broadcast_changes(topic, event, op, table, schema, new, old)` is used in a `SECURITY DEFINER SET search_path = ''` trigger. Messages in `realtime.messages` are kept in daily partitions and deleted after 3 days. A client must have connected that day, which creates the partition, or the insert warns with `WarnSendingBroadcastMessage`. — [Supabase Realtime Broadcast](https://supabase.com/docs/guides/realtime/broadcast)
- Realtime Authorization: private channels are controlled by RLS on `realtime.messages`, using `(select realtime.topic())` and `realtime.messages.extension in ('broadcast'|'presence')`. Policies are evaluated at join time and cached for the connection, so revocation takes effect only on JWT refresh or expiry. Enforcing private channels requires disabling "Allow public access". Don't run `ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY`, because it fails with `42501` and aborts migrations. — [Supabase Realtime Authorization](https://supabase.com/docs/guides/realtime/authorization)

### Inferences
- Win streaks: a regular `security_invoker` view over `hill_matches where confirmed` is correct and simple. A gaps-and-islands window query over a few thousand matches is fast. A materialized view can't carry RLS policies (an inference from Postgres, where policies attach to tables), and it is readable by anyone with a grant. If you materialize, keep it in a non-exposed schema or hold only public data.
- A materialized view of precomputed "for you" scores would be per-viewer (N×N pairs). At 2,000 users that is 4M rows, which is wasteful. Prefer computing on demand, or a per-user snapshot table written only when that user opens the feed.
- Notification flow: in the `connections` insert trigger, call `realtime.send(jsonb_build_object('with', other_id), 'match', 'user:' || a, true)` and the same for `b`. Add a select policy on `realtime.messages` such as `(select realtime.topic()) = 'user:' || (select auth.uid())::text`. That policy is an extrapolation and needs testing. For push notifications while the app is closed, use a Database Webhook or `pg_net` call to an Edge Function that calls APNs/FCM.
- Use pg_cron for: nightly mutual-like reconciliation, recomputing cached skill estimates from confirmed matches, expiring stale requests, and purging `cron.job_run_details`.

### Gaps
- I found no Supabase statement of message-size limits or per-project Broadcast rate limits on the pages fetched. A separate Realtime Limits page exists but wasn't read.
- The `cron.schedule` syntax and the seconds syntax (for example `'30 seconds'`) weren't shown on the fetched Supabase page. They are documented in the pg_cron README, which wasn't fetched.

## 6. Privacy and safety with location

### Takeaway
Don't store player GPS at all. Bink's court-first model lets player location be derived from public court locations plus a coarse "area". Only courts need coordinates. Expose distances, not coordinates, through invoker-safe RPCs. Supabase discourages column-level privileges for most users and points to separate tables and RLS instead.

### Cited Findings
- Supabase says column privileges are advanced: "We do not recommend using column-level privileges for most users." Once a column is revoked, the role can't use `select *`, and inserts and updates touching it fail. Table-level grants must be revoked before column-level grants take effect, for example `revoke update on table public.posts from authenticated; grant update (title, content) on table public.posts to authenticated;`. — [Supabase Column Level Security](https://supabase.com/docs/guides/database/postgres/column-level-security)
- Views need `security_invoker = true` (PG15+) to respect RLS. Otherwise they run as their owner (`postgres`) and bypass it. — [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- A security definer function "can return rows the caller isn't allowed to read". This is the mechanism for returning a derived value (distance) from a hidden table, as long as the function returns only safe columns. — [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)
- Don't base authorization on `user_metadata`, which users can change. Use `app_metadata`. — [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- A table in an exposed schema with RLS disabled is readable and writable by any role with a grant. Adding policies doesn't remove existing grants. — [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security)

### Inferences
- Pattern: `public.players` holds only public profile fields (name, skill, style, area label, usual times). Any sensitive data (exact home location if ever collected, phone, DOB) goes in `private.player_private` or a `public` table with owner-only RLS. Cross-user use happens only through a `private` security definer function that returns `distance_km` rounded to, say, 0.5 km. This is simpler and safer than column grants.
- Fuzzing: if a player location is ever stored, snap it to a grid (for example `ST_SnapToGrid` on geometry at about 0.01°, roughly 1 km) or store only a neighbourhood or area id. Round displayed distances and set a floor ("<1 km"). Rounding alone doesn't stop trilateration if an attacker can query from arbitrary points. Bink's RPCs should compute distance from the caller's own stored home courts, not from a lat/long the client passes in. This is an inference. I fetched no specific source on trilateration attacks.
- Court locations are public places, so exposing their coordinates is fine. Linking a player to home courts plus usual play times does reveal where and when someone can be found. Consider making `player_courts` visible only to connections, or show only a court count to non-connections.

### Gaps
- I didn't fetch authoritative sources on location-privacy attacks (trilateration on dating apps) or PostGIS `ST_SnapToGrid` docs. The fuzzing guidance above is unsourced reasoning.

## 7. Testing: pgTAP and the Supabase CLI

### Takeaway
Put pgTAP tests in `supabase/tests/database/*.sql` and run them with `supabase test db` against the local stack. To test RLS and the ranking RPC, impersonate users with `set local role authenticated` and JWT claims inside a transaction that rolls back, or use the community `supabase_test_helpers`.

### Cited Findings
- `supabase test db` runs pgTAP tests from `./supabase/tests/database/*.sql`. Example skeleton: `begin; select plan(1); select has_column('auth','users','id','id should exist'); select * from finish(); rollback;`. — [Supabase Testing Overview](https://supabase.com/docs/guides/database/testing)
- Supabase's pgTAP page lists RLS assertions `policies_are()`, `policy_roles_are()`, `policy_cmd_is()`, `results_eq()` and `results_ne()`, plus `has_table`, `has_index`, `has_column`, `col_is_pk`, `function_returns` and `is_definer()`. The last is useful for asserting that the ranking RPC is **not** security definer. — [Supabase pgTAP docs](https://supabase.com/docs/guides/database/extensions/pgtap)

### Inferences
- Typical RLS test pattern (standard Postgres/Supabase practice, not shown on the fetched pages):
  ```sql
  begin; select plan(3);
  insert into auth.users(id, email) values ('…a', 'a@x'), ('…b', 'b@x');
  -- seed players, courts, matches as postgres
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"…a","role":"authenticated"}';
  select results_eq('select count(*) from hill_matches where not confirmed', $$values(0::bigint)$$,
                    'unconfirmed matches are hidden');
  select throws_ok($$insert into play_requests(from_id,to_id) values ('…b','…a')$$, '42501');
  select ok((select score from for_you() limit 1) is not null, 'ranking returns rows');
  select * from finish(); rollback;
  ```
- Ranking tests: seed fixed players with known skills, styles and courts. Assert exact order with `results_eq('select player_id from for_you(5)', $$values(...)$$)`. Assert determinism by calling twice. Assert keyset pagination with page 2 using page 1's last `(score, id)`, checking for no overlap and no gaps. Assert that blocked users never appear.
- The community Basejump `supabase_test_helpers` (installed via database.dev) provides `tests.create_supabase_user`, `tests.authenticate_as`, `tests.clear_authentication` and `tests.rls_enabled`. These names come from memory. The Supabase "advanced pgTAP testing" URL I tried returned 404, so verify them before relying on them.

### Gaps
- The Supabase page that documents role switching and test helpers (advanced pgTAP testing) returned 404 at the URL tried. Its current location and contents are unverified.
- I found no Supabase source confirming the default Postgres major version for new projects in late 2026. The `security_invoker` views need PG15+, and Supabase projects have been on PG15+ for years, but the exact current default is unverified.
