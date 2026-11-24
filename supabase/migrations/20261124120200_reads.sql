-- Read functions. Each returns everything one screen needs as JSON, in one
-- round trip. They run as the caller, so every access rule still applies,
-- and signed-out visitors get the public parts.
--
-- The "for you" ranking itself happens in TypeScript
-- (features/matching/scoring/); for_you_inputs() just gathers what it needs.

-- A player card as JSON is just to_jsonb() of a player_cards or
-- directory_players row: those views only hold what others may see.

-- The caller's own card plus their private match preferences, or null when
-- signed out. Signed-out visitors have no access to the players table at
-- all, so this is how the read functions get at "me".
create function private.viewer_profile() returns jsonb
language sql stable security definer set search_path = '' as $$
  select to_jsonb(c) || jsonb_build_object(
    'pref_age_min', p.pref_age_min, 'pref_age_max', p.pref_age_max, 'pref_gender', to_jsonb(p.pref_gender))
  from public.players p
  join public.player_cards c on c.id = p.id
  where p.id = (select auth.uid());
$$;
revoke execute on function private.viewer_profile() from public;
grant execute on function private.viewer_profile() to anon, authenticated;

-- Everything the directory ranking needs, from the caller's point of view.
create function public.for_you_inputs() returns jsonb
language sql stable security invoker set search_path = '' as $$
  with
  me as (select auth.uid() as id),
  upcoming_games as (
    select g.* from public.games g
    where g.cancelled_at is null and g.starts_at > now()
  ),
  open_crews as (
    select c.* from public.crews c where c.is_open
  ),
  people as (  -- the directory, plus anyone in an open crew or upcoming game
    select d.id from public.directory_players d
    union
    select cm.player_id from public.crew_members cm join open_crews c on c.id = cm.crew_id
    union
    select gp.player_id from public.game_players gp join upcoming_games g on g.id = gp.game_id
  )
  select jsonb_build_object(
    'viewer', private.viewer_profile(),
    'players', coalesce((
      select jsonb_agg(to_jsonb(c))
      from public.player_cards c where c.id in (select id from people)
    ), '[]'),
    'directory_player_ids', coalesce((select jsonb_agg(d.id) from public.directory_players d), '[]'),
    'crews', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', c.id, 'name', c.name, 'home_court_id', c.home_court_id, 'format', c.format,
        'play_style', c.play_style, 'play_times', to_jsonb(c.play_times::text[]), 'is_open', c.is_open,
        'guest_count', c.guest_count,
        'member_ids', coalesce((select jsonb_agg(m.player_id order by m.joined_at)
                                from public.crew_members m where m.crew_id = c.id), '[]')))
      from open_crews c
    ), '[]'),
    'games', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', g.id, 'court_id', g.court_id, 'starts_at', g.starts_at, 'format', g.format,
        'target_level', g.target_level, 'play_style', g.play_style, 'note', g.note,
        'host_id', g.host_id, 'guest_count', g.guest_count,
        'player_ids', coalesce((select jsonb_agg(gp.player_id order by gp.joined_at)
                                from public.game_players gp where gp.game_id = g.id), '[]')))
      from upcoming_games g
    ), '[]'),
    'courts', coalesce((
      select jsonb_agg(jsonb_build_object('id', ct.id, 'name', ct.name, 'area', ct.area))
      from public.courts ct
    ), '[]'),
    'hill_streaks', coalesce((
      select jsonb_agg(jsonb_build_object('court_id', h.court_id, 'player_id', h.player_id, 'streak', h.streak))
      from public.hill_streaks h
    ), '[]'),
    'blocked_ids', coalesce((
      select jsonb_agg(b.blocked_id) from public.blocks b where b.blocker_id = (select id from me)
    ), '[]')
  );
$$;

