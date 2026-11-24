-- Local development data only. Never run this against the live project.
--
-- Courts are real Greater Victoria public pickleball sites from
-- reports/Victoria BC pickleball courts.md (November 2026). The research found
-- no source for coordinates, so latitude/longitude here are APPROXIMATE and
-- must be geocoded before the map goes live. Closed sites (Tolmie, Wain Road,
-- Todd) are left out.
--
-- Players, crews and games are made up. Player ids are
-- 00000000-0000-4000-a000-0000000000NN, and every seed login is
-- player-NN@bink.test.

insert into public.courts (slug, name, address, municipality, area, latitude, longitude, court_count, is_indoor) values
  -- City of Victoria
  ('topaz-park',          'Topaz Park',                        '841 Finlayson St',        'Victoria',        'Victoria',      48.4405, -123.3570, 11, false),
  ('beacon-hill-park',    'Beacon Hill Park',                  '100 Cook St',             'Victoria',        'Victoria',      48.4120, -123.3610,  3, false),
  ('franklin-green',      'Franklin Green',                    '1045 Mason St',           'Victoria',        'Victoria',      48.4290, -123.3545,  1, false),
  ('central-park',        'Central Park',                      '2275 Quadra St',          'Victoria',        'Victoria',      48.4315, -123.3580,  2, false),
  ('oaklands-park',       'Oaklands Park',                     '1550 Kings Rd',           'Victoria',        'Victoria',      48.4445, -123.3380,  2, false),
  ('barnard-park',        'Barnard Park (Vic West)',           '300 Barnard Ave',         'Victoria',        'Victoria',      48.4285, -123.3850,  2, false),
  ('james-bay-community', 'James Bay Community School Centre', '140 Oswego St',           'Victoria',        'Victoria',      48.4160, -123.3790,  3, true),
  -- Esquimalt
  ('archie-browning',     'Archie Browning Sports Centre',     '1151 Esquimalt Rd',       'Esquimalt',       'Esquimalt',     48.4310, -123.4090,  4, true),
  ('esquimalt-rec',       'Esquimalt Recreation Centre',       '527 Fraser St',           'Esquimalt',       'Esquimalt',     48.4315, -123.4150,  2, true),
  ('esquimalt-high',      'Esquimalt High School',             '847 Colville Rd',         'Esquimalt',       'Esquimalt',     48.4370, -123.4115,  2, false),
  -- Saanich
  ('fowler-park',         'Fowler Park',                       'Cordova Bay',             'Saanich',         'Saanich',       48.5110, -123.3730,  6, false),
  ('mcminn-park',         'McMinn Park',                       '4722 Lochside Dr',        'Saanich',         'Saanich',       48.5150, -123.3800,  4, false),
  ('copley-west-park',    'Copley West Park',                  '598 Parkridge St',        'Saanich',         'Saanich',       48.4720, -123.3960,  2, false),
  ('hampton-park',        'Hampton Park',                      '224 Hampton Rd',          'Saanich',         'Saanich',       48.4505, -123.3925,  2, false),
  ('rosedale-park',       'Rosedale Park',                     '4100 Santa Anita Ave',    'Saanich',         'Saanich',       48.4815, -123.3420,  2, false),
  ('prospect-lake-park',  'Prospect Lake Park',                'Prospect Lake',           'Saanich',         'Saanich',       48.5200, -123.4400,  2, false),
  ('commonwealth-place',  'Saanich Commonwealth Place',        '4636 Elk Lake Dr',        'Saanich',         'Saanich',       48.4990, -123.3945, null, true),
  ('pearkes-rec',         'G.R. Pearkes Rec Centre',           '3100 Tillicum Rd',        'Saanich',         'Saanich',       48.4510, -123.3965,  4, true),
  ('cedar-hill-rec',      'Cedar Hill Rec Centre',             '3220 Cedar Hill Rd',      'Saanich',         'Saanich',       48.4535, -123.3430,  2, true),
  ('uvic-carsa',          'UVic CARSA Fieldhouse',             'University of Victoria',  'Saanich',         'Saanich',       48.4655, -123.3105,  8, true),
  -- Oak Bay
  ('carnarvon-park',      'Carnarvon Park',                    '2801 Henderson Rd',       'Oak Bay',         'Oak Bay',       48.4440, -123.3160,  5, false),
  ('henderson-rec',       'Henderson Recreation Centre',       '2291 Cedar Hill Cross Rd','Oak Bay',         'Oak Bay',       48.4520, -123.3210,  4, true),
  -- Saanich Peninsula
  ('centennial-sport-box','Centennial Park Multi-Sport Box',   '1859 Hovey Rd',           'Central Saanich', 'Peninsula',     48.5965, -123.4185,  4, false),
  ('iroquois-park',       'Iroquois Park',                     '2295 Ocean Ave',          'Sidney',          'Peninsula',     48.6505, -123.3985,  1, false),
  ('greenglade',          'Greenglade Community Centre',       '2151 Lannon Way',         'North Saanich',   'Peninsula',     48.6630, -123.4060,  2, true),
  -- West Shore and Sooke
  ('wspr-outdoor',        'WSPR / Juan de Fuca courts',        '1767 Island Hwy',         'Colwood',         'West Shore',    48.4465, -123.4590,  6, false),
  ('royal-bay',           'Rally at Royal Bay',                '3515 Producers Way',      'Colwood',         'West Shore',    48.4100, -123.4790,  4, false),
  ('ernhill-park',        'Ernhill Park',                      'Ernhill Dr',              'Langford',        'West Shore',    48.4515, -123.5040,  1, false),
  ('throup-road',         'Throup Road courts',                '6534 Throup Rd',          'Sooke',           'Sooke',         48.3800, -123.7160,  3, false);

