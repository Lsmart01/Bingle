# Bumble's Matchmaking and Recommendation Backend (incl. Bumble BFF): notes for Bink

Research date: 2026-11-24. Dates are given for every finding. "Superseded" marks information that has since changed. Bumble has published very little about how its ranking works, so most items under "how ranking works" come from earnings calls, product announcements, help pages and job ads. They do not describe the algorithm itself.

---

## 1. How Bumble ranks and serves its deck (location, preferences, activity, behavioural signals); published ML / embeddings / recommender work

### Takeaway
Bumble has never published how its deck ranking works. The only confirmed rule is a hard location filter: closest profiles come first, and the radius widens automatically when a user runs out of profiles. Everything else comes from executive statements (2025–2026). Bumble says it is replacing a legacy matcher with a "modernized", then "next-gen", AI and cloud-native recommendation engine. That engine is fed by richer profiles and verification signals, and an LLM assistant ("Bee") gathers explicit preferences through conversation. Job ads point to a modern two-tower, graph and transformer recsys stack. Nothing about it is public.

### Cited Findings
**Confirmed ordering rules (help pages, undated but live 2025–2026)**
- Bumble "shows you people in or very close to your location". After a user has gone through local profiles it "will automatically find other users in places nearby", because "We don't want you to run out of people to swipe on!" — [Bumble BFF help: why am I seeing people from other areas](https://bumble.com/en/bff/help/為什麼我會看到位於其他地區的人)
- A user can turn off "See people slightly further away if I run out" under Distance. Bumble then "will no longer show you people outside of the set distance preferences" — [same page](https://bumble.com/en/bff/help/為什麼我會看到位於其他地區的人); [Bumble help: distance filter](https://bumble.com/help/距離-篩選-如何-操作)
- Per the help pages, profiles closest to you are shown first. At the maximum distance setting you cannot opt out of seeing people further away — [Bumble help: distance filter](https://bumble.com/help/距離-篩選-如何-操作) (as summarised in search results; page not fetched in full)
- Filters apply only to the deck the viewer sees. They are not two-way, so people outside your preferred distance may still see your profile — [Bumble Support: Filters](https://support.bumble.com/hc/en-us/articles/28423691289629)

**Executive statements on the matching engine (earnings calls, 2025–2026)**
- Q1 2025: "We've been testing our modernized matching algorithm and we're already seeing early positive results with increases in relevancy and match rates." — [Q1 2025 call transcript (Investing.com)](https://ng.investing.com/news/transcripts/earnings-call-transcript-bumbles-q1-2025-revenue-exceeds-forecasts-stock-surges-93CH-1906590) (quoted via search summary)
- Q3 2025 (Nov 6 2025), CEO Whitney Wolfe Herd: "building better signal capturing so that we can supercharge our matching and recommendation engine". Also: "To get good matches, you need great signals. Great signals come from stronger profiles." Verification data gives "our matching engine the high-grade fuel it needs". "This is really the first time that there will be precise search involved in that." — [Motley Fool Q3 2025 transcript](https://www.fool.com/earnings/call-transcripts/2025/11/06/bumble-bmbl-q3-2025-earnings-call-transcript)
- Q3 2025: "Our AI-first cloud-native platform will become the engine of Bumble's future". "2.0 is the new AI cloud-native tech stack that Bumble will live on". It should ship changes "in a matter of hopefully, days to weeks versus months" — [Motley Fool Q3 2025 transcript](https://www.fool.com/earnings/call-transcripts/2025/11/06/bumble-bmbl-q3-2025-earnings-call-transcript)
- May 2026 (Q1 2026): Bumble is replacing its old platform with a cloud-native, AI-powered one that is already rolling out to some users. The "reimagined" experience is due in Q4 2026, with broader rollout into early 2027. Wolfe Herd: "our next-gen recommendation engine can actually help better connect people more compatibly". No technical detail was given — [TechCrunch, 2026-05-05](https://techcrunch.com/2026/05/05/bumbles-paying-users-are-slipping-as-it-bets-on-an-overhaul-later-this-year/)
- Member quality tiers (internal names): members are classed "Approved", "Improve" or "Remove". Approved members "monetize at more than twice the rate of improved members" (CFO Kevin Cook). Bumble is "attempting to lift members from... improved... into the approved category" — [Motley Fool Q3 2025](https://www.fool.com/earnings/call-transcripts/2025/11/06/bumble-bmbl-q3-2025-earnings-call-transcript). A third-party summary puts "Remove" at under 10% of the member base (unverified) — [Fintool Q2 2025 summary](https://fintool.com/app/research/companies/BMBL/earnings/Q2%202025)

**Bee, the LLM matchmaker (2026)**
- Bee was announced 2026-03-12 with Q4 2025 results. It learns a user's "values, relationship goals, communication style, lifestyle, and dating intentions" through private text or voice chat. Its first use is "Dates": Bee pairs two people who share intentions, values and goals, and sends both a notification explaining why they match. It was in internal pilot at announcement. Data from chapter-based profile interactions will also "feed its AI systems and algorithms" — [TechCrunch, 2026-03-12](https://techcrunch.com/2026/03/12/bumble-introduces-an-ai-dating-assistant-bee/)
- Wolfe Herd to Axios (around May 2026): "We are going to be saying goodbye to the swipe." Swipe-free relaunches in select markets were planned for H2 2026 — [PYMNTS](https://www.pymnts.com/artificial-intelligence-2/2026/bumble-replaces-the-swipe-with-an-ai-matchmaker/); [Dexerto](https://www.dexerto.com/entertainment/bumble-now-lets-men-message-first-as-dating-app-prepares-to-remove-swiping-3397259/). Scope varies by source: some say "test in select markets", others "phase out" — [TechCrunch 2026-03-12](https://techcrunch.com/2026/03/12/bumble-introduces-an-ai-dating-assistant-bee/) vs [abc7](https://abc7.com/post/dating-app-bumble-ends-swipe-feature-introduces-ai-assistant-matchmaking/19100191/)

**ML stack, as shown by hiring**
- Bumble advertises a "People Recommendations" team, including Principal ML Engineer, Matching and Recommendations roles in the UK and Austin. One posting mentions transformers, graph neural networks and contrastive learning (from a search-result summary; the original posting returned 404 when fetched) — [Lever: Principal MLE Matching & Recommendations](https://jobs.lever.co/bumbleinc/8d6df401-7290-402a-9387-99e7f45fbc8e); [Accel jobs: Senior ML Scientist, Recommendations](https://jobs.accel.com/companies/bumble/jobs/49668470-senior-machine-learning-scientist-recommendations); [Lever: Staff SWE, Core Matching & ML](https://jobs.lever.co/bumbleinc/bc469e38-2eed-43ff-91a7-ccce7fd5337e)
- The Bumble Tech blog (medium.com/bumble-tech) covers moderation ML, design systems, CI/merge tooling and a deep-learning primer. **No post on deck ranking or recommendations was found** — [Bumble Tech search results](https://medium.com/bumble-tech/part-2-deep-learning-for-engineers-674240c0018b)

**Speculation (not confirmed; listed so it can be discounted)**
- Popular writing says Bumble uses an Elo-like desirability score, or that profiles with more right-swipes are shown more. Bumble has never confirmed either. — [DEV Community (speculative)](https://dev.to/karim__sk/decoding-bumbles-algorithm-a-developers-guide-to-building-smart-matchmaking-systems-3ejh); [wikiHow mirror](https://kiwix.lema.org/wikihow_en_maxi_2023-03/How-Does-Bumble-Decide-Who-to-Show-You)

### Inferences
- The only parts we can see are a geo pre-filter, user-set hard filters (distance, age, verified-only and so on), and a candidate pool that expands when supply runs out. Ranking within the pool is opaque, but the stated signals are profile completeness or quality, verification status, member-quality tier, and explicit intent. For Bink this suggests: (1) hard filters in SQL (area/court distance, skill band, availability overlap); (2) a transparent weighted score computed in Postgres (shared home courts, skill closeness, play-style match, time-slot overlap, recent activity, profile completeness, verified); (3) graceful pool expansion. Bink does not need embeddings at one city's scale.
- Bumble moved from implicit swipe signals toward explicit intent (Bee conversations, chapter profiles, "precise search"). This supports Bink using a structured, explicit-preference model (skill, style, times, courts) rather than swipe-learned taste.
- The "Approved, Improve, Remove" split means profile quality is a first-class ranking input. Bink could demote incomplete profiles, such as those with no photo, no home court or no times, and prompt users to complete them.

### Gaps
- No public detail on Bumble's candidate generation, model features, Elo or desirability use, embeddings, freshness or activity boosts, or how paid "Boost/Spotlight" interacts with ranking.
- No source found on whether recent activity ("last active") affects deck order, although nearly every industry recsys does this.
- The Principal MLE job posting could not be fetched (404), so the transformer/GNN/contrastive wording is from a search snippet only.

---

## 2. "Women make the first move", the 24-hour timer, and the 2024–2026 changes

### Takeaway
From launch (2014) Bumble required women to send the first message in opposite-gender matches within 24 hours, or the match expired. In 2024 Opening Moves (profile prompts that men could answer) relaxed this. On 2026-08-11 Bumble dropped the women-first rule: either person can message first, and the timer went from 24 to 72 hours. The expiry timer survives in all versions, and it is the mechanic most relevant to Bink.

### Cited Findings
- **Original rule (superseded):** a woman had to send the first message within 24 hours or the match expired — [Scripps News](https://www.scrippsnews.com/business/company-news/bumble-wont-require-women-to-make-the-first-move-on-its-app-anymore); [Fortune, 2024-05-01](https://dc.fortune.com/2024/05/01/bumble-changes-dating-app-women-make-first-opening-move)
- **Opening Moves (2024, now reportedly removed):** women could set a suggested or custom prompt question on their profile, and a man's reply to it counted as the first message — [Fortune, 2024-05-01](https://dc.fortune.com/2024/05/01/bumble-changes-dating-app-women-make-first-opening-move); [TechCrunch 2026-08-11](https://techcrunch.com/2026/08/11/bumble-ditches-its-rule-that-kept-men-from-making-the-first-move/)
- **August 2026 change:** "Anyone in a match can now send the first message". The response window went from 24 to 72 hours, to reduce pressure to reply quickly and to check the app compulsively. Survey data: 66% of women prefer men to message first, and more than half of members surveyed said the longer window improved their experience. Wolfe Herd called it "an evolution, not a retreat" — [TechCrunch, 2026-08-11](https://techcrunch.com/2026/08/11/bumble-ditches-its-rule-that-kept-men-from-making-the-first-move/)
- **New timer mechanics:** both people have 72 hours to send an opener. Once one person messages, the other has 72 hours to reply before the match expires. The first sender gets one message, and the chat opens only when the other replies. Openers like "hi" or "hey" are flagged with a nudge to write something more personal, but not blocked. Opening Moves was removed. In trials, more people on each side started conversations and chat activity rose; 62% said having a choice made them more confident — [Dexerto](https://www.dexerto.com/entertainment/bumble-now-lets-men-message-first-as-dating-app-prepares-to-remove-swiping-3397259/); [Digital Trends](https://www.digitaltrends.com/phones/bumble-just-changed-who-gets-to-make-the-first-move/); Bumble's [support article](https://support.bumble.com/hc/en-us/articles/36679912947229) states the 72h rules (via search summary; direct fetch returned 403)
- Conflict: TechCrunch does not say whether Opening Moves still exists. Dexerto says it was removed — [TechCrunch](https://techcrunch.com/2026/08/11/bumble-ditches-its-rule-that-kept-men-from-making-the-first-move/) vs [Dexerto](https://www.dexerto.com/entertainment/bumble-now-lets-men-message-first-as-dating-app-prepares-to-remove-swiping-3397259/)
- Context: Q2 2026 revenue fell 15.2% year on year to $210.5M — [TechCrunch 2026-08-11](https://techcrunch.com/2026/08/11/bumble-ditches-its-rule-that-kept-men-from-making-the-first-move/)

### Inferences
- An expiry timer is a cheap, effective way to stop "dead" matches from piling up, and it creates urgency. Bumble's own move from 24 to 72 hours suggests 24 hours was too punishing. For Bink, where people set up a game rather than a date, a 48–72h "reply or it lapses" window on play invites seems a reasonable starting point. In Supabase this needs only `expires_at` on the match or invite row and a scheduled job (pg_cron) or a query-time filter.
- The "one message until the other replies" rule stops either side from spamming. It maps neatly onto a Bink "invite to play" with a single pending invite per pair.
- Bumble flags low-effort openers. Bink could offer prompts with context, such as "Want to hit at Topaz Park Sat am?", built from shared courts and times.
- Bink has no gender dynamic, so the first-move rule itself does not apply. Its original purpose, cutting unwanted messages and giving the receiver control, could come from opt-in "open to invites" status or skill-band limits on who can invite whom.

### Gaps
- No engineering write-up of how expiry was implemented (cron sweep vs. lazy evaluation) was found.
- Exact current status of paid "Extend" / "Rematch" with the 72h timers not confirmed.
- How the 2014–2024 first-move rule applied to same-gender and BFF matches was not confirmed from a primary source in this session. In BFF, either person could message first (widely reported, but not sourced here).

---

## 3. Bumble BFF: friend matching, interest and group matching, the 2025 relaunch on Geneva, and differences from dating

### Takeaway
BFF started in 2016 as a swipe mode inside Bumble and became a standalone app ("Bumble For Friends") in 2023. Both versions used one-to-one swiping on interest-tagged profiles. In September 2025 it relaunched on the tech stack of Geneva, a group/community app Bumble acquired in 2024. One-to-one matching remains, but Groups (chat rooms, events, calendar) are now the centrepiece, with group discovery added around February 2026. Bumble has published no ranking details for BFF. Executives say retention is higher than the old app, and group joins nearly doubled between December 2025 and March 2026. BFF is not monetised.

### Cited Findings
- **2016–2023 (superseded):** BFF was a mode inside the Bumble app. During testing it accounted for about 15% of the main app's MAU — [TechCrunch, 2023-07-26](https://techcrunch.com/2023/07/26/bumble-is-a-launching-a-separate-bff-app-for-friend-friending/)
- **2023 standalone app (superseded by 2025 relaunch):** Users built a profile of interests and the kind of friends they wanted, then swiped through "profiles with similar interests". Users could create group chats from matches (2+ matches, subject line, meetup prompts such as "Meet for coffee" and "Games night"). Early testers complained the app limited matching to their own gender. Safety rules matched the dating app, and users could report romantic behaviour. Premium features were unlimited swipes, advanced filters, incognito and boosts. It launched in AU, CA, IE, NZ, PH, UK and US — [TechCrunch, 2023-07-26](https://techcrunch.com/2023/07/26/bumble-is-a-launching-a-separate-bff-app-for-friend-friending/)
- **Geneva acquisition (May 2024, closed July 2024):** Bumble described a shift "beyond one-to-one connections to group belonging", with groups "with shared interests and experiences", e.g. "running group in Soho". Its stated goal was "curated, safe spaces" rather than mass forums — [Bumble, The Buzz, 2024-05-20](https://bumble.com/the-buzz/bumble-inc-friendship-communities-geneva); [TechCrunch, 2024-05-20](https://techcrunch.com/2024/05/20/bumble-buys-community-building-app-geneva-to-expand-further-into-friendships). Reported price was about $17M (secondary) — [Yahoo Finance](https://ca.finance.yahoo.com/news/bumble-buys-community-focused-app-204416253.html)
- **September 2025 relaunch:** BFF is now built on Geneva, and the Geneva app shut down (its members migrated with their groups and messages). One-to-one swiping and DMs continue, but the Groups tab is the focus: create or join groups ranging "from small circles to thousands of members", group chat rooms, hangout planning, and an in-app calendar for events. Group discovery was slated for February 2026 — [TechCrunch, 2025-09-18](https://techcrunch.com/2025/09/18/bumble-bffs-revamped-app-is-here-focusing-on-friend-groups-and-community-building)
- Q3 2025 call: "The new BFF app combines friend matching with group management and event planning"; "we've migrated onto the Geneva tech stack"; BFF has "increased retention compared to the old app" — [Motley Fool Q3 2025](https://www.fool.com/earnings/call-transcripts/2025/11/06/bumble-bmbl-q3-2025-earnings-call-transcript)
- May 2026: group joins nearly doubled between December and March. Engagement is growing, especially among Gen Z women — [TechCrunch, 2026-05-05](https://techcrunch.com/2026/05/05/bumbles-paying-users-are-slipping-as-it-bets-on-an-overhaul-later-this-year/)
- Bumble has not tried to make money from BFF, so it is excluded from key operating metrics (Q2 2026) — [BusinessWire, 2026-08-05](https://www.businesswire.com/news/home/20260805016041/en/)
- Interest-based groups examples: yoga, romantasy books, thrifting, and so on. A secondary review says discovery has launched and shows local groups tied to events nearby — [search summary of WERSM / techyorker](https://wersm.com/bumble-bff-relaunches-with-new-focus-on-groups-and-community-building). Unverified claims such as a "5–10 mile radius" and a "24-hour refresh" appear only on techyorker.com and are **not** supported by Bumble sources — [techyorker](https://techyorker.com/bumble-bffs-revamped-app-is-here-focusing-on-friend-groups-and-community-building/)
- BFF uses the same location logic as dating: local first, expanding automatically when local profiles run out, unless the user opts out — [Bumble BFF help](https://bumble.com/en/bff/help/為什麼我會看到位於其他地區的人)
- Bumble's stat: 47% of young adults want more friends to do activities with — [TechCrunch, 2025-09-18](https://techcrunch.com/2025/09/18/bumble-bffs-revamped-app-is-here-focusing-on-friend-groups-and-community-building)

### Inferences
- **Differences from dating that matter for Bink:** friend matching (a) does not need mutual attraction, so a mutual-swipe gate adds friction without much safety benefit; (b) benefits from many-to-many structures (groups, events). Bumble's best friendship numbers (retention, doubled group joins) came from groups, not better one-to-one ranking; (c) is not monetised, so Bumble's engineering effort there is lighter.
- Bink's court-first model resembles Geneva/BFF Groups. A home court works like a group: members, a chat, scheduled sessions. A "for you" player directory works like the one-to-one deck. The evidence suggests Bink should treat court communities and open sessions as the main retention loop, with the ranked directory secondary.
- Since BFF ranking is undocumented, the safest model to copy is: hard local filter, then shared-interest overlap (for Bink: shared courts, skill band, style, times), then quality and verification, then pool expansion when supply is thin.

### Gaps
- No public information on BFF's ranking signals, group-recommendation algorithm, or whether BFF uses the new "next-gen" engine.
- February 2026 group discovery launch not confirmed by a primary Bumble source in this session.
- Geneva's own architecture (it was a small startup) is undocumented.

---

## 4. Engineering and infrastructure: the shared Bumble/Badoo platform, data stores, geo search, messaging

### Takeaway
Bumble was built on Badoo's London engineering platform (MagicLab, renamed Bumble Inc. in 2020). That stack was PHP/C with sharded MySQL and Tarantool. Geo search used a custom spherical tessellation, an icosahedron and later a "Hexasphere", to shard users by region. From 2025–2026 Bumble is migrating to a new "AI-first cloud-native" platform ("2.0"), and the stack it chose is not public.

### Cited Findings
- From 2014, Andrey Andreev (Badoo founder) owned 79% of Bumble and supplied Badoo's infrastructure and engineering. Forbes (2019) reported that "the infrastructure, the company's engine, sits squarely in the London office". MagicLab described itself as "a shared integrated technology platform". MagicLab was renamed Bumble Inc. in 2020 — [Wikipedia: Bumble](https://en.wikipedia.com/wiki/Bumble); [Wikiwand: MagicLab](https://www.wikiwand.com/en/articles/MagicLab); [TechCrunch: Bumble majority-owned by Badoo](https://techcrunch.com/?p=1297168)
- **Badoo geo search (Habr, 2015-04-01, superseded / historical):** for "people nearby" across 200M+ users, Badoo projected an icosahedron onto the sphere and subdivided it to 320 triangular faces. Each large triangle maps to a cluster shard holding all users in that region. About 100k lines of generated C mapped lat/long to a triangle. Load skew led to a symmetric "Hexasphere" hexagon tessellation, built with IST Austria, which evened out shard load — [Habr: Badoo geo index](https://habr.com/en/articles/254643)
- **User data (Badoo, ~2013–2016, historical):** nearly all user data was on a few hundred MySQL servers, sharded through a home-built routing service ("authorizer") that mapped user ID to server. Later reports cite 800M+ users in master-slave MySQL pairs per data centre — [Habr search summary](https://habr.com/en/articles/229273) (sharding detail from search snippets of Badoo Habr posts; not individually verified)
- **Profile-view history (2014, historical):** about 100M profile views per day, with 90 days of history (~5B events) stored in Tarantool. It replaced C daemons with SQLite; MySQL, Redis and memcached were ruled out — [Habr, 2014-07-09](https://habr.com/en/articles/229273)
- Bumble Tech also writes about zero-downtime relational DB optimisation (PHP) — [Bumble Tech: Optimising relational databases with zero downtime](https://medium.com/bumble-tech/optimising-relational-databases-with-zero-downtime-php-68f5f48e10c1) (not fetched; title only)
- **2025–2026 platform migration:** "2.0 is the new AI cloud-native tech stack that Bumble will live on" (Q3 2025). By May 2026 it was rolling out to some users, with the full experience due in Q4 2026 — [Motley Fool Q3 2025](https://www.fool.com/earnings/call-transcripts/2025/11/06/bumble-bmbl-q3-2025-earnings-call-transcript); [TechCrunch 2026-05-05](https://techcrunch.com/2026/05/05/bumbles-paying-users-are-slipping-as-it-bets-on-an-overhaul-later-this-year/)

### Inferences
- Badoo's geo-sharding exists because it operates at global scale. Bink (one city, likely under 10k players) needs none of it. A single Postgres table with PostGIS `geography` points or neighbourhood/area codes, plus a GiST index, covers "nearby" queries easily. Court-first design can use court-to-court distance, or simply home-court membership, instead of user GPS.
- The Tarantool view-history store shows that "who saw whom" logs are a core table at dating-app scale. Bink needs a small equivalent (`impressions` / `dismissed`) to avoid re-showing passed players and to compute "new to you".
- The move to a new stack to "ship in days not months" is a reminder that recsys iteration speed matters more than model complexity. A SQL scoring function in Supabase is easy to tune.

### Gaps
- No public detail on Bumble's real-time chat infrastructure (protocol, broker, data store) was found.
- The vendor and architecture of the 2.0 "AI cloud-native" platform are not disclosed.
- No info on whether Bumble still runs on Badoo-derived services today.

---

## 5. Trust and safety in matching: photo, ID and video verification, Private Detector, moderation signals, ranking

### Takeaway
Bumble layers verification: photo selfie verification (long-standing), government ID verification (March 2025), and phone and video-selfie verification (2025). Users can filter for verified profiles and ask matches to verify. ML moderation (Private Detector for lewd images, Rude Message Detector for text) works at the message level. Bumble explicitly calls verification and quality data "fuel" for the matching engine, and its 2025 "quality reset" removed bad actors at the cost of fewer paying users. How safety signals are weighted in ranking has not been published.

### Cited Findings
- **ID verification (March 2025):** users submit a government ID for a badge. Others can filter for ID-verified profiles and ask matches to verify — [TechCrunch, 2025-03-17](https://techcrunch.com/2025/03/17/bumble-heightens-safety-measures-with-new-id-verification-feature/); [The Star, 2025-03-19](https://www.thestar.com.my/tech/tech-news/2025/03/19/bumble-rolls-out-id-verification-in-dating-app-safety-push)
- **Phone and selfie-video verification (2025):** "We added stronger verification features, like phone number verification" — [Motley Fool Q3 2025](https://www.fool.com/earnings/call-transcripts/2025/11/06/bumble-bmbl-q3-2025-earnings-call-transcript)
- **Verification feeds matching:** Bumble says verification data gives the matching engine "the high-grade fuel it needs" — [Q3 2025 transcript (InsiderMonkey)](https://www.insidermonkey.com/blog/bumble-inc-nasdaqbmbl-q3-2025-earnings-call-transcript-1641112/) (via search summary)
- **Quality reset (2025):** Bumble is "refreshing and intensifying our efforts to remove bots, scammers, and bad intention members that have degraded match quality and member trust", expecting fewer paying members near-term (Q1 2025). Trust and safety work plus lower marketing spend caused about 80% of the paying-user decline (Q3 2025). Paying users were 3.2M in Q1 2026, down 21.1% year on year: "We made a clear choice to prioritize quality over quantity" — [Q1 2025 transcript (InsiderMonkey)](https://www.insidermonkey.com/blog/bumble-inc-nasdaqbmbl-q1-2025-earnings-call-transcript-1528076/); [Motley Fool Q3 2025](https://www.fool.com/earnings/call-transcripts/2025/11/06/bumble-bmbl-q3-2025-earnings-call-transcript); [TechCrunch 2026-05-05](https://techcrunch.com/2026/05/05/bumbles-paying-users-are-slipping-as-it-bets-on-an-overhaul-later-this-year/)
- **Private Detector:** in the app since 2019. It blurs lewd images in chat and lets the recipient choose whether to view, block or report. It was open-sourced in October 2022 as an EfficientNetV2-based binary classifier (TensorFlow SavedModel plus training code, Apache-2.0) — [GitHub: bumble-tech/private-detector](https://github.com/bumble-tech/private-detector); [TechCrunch, 2022-10-24](https://techcrunch.com/2022/10/24/bumble-open-sourced-its-ai-that-detects-unsolicited-nudes/); [Bumble Buzz](https://bumble.com/the-buzz/bumble-open-source-private-detector-ai-cyberflashing-dick-pics). The ">98% accuracy" figure comes from secondary press — [AI News](https://www.artificialintelligence-news.com/news/bumble-open-sources-its-lewd-spotting-ai-tool/)
- **Rude Message Detector:** a multilingual model that classifies messages across about 50 languages — [Bumble Tech: Multilingual message content moderation at scale](https://medium.com/bumble-tech/multilingual-message-content-moderation-at-scale-ddd0da1e23ed) (from search snippet; page returned 403)
- **BFF safety:** the same rules as dating. Users can report romantic behaviour in friend mode — [TechCrunch 2023-07-26](https://techcrunch.com/2023/07/26/bumble-is-a-launching-a-separate-bff-app-for-friend-friending/)

### Inferences
- For Bink, verification is cheap to add as a ranking input: a `verified` boolean that boosts the score and is available as a filter. Bumble's experience suggests a "verified only" filter is a feature users value.
- Bumble's tiers suggest a three-state profile status for Bink (e.g. `active`, `needs_attention`, `hidden`). Report counts or admin flags could move users toward `hidden`, so they drop out of the "for you" directory. In Supabase, enforce this in RLS or in the directory view so hidden users never reach clients.
- A self-rated skill (2.0–5.0) is open to inflation. DUPR-linked ratings act like "verification" for skill and could earn a badge and higher ranking confidence, in the same way that ID-verified users are treated as better signal.

### Gaps
- No public source on how report counts, block rates or moderation flags change ranking or visibility (shadow-demotion) at Bumble.
- Bumble's 2024 "Deception Detector" (AI spam/fake-profile blocker) is recalled from prior knowledge but was **not** verified in this session.

---

## 6. Cold start, small markets and low density

### Takeaway
Bumble's only documented low-density mechanism is automatic radius expansion: show people "slightly further away if I run out", on by default and opt-out, and forced at the maximum distance. Filters are one-way, so a strict filter does not hide you from others. Bumble has published nothing on cold-start ranking for new users ("new here" boosts) or on market-launch strategy for small cities. Its 2026 strategic answer to engagement is in-person events and groups, not denser swiping.

### Cited Findings
- Auto-expansion when local supply runs out ("We don't want you to run out of people to swipe on!"), with an opt-out toggle — [Bumble BFF help](https://bumble.com/en/bff/help/為什麼我會看到位於其他地區的人)
- At the maximum distance you cannot opt out of seeing people further away; closest profiles are shown first — [Bumble help: distance filter](https://bumble.com/help/距離-篩選-如何-操作)
- Filters are one-way (they restrict only your deck, not who sees you), which keeps both sides' pools larger — [Bumble Support: Filters](https://support.bumble.com/hc/en-us/articles/28423691289629)
- In 2026 Bumble is expanding in-person events, especially for Gen Z — [TechCrunch 2026-08-11](https://techcrunch.com/2026/08/11/bumble-ditches-its-rule-that-kept-men-from-making-the-first-move/). BFF growth is coming from groups — [TechCrunch 2026-05-05](https://techcrunch.com/2026/05/05/bumbles-paying-users-are-slipping-as-it-bets-on-an-overhaul-later-this-year/)
- The 2023 BFF standalone launched in only 7 countries (AU, CA, IE, NZ, PH, UK, US), so rollout was staged by market — [TechCrunch 2023-07-26](https://techcrunch.com/2023/07/26/bumble-is-a-launching-a-separate-bff-app-for-friend-friending/)
- Third-party claims that new profiles get a temporary visibility boost ("new here") are unconfirmed by Bumble — [example, unverified](https://nccrd.iitm.ac.in/siteimages/eventimage/nDYDZWe/how-long-does-bumble-say-new-here)

### Inferences
- For Bink in one city, "radius expansion" becomes relaxing constraints in order of importance: first widen the skill band (±0.25, then ±0.5, then ±0.75), then accept adjacent areas or courts, then non-overlapping times. Each relaxed candidate is labelled ("slightly above your level", "plays at a court 10 min away"), as Bumble does. The directory should never be empty.
- Use one-way filters as Bumble does: a player's filters shape only what they see, not who can see them. This keeps the thin early supply visible.
- For cold start, rank by structured overlap (shared home courts, time slots) rather than behaviour, since there is no behaviour data yet. A small, decaying "new player" boost is a common industry pattern, but Bumble has not confirmed using one, so Bink should treat it as its own design choice.
- At low density, groups/courts beat one-to-one ranking. Seeding active court communities and open sessions will likely matter more than ranking precision. This follows the direction of Bumble BFF and Geneva.

### Gaps
- No Bumble publication on cold-start handling for new users, small-market launch tactics, or "new here" boosts.
- No data on BFF density thresholds or how BFF behaves in small cities.
