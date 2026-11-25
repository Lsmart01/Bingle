# Tinder's Matchmaking and Recommendation Backend (notes for Bink)

Research date: 2026-11-24. Labels used below: **[CONFIRMED]** means stated by Tinder, Match Group, a Tinder-authored engineering post, a Tinder-assigned patent, or a vendor case study with Tinder's participation. **[SECONDARY]** means journalism or third-party summaries of Tinder material. **[SPECULATIVE]** means reverse-engineering, outside system-design proposals, or informal analysis. Dates are given so superseded material is visible.

## 1. Elo / "desirability" score, what replaced it, and how candidates are ranked now

### Takeaway
Tinder used an internal Elo-style "desirability" score until about 2019 (disclosed 2016). It now publicly describes a "dynamic system" that ranks mostly on **activity (especially being active at the same time), proximity, stated preferences (age, distance, gender), Like/Nope feedback on you and on profiles in your area, profile content (interests), and anonymized photo similarity to profiles you have Liked**. The architecture behind it (2025-26) is a multi-stage retrieve → ML rank → rerank pipeline. Tinder has never published the weights or a "mutual-likelihood" formula.

### Cited Findings
- **[CONFIRMED, 2016, superseded]** Fast Company's Austin Carr (Jan 2016) was shown his internal "Elo score" (946, "upper end of average"). CEO Sean Rad said it measured "desirability", not attractiveness, was not based only on right swipes, and took about 2.5 months to build. Data analyst Chris Dumler called each swipe a "vote" in a "vast voting system". — [The Next Web, 11 Jan 2016](https://thenextweb.com/news/tinder-is-secretly-scoring-your-desirability-and-picking-matches-that-are-in-your-league); [Digital Trends](https://www.digitaltrends.com/phones/tinder-rank-elo-score/); [Stylist summary of Fast Company](https://www.stylist.co.uk/life/tinder-rating-attractive-desirable-hot-or-not-elo-score-sean-rad-fast-company/63204)
- **[SECONDARY/SPECULATIVE]** Explainers describe the Elo mechanism as chess-like: a right swipe from a higher-scored user raised your score more than one from a lower-scored user, and the system tended to show you people "in your league". Tinder never published the formula. — [Medium explainer, "Tinder and Matching Algorithms"](https://medium.com/@osmanelsoz/tinder-and-matching-algorithms-351b538ac83f); [The Next Web](https://thenextweb.com/news/tinder-is-secretly-scoring-your-desirability-and-picking-matches-that-are-in-your-league)
- **[CONFIRMED, 15 Mar 2019]** Tinder's "Powering Tinder: The Method Behind Our Matching" post: "Elo is old news at Tinder. It's an outdated measure and our cutting-edge technology no longer relies on it." It also says "Tinder matches you, using your recent activity, your preferences and your location." Each Like or Nope on your profile changes which potential matches you see, with changes to order showing within about 24 hours. Tinder said it does not store race or income data. — [Engadget, 18 Mar 2019](https://www.engadget.com/2019-03-18-tinder-dumps-desirability-scores.html)
- **[CONFIRMED, post updated 11 Jul 2022]** The current version of the same post lists these ranking inputs:
  - **Activity** is "the most important factor". Tinder prioritizes members who are active, "and active at the same time".
  - **Proximity**: distance from current location.
  - **Preferences**: age, distance and gender to start. Location and gender are the only other required inputs.
  - **Profile content**: optional interests and lifestyle fields are used to suggest people with things in common.
  - **Photos**: "anonymized cues" suggest profiles that look similar to ones you Liked.
  - **Likes and Nopes**: how often your profile, *and all profiles in your area*, are Liked or Noped.
  - Tinder says it does not track social status, religion or ethnicity.
  - Coverage: 45 languages, 190 countries.
  — [Tinder Press Room, "Powering Tinder: The Method Behind Our Matching"](https://www.tinderpressroom.com/powering-tinder-r-the-method-behind-our-matching/); same text at [Tinder Help Center](https://www.help.tinder.com/hc/en-us/articles/7606685697037-Powering-Tinder-The-Method-Behind-Our-Matching)
- **[SECONDARY, 2019]** Engadget argued the replacement "sounds very similar" to Elo. It still depends on who swipes right on you, and usage is the main lever, which suits the sale of Super Likes and Boosts. — [Engadget](https://www.engadget.com/2019-03-18-tinder-dumps-desirability-scores.html)
- **[CONFIRMED by vendor case study, undated, current as of 2026]** The pipeline has three stages:
  - **Retrieval** in Elasticsearch narrows tens of millions of profiles to about 1,000 candidates. It applies hard filters (age, gender, distance) plus lightweight ML models.
  - **Ranking** uses deep-learning models on GPUs outside Elasticsearch.
  - **Reranking**, also outside Elasticsearch, "balance[s]" results before they reach the app.
  — [Elastic customer story: Tinder](https://www.elastic.co/customers/tinder)
- **[CONFIRMED, job posts]** Match Group/Tinder ML job ads say the recommendation models use deep learning, reinforcement learning, causal inference and optimization. — [Match Group job posting (Lever)](https://jobs.lever.co/matchgroup/e7498257-f48a-4ed6-b5ee-5d3002878057)
- **[CONFIRMED, Nov 2025 to Mar 2026]** "Chemistry" is an AI matching feature. It asks users interactive questions and, with permission, reads their camera roll to learn interests. It then gives "a single drop or two" of curated profiles instead of endless swiping.
  - Disclosed on Match Group's Q3 2025 earnings call, with a pilot in Australia and New Zealand.
  - CEO Spencer Rascoff said it would be core to Tinder in 2026.
  - Expanded to the US and Canada after Tinder's 12 Mar 2026 product keynote.
  - Privacy critics flagged the camera-roll access.
  — [Business Today, 6 Nov 2025](https://www.businesstoday.in/tech-today/story/tinder-bets-on-ai-to-reignite-the-spark-with-new-chemistry-feature-501133-2025-11-06); [eWeek](https://www.eweek.com/news/tinder-ai-matchmaking-update/); [TechCrunch](https://techcrunch.com/?p=3089496); [PetaPixel, 10 Nov 2025](https://petapixel.com/2025/11/10/tinder-wants-to-see-your-photos-to-find-better-matches/)

### Inferences
- The current signals reduce to five families: (a) **availability/recency** (active, and active at overlapping times), (b) **hard constraints** (distance, age, gender), (c) **affinity** (shared interests, similarity to what you have Liked), (d) **feedback-derived quality** (Like/Nope rates on you, normalized against your local area, which is an Elo successor in all but name), and (e) **reciprocity**, implied by "active at the same time" and the Like/Nope feedback but never formalized publicly.
- For Bink these map directly onto data it already has:
  - **Active at the same time** → overlap of usual play times, plus a recent-activity (last-seen) decay.
  - **Proximity** → shared home courts, then area distance.
  - **Preferences** → skill band (self-rated 2.0–5.0 and DUPR), play style.
  - **Feedback** → acceptance rates of play invites.
- Tinder's ranking is mostly behavioural, but at Bink's scale (one city, hundreds to low thousands of players) a transparent weighted score in Postgres would be explainable and good enough.
- Bink should avoid a hidden global "desirability" number. Tinder dropped Elo publicly partly because of the reputational backlash, and pickleball already has an explicit skill rating, so the ranking should use skill fit rather than popularity.

### Gaps
- No official weights, model architectures for the ranking stage, or a published "probability of mutual like" objective. Tinder describes the factors only qualitatively.
- No official confirmation that Elo-like feedback scoring is entirely gone, as opposed to rebranded. The "Likes and Nopes ... in your area" factor suggests a normalized popularity signal persists.

## 2. Candidate retrieval and geo: geosharding, S2 cells, filters, pool refresh

### Takeaway
Tinder moved (2019) from one global Elasticsearch index to **geosharded indices**: S2 cells grouped into load-balanced shards, all in a single Elasticsearch cluster. A query fans out only to the shards that its distance radius covers. Hard filters (age, gender, distance) and a compressed "already-swiped" exclusion filter run at retrieval time, with a LightGBM scorer embedded in Elasticsearch, returning about 1,000 candidates for downstream ranking.

### Cited Findings
- **[CONFIRMED, Tinder Tech Blog 2019, via summaries]** The original design was one Elasticsearch index holding all users, so every search scanned irrelevant data. That raised latency and the cost of servers and replicas. — [ByteByteGo summary of Tinder's geosharding posts, Dec 2024](https://blog.bytebytego.com/p/how-tinder-recommends-to-75-million); originals: [Part 1](https://medium.com/tinder/geosharded-recommendations-part-1-sharding-approach-d5d54e0ec77a), [Part 2](https://medium.com/tinder/geosharded-recommendations-part-2-architecture-3396a8a7efb), [Part 3](https://medium.com/tinder/geosharded-recommendations-part-3-consistency-2d2cb2f0594b) (Medium blocked direct fetch; content taken from summaries and search snippets)
- **[CONFIRMED, 2019]** Google's S2 library supplies two operations: map a lat/long to its containing cell, and return the cells covering a circle (lat, long, radius). S2 Level 7 (~45 mi) and Level 8 (~22.5 mi) cells were "best suited" to Tinder. — [Tinder Tech Blog, Geosharded Recommendations Part 1](https://medium.com/tinder/geosharded-recommendations-part-1-sharding-approach-d5d54e0ec77a); [ByteByteGo](https://blog.bytebytego.com/p/how-tinder-recommends-to-75-million)
- **[CONFIRMED, 2019]** Load balancing works like this:
  - Each S2 cell gets a load score based on active users and query volume.
  - Adjacent cells are grouped into a "container" until it reaches a load threshold, and that container becomes one geoshard.
  - Dense areas therefore get geographically smaller shards.
  - Shard sizing trades query fan-out (too small means many shards per query) against migration frequency (too small means users cross shards more often).
  — [ByteByteGo](https://blog.bytebytego.com/p/how-tinder-recommends-to-75-million); [High Scalability, "Designing Tinder" (cites Tinder shard maps)](https://highscalability.com/designing-tinder/)
- **[CONFIRMED, 2019]** At query time, an abstraction layer computes which geoshards overlap the user's distance filter, queries only those, and aggregates the results. The geosharded design handled "20 times more computations" than the previous setup. — [ByteByteGo](https://blog.bytebytego.com/p/how-tinder-recommends-to-75-million); [Tinder Tech Blog Part 1 (search snippet)](https://medium.com/tinder/geosharded-recommendations-part-1-sharding-approach-d5d54e0ec77a)
- **[CONFIRMED, 2019]** Cluster architecture:
  - Every geoshard is its own index in **one** Elasticsearch cluster. Multi-cluster was rejected because Elasticsearch had no native cross-cluster queries and it cost more to maintain.
  - Node roles are master, coordinating and data.
  - Replica counts follow activity (more for busy urban shards, temporary extras for hotspots).
  - Shards are allocated randomly across nodes so that peaks in different time zones (e.g. New York and Tokyo) even out.
  — [ByteByteGo](https://blog.bytebytego.com/p/how-tinder-recommends-to-75-million); [Tinder Tech Blog Part 2](https://medium.com/tinder/geosharded-recommendations-part-2-architecture-3396a8a7efb)
- **[CONFIRMED, 2019]** Consistency:
  - Documents move between shard indices when users move (including Passport). The layer deletes the document from the old shard and writes it to the new one.
  - Writes are ordered by keying updates on user ID to a fixed Kafka partition through consistent hashing.
  - Strongly consistent reads use the Get API (Elasticsearch search is only near-real-time).
  - A periodic background "refeed" resyncs the index with the source-of-truth database.
  — [ByteByteGo](https://blog.bytebytego.com/p/how-tinder-recommends-to-75-million); [Tinder Tech Blog Part 3](https://medium.com/tinder/geosharded-recommendations-part-3-consistency-2d2cb2f0594b)
- **[CONFIRMED by vendor case study, undated, current as of 2026]** Retrieval details:
  - Retrieval applies **hard filters (age, gender, distance)** plus lightweight ML models over geo-indexes, so "Elasticsearch examines only nearby profiles".
  - Tinder built a **custom plugin** that runs Java scoring logic during retrieval, generated by converting **LightGBM** models into optimized Java code.
  - Features (age, distance, app history) are packed into a compact binary feature set per candidate.
  - A **Roaring-bitmap exclusion filter** drops profiles the user has already acted on. A typical user has acted on about 10,000 profiles, and heavy users up to 70,000.
  - Reported gains: 4x lower CPU from geo-indexed retrieval, 47% lower scoring latency, 84% faster feature extraction, 60% faster filtering.
  - Runs on Amazon EKS with Elastic Cloud on Kubernetes.
  — [Elastic customer story: Tinder](https://www.elastic.co/customers/tinder)
- **[CONFIRMED, 2019]** The candidate pool refreshes on feedback: each Like or Nope on your profile updates who you see, with order changes appearing within about 24 hours. — [Engadget, Mar 2019](https://www.engadget.com/2019-03-18-tinder-dumps-desirability-scores.html)

### Inferences
- The retrieval pattern is **hard-filter first** (geo cell, age, gender, not-yet-seen), **cheap score second**, **expensive model on about 1,000 candidates third**. For Bink, one city fits in one Postgres table, so geosharding is unnecessary. The equivalent is a single SQL query:
  - hard filters: active account, not blocked, not already actioned, skill within ±N of the viewer, shares an area or home court
  - then an `ORDER BY` weighted score over a few hundred rows.
- The Roaring-bitmap exclusion maps to an `actions(viewer_id, target_id)` table with a composite primary key and a `NOT EXISTS` anti-join. At Bink's scale this stays cheap with a btree index.
- The "home court" model works like S2 cells: courts are natural geo buckets. A `player_courts` join stands in for "same shard", and PostGIS `ST_DWithin` on area or court centroids covers "nearby shards".
- Tinder's Kafka-ordered writes and refeed jobs exist to keep a derived search index consistent with the source of truth. Bink should avoid a derived index entirely by querying Postgres directly, or a materialized view refreshed on a schedule if the score becomes expensive.

### Gaps
- Exact current S2 levels, shard counts and the radius-to-shard fan-out numbers are not public. The 2019 posts were not directly fetchable (Medium returned 403), so details come through summaries.
- No official description of exactly how often a user's queue or "card stack" is regenerated, beyond the 2019 "within 24 hours" note.

## 3. ML: TinVec embeddings, swipe-based collaborative filtering, published models, talks and patents

### Takeaway
Tinder's public ML material is thin. It consists of TinVec (MLconf 2017: user-preference embeddings learned from swipes), LightGBM scoring inside Elasticsearch (current), GPU deep-learning ranking (current), a VLM-based photo ranker for Smart Photos (c. 2025-26), and the 2025-26 "Chemistry" LLM/vision features. The core swipe-matching patents cover UI and double opt-in, not ranking.

### Cited Findings
- **[CONFIRMED, 2017]** At MLconf 2017 San Francisco, Tinder Chief Scientist Dr. Steve Liu introduced **TinVec**: "TinVec embeds users' preferences into vectors leveraging on the large amount of swipes by Tinder users." The talk covered design, implementation, evaluation and use in personalized recommendations. The abstract cites 26M matches per day and over 20B matches to date. — [MLconf talk page](https://mlconf.com/?p=8768)
- **[SECONDARY/SPECULATIVE]** Third-party analyses describe TinVec as word2vec-style. Users who are right-swiped by the same swipers end up close in embedding space, and nearness is used to find more profiles a user is likely to like. This is collaborative filtering on co-liked users. This reading is not in Tinder's own abstract. — [RPubs analysis of Tinder recommender systems](https://rstudio-pubs-static.s3.amazonaws.com/760138_59d1714ecf6d4d109b62210d673ce2d7.html)
- **[CONFIRMED, current]** Retrieval-stage scoring uses LightGBM models compiled to Java inside Elasticsearch. Ranking uses deep-learning models on GPUs, and a reranker balances results. Elastic says Tinder "continues to explore" vector search, and the page is tagged kNN/two-tower, but the article body does not describe production vector retrieval. — [Elastic customer story: Tinder](https://www.elastic.co/customers/tinder)
- **[CONFIRMED, Tinder Engineering blog, c. 2025-26]** Smart Photos (photo ordering):
  - A fine-tuned open-source vision-language model (LoRA, rank 32) runs pairwise comparisons of a user's own photos. Labels came from a multi-armed bandit that rotated photos into the top slot and measured likes per impression, keeping only statistically significant, high-confidence pairs.
  - Results: pairwise accuracy about 76% (up from about 68% with the earlier CNN), ROC-AUC about 0.84. A/B tests showed more likes, matches and conversations.
  - The post notes "likes are a weak proxy" for photo quality.
  — [Life at Tinder: How Tinder Uses AI to Rank Profile Photos](https://lifeattinder.com/blog/how-tinder-r-uses-ai-to-rank-profile-photos)
- **[CONFIRMED, 2022]** Tinder says "anonymized cues" from photos are used to suggest profiles similar to ones you have Liked. This is content-based visual similarity. — [Tinder Press Room](https://www.tinderpressroom.com/powering-tinder-r-the-method-behind-our-matching/)
- **[CONFIRMED, patents]** The core patent family:
  - **US 9,733,811**, "Matching process system and method" (filed 21 Oct 2013; inventors include Sean Rad and Jonathan Badeen), a continuation-in-part of US 8,566,327.
  - Continuation **US 9,959,023** describes approval by right swipe and disapproval by left swipe.
  - Continuation **US 12,105,941** (granted 1 Oct 2024) claims swiping where the first user's interest "is unknown to the second user until after the second user expresses an interest in the first user".
  - Match Group asserted '811 against Bumble in 2018 (W.D. Tex.).
  — [Google Patents US9733811B2](https://patents.google.com/patent/US9733811B2); [USPTO Gazette US 12,105,941](https://patentsgazette.uspto.gov/week40/OG/html/1527-1/US12105941-20241001.html); [Justia: Tinder Inc. patents](https://patents.justia.com/assignee/tinder-inc); [Match v. Bumble complaint (archive.org)](https://archive.org/download/gov.uscourts.txwd.929326/gov.uscourts.txwd.929326.1.0.pdf)
- **[CONFIRMED, academic, non-Tinder]** A 2026 study on a large Japanese dating platform found that ranking by predicted dating probability (built from production login, like and reciprocation models) concentrates exposure on a few highly responsive users. Its fix, exposure-constrained deferred acceptance, increased congestion-adjusted "effective dates" and receiver-side outcomes in a field experiment, but reduced raw total dates. This is relevant evidence for "mutual-likelihood" ranking in general. — [Sekiya et al., arXiv:2602.19689, Feb 2026](https://arxiv.org/abs/2602.19689)
- **[CONFIRMED, academic]** The reciprocal-recommender literature documents popularity/exposure bias and proposes counterfactual corrections. — [Counterfactual Reciprocal Recommender Systems, arXiv:2508.01867](https://arxiv.org/html/2508.01867v1); [Fair Reciprocal Recommendation in Matching Markets, arXiv:2409.00720](https://arxiv.org/html/2409.00720v1)

### Inferences
- Tinder's stack is a common industrial shape: candidate generation (geo plus filters plus cheap GBDT), learned ranking, then reranking for business and fairness constraints. Embeddings (TinVec) supply affinity features.
- For Bink, ML is premature. With a few thousand users, a hand-weighted score (skill fit, style match, schedule overlap, shared courts, recency) beats collaborative filtering, which needs dense interaction data.
- Once Bink has a few thousand invite and accept events, a simple logistic regression or LightGBM on "invite accepted" could tune the weights offline.
- If Bink later wants embedding similarity, `pgvector` in Supabase is the small-scale analogue of TinVec plus kNN.

### Gaps
- TinVec slides and evaluation results were not retrievable. Whether TinVec is still in production is unconfirmed.
- No public details on Tinder's ranking-model objective (P(like), P(match), P(conversation)?), features, or the reranker's balancing rules.
- No Match Group patent was found that specifically describes the post-Elo ranking algorithm.

## 4. Mechanics: swipe queues, double opt-in, Super Likes and Boosts, like limits, cold start

### Takeaway
A match is a **double opt-in**: each user's Like stays hidden from the other until the other also Likes (patented). Boost is a confirmed paid ranking lever ("one of the top profiles in your area for 30 minutes"). Super Like is a paid signal Tinder markets as tripling match odds. Like limits for free users (introduced 2015) were justified as anti-spam and match-quality measures. Tinder has **not** officially documented a "new user boost".

### Cited Findings
- **[CONFIRMED, patent]** Double opt-in: the first user's interest "is unknown to the second user until after the second user expresses an interest in the first user". When a match is created, the matched users get the ability to contact each other. — [USPTO Gazette US 12,105,941](https://patentsgazette.uspto.gov/week40/OG/html/1527-1/US12105941-20241001.html); [Google Patents US9733811B2](https://patents.google.com/patent/US9733811B2)
- **[SPECULATIVE, outside system design]** A commonly proposed implementation splits the work:
  - Left swipes are persisted cheaply.
  - Right swipes go to matcher workers, which check whether the target has already liked the swiper (a "LikesCache"). If so, the worker writes a match keyed by the two user IDs and pushes it to both users over WebSockets. If not, it stores the like.
  This is not Tinder-confirmed. — [High Scalability, "Designing Tinder" (guest post by Ankit Sirmorya)](https://highscalability.com/designing-tinder/)
- **[CONFIRMED]** Boost makes you "1 of the top profiles in your area for 30 minutes" with "up to 10x more profile views". It launched worldwide in Oct 2016. Super Boost, launched May 2019 for subscribers, is a stronger multi-hour version. — [Tinder Help: What is Boost?](https://www.help.tinder.com/hc/en-us/articles/115004506186); [TechCrunch, 18 Oct 2016](https://techcrunch.com/2016/10/18/tinder-boost-letting-you-pay-to-skip-the-line-goes-live-worldwide); [TechCrunch, 31 May 2019](https://techcrunch.com/2019/05/31/tinder-launches-a-new-a-la-carte-option-super-boost-only-for-subscribers)
- **[CONFIRMED claim; SECONDARY dispute]** Super Like launched globally in Oct 2015. Tinder claims Super Liking makes you 3x more likely to match. Swipestats' analysis of more than 7,000 user data exports found heavy Super Like senders (top 1%) had a 1.94% match rate against a 2.04% median. — [TechCrunch, 1 Oct 2015](https://techcrunch.com/2015/10/01/tinders-super-like-rolls-out-globally/?ncid=rss); [Swipestats](https://www.swipestats.io/blog/super-like-on-tinder)
- **[CONFIRMED, Mar 2015]** The right-swipe limit for free users targeted people who "only swipe right just to see who likes them back" and spam bots. Ten days after launch, matches per right swipe rose 25%, messages per match rose 25%, and spam bots fell by more than 50%. Rad: "there is a diminishing return on every match." Unlimited likes became a paid feature as a "barrier to entry for spam bots". — [TechCrunch, 12 Mar 2015](https://techcrunch.com/2015/03/12/hate-it-or-love-it-tinders-right-swipe-limit-is-working)
- **[SECONDARY, 2026]** The current free like allowance is not published by Tinder. Third-party guides report roughly 25 to 100 likes per window, with resets reported as 12 hours (older) or 24 hours (some 2026 guides). The allowance may vary by account or test. — [Photofeeler, "Tinder swipe limit" 2026](https://blog.photofeeler.com/tinder-swipe-limit/); [Roast.dating](https://roast.dating/blog/how-many-likes-on-tinder)
- **[CONFIRMED]** Top Picks are a daily curated set that refreshes every 24 hours. Free users get 1 per day, while Gold and Platinum get the full set (about 10). Selection criteria are undisclosed ("curated"). — [Tinder Help: Top Picks](https://www.help.tinder.com/hc/articles/360005039092); [Tinder FAQ](https://tinder.com/en-AU/faq)
- **[CONFIRMED, 2022]** Activity is "the most important factor". Members active at the same time are prioritized, so regular use increases exposure. — [Tinder Press Room](https://www.tinderpressroom.com/powering-tinder-r-the-method-behind-our-matching/)
- **[CONFIRMED, 2019]** Tinder's Kafka ordering keys every user update to one partition. This matters for match detection races, because two near-simultaneous mutual likes must be resolved exactly once. — [ByteByteGo summary of Tinder Part 3](https://blog.bytebytego.com/p/how-tinder-recommends-to-75-million)

### Inferences
- Bink's equivalent of the swipe is an "invite to play" or "interested" action. A double opt-in fits naturally: hide outgoing interest until it is reciprocated, then create a `matches` row (or chat thread).
- In Postgres, the race-safe pattern has three parts:
  - a `likes(liker_id, likee_id)` table with a primary key
  - an `AFTER INSERT` trigger (or `SECURITY DEFINER` RPC) that checks `EXISTS (likee→liker)` and inserts into `matches(user_a, user_b)` with `user_a < user_b` and a unique constraint, using `ON CONFLICT DO NOTHING`
  - RLS rules that let a user read only their own outgoing likes and their matches, never incoming likes (or allow incoming likes only as a paid or "who liked you" feature)
- Boost-style ranking inputs are a monetization lever, not a matching-quality signal. For Bink, the analogues are a temporary "looking to play today" status (high value, honest signal of availability) rather than paid placement.
- Like limits as anti-spam: a modest daily cap on invites to people the user hasn't played with would curb mass-inviting and keep acceptance rates meaningful.
- Cold start: a new user has no behavioural data, so a court-and-schedule-based score (plus a small, time-boxed recency bonus) is the natural fallback.

### Gaps
- **No official Tinder source confirms a "new user boost"** (a visibility bump for new profiles). It is widely asserted in third-party guides but unverified. Tinder only says activity matters most.
- No official statement found on whether a Super Like changes a candidate's *rank position* in the recipient's stack (vs. just highlighting the card). Older reporting says Super Liked profiles show with a blue indicator, but this was not verified in this pass.
- No confirmed description of Tinder's actual match-detection service or data store.

## 5. Fairness, anti-abuse and known pitfalls (popularity concentration, inequality of likes, Gini)

### Takeaway
Swipe markets concentrate attention heavily. Men like far more indiscriminately, women are highly selective, and a small share of profiles get a large share of likes. Ranking purely on predicted reciprocity worsens congestion. Tinder's public mitigations are like limits (2015), a reranker that "balances" results, and anti-spam measures, but it publishes no fairness metrics. Popular "Gini" figures for Tinder are informal.

### Cited Findings
- **[CONFIRMED, academic, 2016]** Tyson et al.'s "A First Look at User Activity on Tinder" found that women get many matches quickly while men accumulate matches slowly. Men like a far larger share of profiles and women are highly selective, a feedback loop that leads to "starvation of matches for men". — [arXiv:1607.01952](https://www.arxiv.org/pdf/1607.01952)
- **[SPECULATIVE/informal]** A widely cited "Tinder economy" Gini coefficient of 0.58 comes from a blogger's small, self-collected experiment. It claims the "bottom 80% of men compete for the bottom 22% of women". It is not rigorous. — [Medium, "Worst-Online-Dater", Tinder Experiments II](https://medium.com/@worstonlinedater/tinder-experiments-ii-guys-unless-you-are-really-hot-you-are-probably-better-off-not-wasting-your-2ddf370a6e9a)
- **[SECONDARY, Hinge not Tinder, 2017]** Quartz, from Hinge data: the top 1% of men get more than 16% of all likes vs. just over 11% for the top 1% of women. Reported Gini values for Hinge likes conflict across write-ups (0.542 vs. 0.73 for men and 0.63 for women). — [Quartz](https://qz.com/1051462/these-statistics-show-why-its-so-hard-to-be-an-average-man-on-dating-apps/); [Medium follow-up](https://medium.com/@worstonlinedater/dating-apps-are-mostly-a-waste-of-time-for-guys-unless-you-are-really-hot-and-the-rest-of-us-will-9b65c3bd0b88)
- **[CONFIRMED, academic, 2026]** Ranking by predicted dating probability concentrates exposure on a few highly responsive users. Capping each receiver's *expected* inbound likes (exposure-constrained deferred acceptance) improved equity and receiver outcomes in a field experiment without hurting downstream engagement, but lowered raw total dates. — [Sekiya et al., arXiv:2602.19689](https://arxiv.org/abs/2602.19689)
- **[CONFIRMED, academic, 2023]** A dating-platform study (Lehmann, Terrier & Lalive) documents large excess demand ("congestion") for some women. — [QMUL working paper](https://www.qmul.ac.uk/sef/media/econ/research/workingpapers/wp964.pdf)
- **[CAUTION]** The "FAIR-MATCH" arXiv paper on dating-app popularity bias has been **withdrawn** for errors, so its statistics (e.g. a 78% figure) should not be used. — [arXiv:2507.01063](https://www.arxiv.org/pdf/2507.01063)
- **[CONFIRMED]** Tinder's reranker "balance[s]" results after ML ranking (no detail given). Like limits cut spam bots by more than 50% (2015). Unmatch and report reasons are fed back to the reported user. Tinder says it does not use ethnicity, religion or social status in recommendations. — [Elastic](https://www.elastic.co/customers/tinder); [TechCrunch 2015](https://techcrunch.com/2015/03/12/hate-it-or-love-it-tinders-right-swipe-limit-is-working); [Tinder Press Room](https://www.tinderpressroom.com/powering-tinder-r-the-method-behind-our-matching/)
- **[SECONDARY]** Critics note the commercial incentive: an engagement-heavy ranking pushes users toward paid visibility (Boost and Super Like). — [Engadget 2019](https://www.engadget.com/2019-03-18-tinder-dumps-desirability-scores.html)

### Inferences
- Bink's pickleball setting is less asymmetric than romantic dating (same-sex play, doubles groups, no "league" dynamic), but the same failure mode applies: strong players or very active players near popular courts could absorb most "for you" slots and get flooded with invites.
- Mitigations for Bink:
  - an **exposure cap** (down-rank players who have many pending unanswered invites in the last 7 days)
  - **skill-band matching** as a hard or soft filter, which naturally spreads attention
  - **randomized tie-breaking or rotation**, so ordering is not static
  - a simple monitored metric: the distribution (Gini or top-10% share) of impressions and invites received per player
- Anti-abuse at small scale: daily invite caps, block and report tables enforced in RLS (blocked users never appear in either direction), and rate-limits in RPCs.

### Gaps
- Tinder publishes no fairness metrics, exposure caps, or Gini data of its own. All quantitative inequality figures are third-party or from other apps (Hinge, a Japanese platform).

## 6. Infrastructure at a high level, and what matters at small scale

### Takeaway
Tinder's confirmed infrastructure (2019 onward) is microservices on Kubernetes (EKS), Elasticsearch for geosharded candidate retrieval, Redis (Amazon ElastiCache) as a heavily used cache, Kafka for ordered update streams, GPU-served deep ranking models, and an in-house LLM serving platform. Almost all of this exists to handle tens of millions of users across 190 countries, and none of it is needed for a single-city app.

### Cited Findings
- **[CONFIRMED, Apr 2019]** Tinder migrated its platform to Kubernetes (2018 to early 2019), reaching about 1,000 nodes and 15,000 pods, with problems around traffic volume, cluster size and DNS. — [Tinder Tech Blog, "Tinder's move to Kubernetes"](https://medium.com/@TinderEng/tinders-move-to-kubernetes-cda2a6372f44)
- **[CONFIRMED, Jun 2019 and Jan 2020]** Tinder moved self-hosted Redis to Amazon ElastiCache (cluster-mode Redis), because Redis cache-node failover was its largest single source of app downtime. — [AWS Database Blog, "Building resiliency at scale at Tinder with Amazon ElastiCache"](https://aws.amazon.com/blogs/database/building-resiliency-at-scale-at-tinder-with-amazon-elasticache); [Tinder Tech Blog, "Taming ElastiCache with Auto-discovery at Scale"](https://medium.com/tinder/taming-elasticache-with-auto-discovery-at-scale-dc5e7c4c9ad0)
- **[CONFIRMED, current]** Elasticsearch runs on Amazon EKS via customized Elastic Cloud on Kubernetes. The ranking models run on GPUs outside Elasticsearch. — [Elastic customer story](https://www.elastic.co/customers/tinder)
- **[CONFIRMED, 2019]** Kafka partitions, keyed by user ID, order the writes to the search index, and periodic refeed jobs reconcile the index with the primary datastore. — [ByteByteGo](https://blog.bytebytego.com/p/how-tinder-recommends-to-75-million)
- **[CONFIRMED, c. 2025-26]** An in-house LLM serving platform (continuous batching, KV-cache optimization, quantization) serves the photo-ranking VLM. — [Life at Tinder](https://lifeattinder.com/blog/how-tinder-r-uses-ai-to-rank-profile-photos)
- **[CONFIRMED, scale]** Scale figures:
  - 26M matches per day and over 20B total (2017)
  - "75 million users" (2024 summary)
  - users typically acted on about 10k profiles, heavy users about 70k (current)
  — [MLconf](https://mlconf.com/?p=8768); [ByteByteGo](https://blog.bytebytego.com/p/how-tinder-recommends-to-75-million); [Elastic](https://www.elastic.co/customers/tinder)
- **[SPECULATIVE]** Outside system-design write-ups propose DynamoDB or Riak for profiles and matches, S3 for photos and archived left swipes, and Kinesis or SQS for swipe streams. None of these are confirmed by Tinder. — [High Scalability](https://highscalability.com/designing-tinder/)

### Inferences
- A small-scale mapping of Tinder's components onto Supabase for Bink:
  - Elasticsearch geoshards → Postgres plus PostGIS (or plain area/court joins)
  - Roaring-bitmap exclusion → indexed `actions` anti-join
  - LightGBM in-retrieval scoring → a SQL scoring expression or a `SECURITY DEFINER` function such as `get_for_you(viewer_id)` returning the top N
  - Kafka-ordered match detection → a transactional trigger with unique constraints
  - Redis cache → unnecessary at first, or an optional materialized view of precomputed scores refreshed with `pg_cron`
  - Push notifications → Supabase Realtime on the `matches` table
- RLS is the key control Tinder doesn't need to discuss publicly. In Bink:
  - the ranking function should run as `SECURITY DEFINER` so it can read other players' availability and skill
  - it should return only public profile fields
  - row access to the `likes` and `invites` tables should be limited to their owners
- Tinder's experience with derived indices (consistency bugs, refeeds) argues for keeping one source of truth as long as possible.

### Gaps
- No current (2025-26) official Tinder architecture overview covering match storage, the primary database or the notification path. The newest confirmed details are the Elastic case study and the photo-ranking post.