-- ---------------------------------------------------------------------------
-- Made-up players
-- ---------------------------------------------------------------------------

create temporary table seed_players (
  n int, name text, gender public.gender, birth_date date, skill numeric, dupr numeric,
  style public.play_style, formats public.play_format[], times text[], open boolean, area text,
  active_days_ago int, home text, also text[], bio text
);

insert into seed_players values
  ( 1, 'Maya',    'woman',             '1994-03-12', 3.5, 3.62, 'competitive', '{doubles,mixed}',   '{tue_evening,thu_evening}',              true,  'Oak Bay',    1, 'carnarvon-park',  '{henderson-rec}',            'Lefty, loves a fast hands battle at the kitchen.'),
  ( 2, 'Theo',    'man',               '1989-07-02', 3.5, null, 'competitive', '{doubles}',         '{thu_evening}',                          true,  'Oak Bay',    3, 'henderson-rec',   '{carnarvon-park}',           'Drive first, ask questions later.'),
  ( 3, 'Priya',   'woman',             '1991-11-23', 4.0, null, 'social',      '{doubles,mixed}',   '{tue_evening,thu_evening}',              true,  'Oak Bay',   12, 'carnarvon-park',  '{}',                         'Here for long rallies and a post-game coffee.'),
  ( 4, 'Ben',     'man',               '1985-01-30', 4.5, 4.48, 'competitive', '{singles,doubles}', '{mon_evening,wed_evening,sat_morning}',  true,  'Victoria',   0, 'topaz-park',      '{central-park}',             'Topaz regular. Looking for people who''ll push me.'),
  ( 5, 'Alex',    'non_binary',        '1998-05-19', 3.0, null, 'social',      '{doubles}',         '{sat_morning,sun_morning}',              true,  'Victoria',   2, 'beacon-hill-park','{franklin-green}',           'Weekend mornings at Beacon Hill, all levels welcome.'),
  ( 6, 'Johahn',  'man',               '1996-09-08', 3.0, null, 'fun',         '{doubles,mixed}',   '{sat_morning,sun_afternoon}',            true,  'Victoria',   5, 'beacon-hill-park','{}',                         'New-ish and keen. Bring snacks.'),
  ( 7, 'Hannah',  'woman',             '1979-04-14', 3.5, null, 'social',      '{doubles}',         '{mon_morning,wed_morning,fri_morning}',  true,  'Saanich',    1, 'mcminn-park',     '{fowler-park}',              'Morning dinker. Retired teacher, still bossy about the kitchen line.'),
  ( 8, 'Kenji',   'man',               '1987-12-01', 4.0, 4.05, 'competitive', '{doubles,mixed}',   '{tue_evening,thu_evening,sat_morning}',  true,  'Saanich',    0, 'fowler-park',     '{uvic-carsa}',               'Fowler most evenings. Tournament prep for the Bink Open.'),
  ( 9, 'Sofia',   'woman',             '1993-02-27', 4.0, null, 'competitive', '{mixed}',           '{thu_evening,sun_afternoon}',            true,  'Saanich',    4, 'uvic-carsa',      '{}',                         'Mixed doubles partner wanted for a spring tournament.'),
  (10, 'Liam',    'man',               '2001-06-11', 2.5, null, 'fun',         '{doubles}',         '{fri_evening}',                          true,  'Esquimalt',  9, 'esquimalt-high',  '{archie-browning}',          'Picked it up last summer. Still blaming the paddle.'),
  (11, 'Grace',   'woman',             '1968-08-21', 3.0, null, 'social',      '{doubles}',         '{tue_morning,thu_morning}',              true,  'Oak Bay',    6, 'henderson-rec',   '{}',                         'Social doubles and good conversation.'),
  (12, 'Marcus',  'man',               '1990-10-10', 4.5, null, 'competitive', '{singles}',         '{mon_evening,wed_evening}',              true,  'West Shore', 2, 'wspr-outdoor',    '{royal-bay}',                'Singles only. I like to run.'),
  (13, 'Elena',   'woman',             '1986-01-05', 3.5, null, 'social',      '{doubles,mixed}',   '{sat_afternoon,sun_afternoon}',          true,  'West Shore', 8, 'royal-bay',       '{wspr-outdoor}',             'Colwood weekends, happy to mix it up.'),
  (14, 'Sam',     'prefer_not_to_say', '1995-03-03', 3.5, null, 'social',      '{doubles}',         '{tue_evening}',                          true,  'Victoria',   3, 'topaz-park',      '{}',                         'Tuesday nights at Topaz.'),
  (15, 'Olivia',  'woman',             '1999-12-24', 3.0, null, 'fun',         '{doubles,mixed}',   '{wed_evening,fri_evening}',              true,  'Victoria',  20, 'central-park',    '{oaklands-park}',            'Fun first. Score second.'),
  (16, 'Noah',    'man',               '1975-07-17', 3.5, 3.41, 'social',      '{doubles}',         '{mon_morning,wed_morning}',              true,  'Saanich',   45, 'commonwealth-place','{}',                       'Indoor all winter at Commonwealth.'),
  (17, 'Ava',     'woman',             '1997-09-09', 4.0, null, 'competitive', '{doubles,mixed}',   '{tue_evening,thu_evening}',              false, 'Oak Bay',    2, 'carnarvon-park',  '{}',                         'Injured until spring, back soon.'),
  (18, 'Ethan',   'man',               '1992-04-04', 3.0, null, 'social',      '{doubles}',         '{}',                                     true,  null,        30, null,              '{}',                         ''),
  (19, 'Chloe',   'woman',             '1983-05-30', 2.5, null, 'fun',         '{doubles}',         '{sat_morning}',                          true,  'Peninsula',  7, 'centennial-sport-box','{}',                     'Saanichton, covered courts, rain or shine.'),
  (20, 'Raj',     'man',               '1980-11-11', 4.0, null, 'social',      '{doubles,mixed}',   '{sun_morning,sun_afternoon}',            true,  'Peninsula', 15, 'iroquois-park',   '{centennial-sport-box}',     'Sidney Sunday regular.'),
  (21, 'Zoe',     null,                '2002-02-14', 3.0, null, 'fun',         '{doubles}',         '{thu_evening}',                          true,  'Saanich',    1, 'uvic-carsa',      '{}',                         'UVic student, social drop-ins.'),
  (22, 'Daniel',  'man',               '1977-03-21', 5.0, 5.12, 'competitive', '{singles,doubles}', '{sat_morning,sun_morning}',              true,  'West Shore', 0, null,              '{wspr-outdoor}',             'Former 5.0. Happy to help people level up.'),
  (23, 'Isla',    'woman',             '1990-08-08', 3.5, null, 'competitive', '{doubles}',         '{mon_evening,thu_evening}',              true,  'Victoria',  70, 'topaz-park',      '{}',                         ''),
  (24, 'Owen',    'man',               '1994-10-31', 3.5, null, 'social',      '{doubles,mixed}',   '{tue_evening,sat_afternoon}',            true,  'Oak Bay',    4, null,              '{carnarvon-park}',           'Oak Bay local, flexible on times.'),
  (25, 'Leah',    'woman',             '1988-06-06', 3.0, null, 'social',      '{mixed}',           '{wed_evening}',                          true,  'Esquimalt',  2, 'archie-browning', '{}',                         'Mixed nights at Archie Browning.'),
  (26, 'Victor',  'man',               '1965-01-19', 3.0, null, 'social',      '{doubles}',         '{tue_morning,thu_morning,sat_morning}',  true,  'Saanich',    1, 'pearkes-rec',     '{hampton-park}',             'Pearkes mornings with the usual gang.'),
  (27, 'Mia',     'woman',             '2000-04-22', 4.0, null, 'competitive', '{singles,doubles}', '{mon_evening,wed_evening}',              true,  'Victoria',   1, 'topaz-park',      '{}',                         'Singles drills, doubles for fun.'),
  (28, 'Jonas',   'man',               '1991-09-15', 3.5, null, 'fun',         '{doubles,mixed}',   '{fri_evening,sat_afternoon}',            false, 'Victoria',  10, 'oaklands-park',   '{}',                         'Taking a break, still on the group chat.'),
  (29, 'Nadia',   'woman',             '1984-12-12', 3.5, null, 'social',      '{doubles,mixed}',   '{tue_evening,thu_evening}',              true,  'Oak Bay',    5, 'carnarvon-park',  '{henderson-rec}',            'Carnarvon evenings, social with a bit of bite.'),
  (30, 'Felix',   'man',               '1996-07-07', 2.5, null, 'fun',         '{doubles}',         '{sun_afternoon}',                        true,  'Sooke',     25, 'throup-road',     '{}',                         'Sooke club drop-ins.');