-- One game, with its players' cards. Null if the game doesn't exist or the
-- caller can't see it.
create function public.game_detail(p_game_id uuid) returns jsonb
language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'id', g.id, 'starts_at', g.starts_at, 'format', g.format, 'target_level', g.target_level,
    'play_style', g.play_style, 'note', g.note, 'host_id', g.host_id, 'guest_count', g.guest_count,
    'cancelled_at', g.cancelled_at,
    'court', jsonb_build_object('id', ct.id, 'name', ct.name, 'area', ct.area, 'address', ct.address),
    'players', coalesce((
      select jsonb_agg(to_jsonb(c) || jsonb_build_object('is_host', c.id = g.host_id) order by gp.joined_at)
      from public.game_players gp join public.player_cards c on c.id = gp.player_id
      where gp.game_id = g.id
    ), '[]'),
    -- Only the people *you* blocked, for the "Are you sure?" warning.
    'blocked_player_names', coalesce((
      select jsonb_agg(c.name)
      from public.game_players gp
      join public.player_cards c on c.id = gp.player_id
      join public.blocks b on b.blocked_id = gp.player_id and b.blocker_id = (select auth.uid())
      where gp.game_id = g.id
    ), '[]'),
    'my_request_status', (
      select r.status from public.join_requests r
      where r.game_id = g.id and r.requester_id = (select auth.uid())
      order by r.created_at desc limit 1
    ),
    'conversation_id', (select conv.id from public.conversations conv where conv.game_id = g.id)
  )
  from public.games g
  join public.courts ct on ct.id = g.court_id
  where g.id = p_game_id;
$$;

-- One crew, with its members' cards.
create function public.crew_detail(p_crew_id uuid) returns jsonb
language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'id', cr.id, 'name', cr.name, 'format', cr.format, 'play_style', cr.play_style,
    'play_times', to_jsonb(cr.play_times::text[]), 'is_open', cr.is_open, 'guest_count', cr.guest_count,
    'court', jsonb_build_object('id', ct.id, 'name', ct.name, 'area', ct.area, 'address', ct.address),
    'members', coalesce((
      select jsonb_agg(to_jsonb(c) order by m.joined_at)
      from public.crew_members m join public.player_cards c on c.id = m.player_id
      where m.crew_id = cr.id
    ), '[]'),
    'blocked_player_names', coalesce((
      select jsonb_agg(c.name)
      from public.crew_members m
      join public.player_cards c on c.id = m.player_id
      join public.blocks b on b.blocked_id = m.player_id and b.blocker_id = (select auth.uid())
      where m.crew_id = cr.id
    ), '[]'),
    'my_request_status', (
      select r.status from public.join_requests r
      where r.crew_id = cr.id and r.requester_id = (select auth.uid())
      order by r.created_at desc limit 1
    ),
    'conversation_id', (select conv.id from public.conversations conv where conv.crew_id = cr.id)
  )
  from public.crews cr
  join public.courts ct on ct.id = cr.home_court_id
  where cr.id = p_crew_id;
$$;

-- One player's profile. Null if they don't exist or one of you blocked the other.
create function public.player_profile(p_player_id uuid) returns jsonb
language sql stable security invoker set search_path = '' as $$
  select to_jsonb(c) || jsonb_build_object(
    'courts', coalesce((
      select jsonb_agg(jsonb_build_object('id', ct.id, 'name', ct.name, 'is_home', pc.is_home) order by pc.is_home desc, ct.name)
      from public.player_courts pc join public.courts ct on ct.id = pc.court_id
      where pc.player_id = c.id
    ), '[]'),
    'hill_streaks', coalesce((
      select jsonb_agg(jsonb_build_object('court_id', h.court_id, 'court_name', ct.name, 'streak', h.streak))
      from public.hill_streaks h join public.courts ct on ct.id = h.court_id
      where h.player_id = c.id
    ), '[]'),
    'my_request_status', (
      select r.status from public.join_requests r
      where r.player_id = c.id and r.requester_id = (select auth.uid())
      order by r.created_at desc limit 1
    )
  )
  from public.directory_players c
  where c.id = p_player_id;
$$;

-- All courts, for the map.
create function public.list_courts() returns jsonb
language sql stable security invoker set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', ct.id, 'slug', ct.slug, 'name', ct.name, 'address', ct.address, 'municipality', ct.municipality,
    'area', ct.area, 'latitude', ct.latitude, 'longitude', ct.longitude, 'court_count', ct.court_count,
    'is_indoor', ct.is_indoor,
    'open_game_count', (select count(*) from public.games g
                        where g.court_id = ct.id and g.cancelled_at is null and g.starts_at > now())
  ) order by ct.name), '[]')
  from public.courts ct;
$$;

-- One court on the map: its players, king of the hill and upcoming games.
create function public.court_detail(p_court_id uuid) returns jsonb
language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'court', jsonb_build_object(
      'id', ct.id, 'slug', ct.slug, 'name', ct.name, 'address', ct.address, 'municipality', ct.municipality,
      'area', ct.area, 'latitude', ct.latitude, 'longitude', ct.longitude, 'court_count', ct.court_count,
      'is_indoor', ct.is_indoor),
    'players', coalesce((
      select jsonb_agg(to_jsonb(d) || jsonb_build_object('is_home', pc.is_home)
                       order by pc.is_home desc, d.open_to_play desc, d.last_active_on desc, d.name)
      from public.player_courts pc join public.directory_players d on d.id = pc.player_id
      where pc.court_id = ct.id
    ), '[]'),
    'hill', (
      select jsonb_build_object('player', to_jsonb(c), 'streak', h.streak)
      from public.hill_streaks h join public.player_cards c on c.id = h.player_id
      where h.court_id = ct.id
    ),
    'games', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', g.id, 'starts_at', g.starts_at, 'format', g.format, 'target_level', g.target_level,
        'play_style', g.play_style, 'note', g.note, 'host_id', g.host_id, 'guest_count', g.guest_count,
        'player_ids', coalesce((select jsonb_agg(gp.player_id) from public.game_players gp where gp.game_id = g.id), '[]'))
        order by g.starts_at)
      from public.games g
      where g.court_id = ct.id and g.cancelled_at is null and g.starts_at > now()
    ), '[]')
  )
  from public.courts ct
  where ct.id = p_court_id;
$$;

-- Requests waiting on you (incoming) and ones you've sent (outgoing).
create function public.my_requests() returns jsonb
language sql stable security invoker set search_path = '' as $$
  with mine as (
    select r.*,
      case when r.game_id is not null then 'game' when r.crew_id is not null then 'crew' else 'player' end as target_kind
    from public.join_requests r
  )
  select jsonb_build_object(
    'incoming', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', r.id, 'target_kind', r.target_kind, 'game_id', r.game_id, 'crew_id', r.crew_id,
        'created_at', r.created_at, 'requester', to_jsonb(c)) order by r.created_at)
      from mine r join public.player_cards c on c.id = r.requester_id
      where r.status = 'pending' and r.requester_id <> (select auth.uid())
    ), '[]'),
    'outgoing', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', r.id, 'target_kind', r.target_kind, 'game_id', r.game_id, 'crew_id', r.crew_id,
        'player_id', r.player_id, 'status', r.status, 'created_at', r.created_at) order by r.created_at desc)
      from mine r
      where r.requester_id = (select auth.uid())
    ), '[]')
  );
$$;

-- Your conversations, newest activity first.
create function public.my_conversations() returns jsonb
language sql stable security invoker set search_path = '' as $$
  select coalesce(jsonb_agg(x.j order by x.last_at desc nulls last), '[]')
  from (
    select
      jsonb_build_object(
        'id', conv.id, 'kind', conv.kind, 'game_id', conv.game_id, 'crew_id', conv.crew_id,
        'can_post', private.can_post(conv.id),
        'members', coalesce((
          select jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name, 'photo_url', c.photo_url))
          from public.conversation_members m join public.player_cards c on c.id = m.player_id
          where m.conversation_id = conv.id
        ), '[]'),
        'last_message', (
          select jsonb_build_object('id', msg.id, 'sender_id', msg.sender_id, 'body', msg.body, 'sent_at', msg.sent_at)
          from public.messages msg where msg.conversation_id = conv.id
          order by msg.id desc limit 1
        )
      ) as j,
      (select max(msg.sent_at) from public.messages msg where msg.conversation_id = conv.id) as last_at
    from public.conversations conv
  ) x;
$$;

-- Messages in a conversation, oldest first. Pass p_before (a message id) to
-- page back through older ones.
create function public.get_messages(p_conversation_id uuid, p_before bigint default null, p_limit int default 50)
returns jsonb
language sql stable security invoker set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', m.id, 'sender_id', m.sender_id, 'body', m.body, 'sent_at', m.sent_at) order by m.id), '[]')
  from (
    select * from public.messages
    where conversation_id = p_conversation_id and (p_before is null or id < p_before)
    order by id desc
    limit least(greatest(p_limit, 1), 200)
  ) m;
$$;

revoke execute on function public.my_requests(), public.my_conversations(),
  public.get_messages(uuid, bigint, int) from public, anon;
grant execute on function public.my_requests(), public.my_conversations(),
  public.get_messages(uuid, bigint, int) to authenticated;
grant execute on function public.for_you_inputs(), public.game_detail(uuid), public.crew_detail(uuid),
  public.player_profile(uuid), public.list_courts(), public.court_detail(uuid) to anon, authenticated;