-- Empty token strings (not NULL) keep Supabase Auth happy with hand-made users.
-- No password is set: sign in locally with a magic link.
insert into auth.users (instance_id, id, aud, role, email, email_confirmed_at, raw_app_meta_data,
                        raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new,
                        email_change, created_at, updated_at)
select '00000000-0000-0000-0000-000000000000',
       format('00000000-0000-4000-a000-%s', lpad(n::text, 12, '0'))::uuid,
       'authenticated', 'authenticated', format('player-%s@bink.test', lpad(n::text, 2, '0')), now(),
       '{"provider":"email","providers":["email"]}', '{}', '', '', '', '', now(), now()
from seed_players;

insert into public.players
  (id, name, photo_url, bio, birth_date, gender, skill, dupr, play_style, formats, play_times,
   open_to_play, area, last_active_at)
select format('00000000-0000-4000-a000-%s', lpad(n::text, 12, '0'))::uuid,
       name,
       (array['/images/stock/forehand.jpg', '/images/stock/volley.jpg',
              '/images/stock/ball-court.jpg', '/images/stock/ball-in-hand.jpg'])[1 + n % 4],
       bio, birth_date, gender, skill, dupr, style, formats, times, open, area,
       now() - make_interval(days => active_days_ago)
from seed_players;

insert into public.player_courts (player_id, court_id, is_home)
select format('00000000-0000-4000-a000-%s', lpad(sp.n::text, 12, '0'))::uuid, c.id, c.slug is not distinct from sp.home
from seed_players sp
join public.courts c on c.slug = sp.home or c.slug = any (sp.also);

-- Maya wants to play with women and non-binary players aged 25–40.
update public.players
   set pref_gender = '{woman,non_binary}', pref_age_min = 25, pref_age_max = 40
 where id = '00000000-0000-4000-a000-000000000001';

-- ---------------------------------------------------------------------------
-- Crews, games, chat and a hill result
-- ---------------------------------------------------------------------------

do $$
declare
  p uuid[] := array(select format('00000000-0000-4000-a000-%s', lpad(n::text, 12, '0'))::uuid
                    from generate_series(1, 30) n order by n);
  court record;
  v_crew uuid;
  v_game uuid;
begin
  -- Crews: Thursday Carnarvon regulars (2 on Bink + 1 guest) need a fourth.
  select id into court from public.courts where slug = 'carnarvon-park';
  insert into public.crews (name, home_court_id, format, play_style, play_times, guest_count, created_by)
  values ('Thursday Carnarvon', court.id, 'doubles', 'competitive', '{thu_evening}', 1, p[2])
  returning id into v_crew;
  insert into public.crew_members (crew_id, player_id) values (v_crew, p[2]), (v_crew, p[29]);
  insert into public.conversations (kind, crew_id) values ('crew', v_crew);
  insert into public.conversation_members (conversation_id, player_id)
  select id, unnest(array[p[2], p[29]]) from public.conversations where conversations.crew_id = v_crew;

  select id into court from public.courts where slug = 'beacon-hill-park';
  insert into public.crews (name, home_court_id, format, play_style, play_times, guest_count, created_by)
  values ('Beacon Hill Weekenders', court.id, 'doubles', 'social', '{sat_morning,sun_morning}', 1, p[5])
  returning id into v_crew;
  insert into public.crew_members (crew_id, player_id) values (v_crew, p[5]);
  insert into public.conversations (kind, crew_id) values ('crew', v_crew);
  insert into public.conversation_members (conversation_id, player_id)
  select id, p[5] from public.conversations where conversations.crew_id = v_crew;

  -- Games, relative to now so they're always upcoming.
  select id into court from public.courts where slug = 'carnarvon-park';
  insert into public.games (court_id, starts_at, format, target_level, play_style, note, host_id, guest_count)
  values (court.id, date_trunc('day', now()) + interval '2 days 18 hours', 'doubles', 3.5, 'competitive',
          'Bring a light ball if you have one.', p[1], 1)
  returning id into v_game;
  insert into public.game_players (game_id, player_id) values (v_game, p[1]);
  insert into public.conversations (kind, game_id) values ('game', v_game);
  insert into public.conversation_members (conversation_id, player_id)
  select id, p[1] from public.conversations where conversations.game_id = v_game;

  select id into court from public.courts where slug = 'topaz-park';
  insert into public.games (court_id, starts_at, format, target_level, play_style, note, host_id, guest_count)
  values (court.id, date_trunc('day', now()) + interval '1 day 9 hours', 'singles', 4.5, 'competitive',
          null, p[4], 0)
  returning id into v_game;
  insert into public.game_players (game_id, player_id) values (v_game, p[4]);
  insert into public.conversations (kind, game_id) values ('game', v_game);
  insert into public.conversation_members (conversation_id, player_id)
  select id, p[4] from public.conversations where conversations.game_id = v_game;

  select id into court from public.courts where slug = 'fowler-park';
  insert into public.games (court_id, starts_at, format, target_level, play_style, note, host_id, guest_count)
  values (court.id, date_trunc('day', now()) + interval '3 days 17 hours', 'mixed', null, 'social',
          'Mixed social, all welcome.', p[8], 0)
  returning id into v_game;
  insert into public.game_players (game_id, player_id) values (v_game, p[8]), (v_game, p[9]);
  insert into public.conversations (kind, game_id) values ('game', v_game);
  insert into public.conversation_members (conversation_id, player_id)
  select id, unnest(array[p[8], p[9]]) from public.conversations where conversations.game_id = v_game;
  insert into public.messages (conversation_id, sender_id, body)
  select id, p[8], 'Courts 1 and 2 are booked. See you there!' from public.conversations where conversations.game_id = v_game;

  -- Ben holds the hill at Topaz on a 2-game streak.
  select id into court from public.courts where slug = 'topaz-park';
  insert into public.hill_matches (court_id, winner_id, loser_id, score, played_at, winner_confirmed, loser_confirmed, recorded_by)
  values (court.id, p[4], p[27], '11-8', now() - interval '3 days', true, true, p[4]),
         (court.id, p[4], p[23], '11-6', now() - interval '1 day', true, true, p[4]);
end $$;

drop table seed_players;
