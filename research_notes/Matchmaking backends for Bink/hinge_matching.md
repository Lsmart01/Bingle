# Hinge's Matchmaking and Recommendation Backend (for Bink design)

Research date: 2026-11-24. Labels used: **[Confirmed]** = stated by Hinge or Match Group (press release, help center, SEC filing, named exec quote). **[Press]** = journalist description, not directly attributed. **[3rd-party]** = blog, SEO or student source, low confidence. **[Academic]** = peer-reviewed or preprint research. Older items carry their date because Hinge has replaced its core recommender since then (see Q3).

---

## Q1. How Hinge applies Gale–Shapley in practice, and the limits of stable matching when preferences are inferred and the market is two-sided

### Takeaway
Hinge has said since 2018, and repeated in 2024, that its matching is "based on a variation of the Gale-Shapley algorithm" combined with machine learning. Gale–Shapley is the stable-matching method that pairs people by having them "propose" down ranked lists. Hinge runs it on preference rankings it infers from user behaviour, not on lists users state, and treats everyone as one pool (the "stable roommates" variant). It has never published the details. Recent research suggests the useful part of the idea for a recommender is the cap on how many people see each receiver (exposure), not the stability guarantee. It also finds that the ranking target matters a great deal: predicted mutual outcomes beat predicted one-way likes.

### Cited Findings
- **[Confirmed, 2018]** Most Compatible launched on iOS on July 11, 2018, with Android on July 17. It places one recommended person at the top of the Discover feed each day. — [TechCrunch, 2018](https://techcrunch.com/?p=1668547)
- **[Confirmed, 2018]** Hinge said it uses the Gale–Shapley algorithm (Gale & Shapley, 1962, the "stable marriage problem"). Because the classic version assumes two sides, one man and one woman each, Hinge uses the "stable roommate problem", where all users sit in a single pool without gender divisions. — [TechCrunch, 2018](https://techcrunch.com/?p=1668547)
- **[Confirmed, 2018]** CEO Justin McLeod described the design as reciprocal: the person you are shown is also being shown you, which he called "the best pairing Hinge can find within its user base." He also said the feature aims to "go on all your bad dates for you, so that we can help figure out who you'll end up with." — [TechCrunch, 2018](https://techcrunch.com/?p=1668547)
- **[Confirmed, 2018]** The inputs are preferences learned from each user's likes and passes. Preferences are inferred, not stated. — [TechCrunch, 2018](https://techcrunch.com/?p=1668547)
- **[Confirmed, 2018]** In early tests, users were about 8x more likely to go on dates with Most Compatible picks than with other Hinge recommendations. Here a "date" was measured as exchanging phone numbers. — [TechCrunch, 2018](https://techcrunch.com/?p=1668547)
- **[Press/uncertain, 2018]** Some 2018 coverage says Most Compatible picks appear for both people at the same time and disappear after 24 hours. Some also say the system looks at about the last 24 hours of activity, including which profile elements a user liked or dismissed. I could not tie these details to a primary Hinge statement. — [Engadget, 2018](https://www.engadget.com/2018/07/12/hinge-most-compatible-suggestions/); [The Hustle](https://thehustle.co/hinge-machine-learning-algorithm)
- **[Confirmed, Jan 2024]** A Hinge spokesperson told Fortune the algorithm is "based on a variation of the Gale-Shapley algorithm" and combines that formula with machine learning to pair people with the partners they are most likely to prefer, based on their liking history. — [Fortune, 2024-01-18](https://fortune.com/2024/01/18/hinge-ceo-justin-mcleod-interview-attractiveness-score-algorithm-rose-jail/)
- **[3rd-party]** A student critique: in the two-sided (bipartite) version, Gale–Shapley gives the proposing side its best stable partner but gives no such guarantee to the receiving side. That makes it slightly inequitable for receivers. The writers also note that Hinge has never published how its version works. — [Cornell INFO 2040 blog, 2021](https://blogs.cornell.edu/info2040/2021/09/30/hinge-and-its-implementation-of-the-gale-shapley-algorithm)
- **[Academic, 2026]** Sekiya, Otani, Komatsu, Ohkawa and Noda (University of Tokyo with MiDATA) built deferred acceptance (DA, another name for Gale–Shapley) into a production two-sided recommender. The platform was CoupLink, a Japanese dating service with over 1.5M cumulative users. The paper is arXiv 2602.19689, February 2026. — [arXiv](https://arxiv.org/html/2602.19689v1)
  - They compared three ways of turning predictions into recommendations: "One-sided" top-k (each user sees their top-k predictions, with no cap on any receiver), DA with a headcount cap per receiver, and "exposure-constrained DA" (ECDA), which caps each receiver's expected likes or expected dates.
  - The ranking target mattered most. When people were ranked by predicted **like rate**, the market produced 0.0401 average dates and 0.0241 "effective dates". The paper's effective dates discount each date for how many other dates the receiver already has. When ranked by predicted **dating rate**, where dating rate = P(login) × P(like) × P(login) × P(relike), results were 0.1231 and 0.0579. Like-rate ranking produced more likes (5.384 vs 3.693) but far fewer dates.
  - When the ranking is by dating rate, they prove that DA and ECDA reduce to a fast greedy pass over candidate pairs (Theorems 1–2). That makes them cheap to compute.
  - Exposure was concentrated before the change. In the field pre-period, the top 0.1% of receivers got 4.6% of all recommendations. Their reply rate after a mutual like (messages exchanged after relike) was about one-third of other receivers' rate.
  - Field experiment, Kanto vs Kansai-Tokai, January 13–26, 2026, compared by difference-in-differences: predicted effective dates (+0.001) and the chance a receiver gets a date (+0.004) rose. Realized dating probability was not significantly different from zero, and receiver messaging fell slightly. With only two regions, the authors treat the significance results as suggestive.
  - The authors state that stability and proposer-side strategy-proofness are "not essential" in a recommendation setting. Strategy-proofness means users gain nothing by misreporting their preferences.
- **[Academic]** Other dating-market work frames recommendation as a trade-off between relevance and congestion. Rios & Torrico test against proprietary data from a major US dating app. Chen, Hsieh & Lin report that standard machine-learning recommenders create congestion and that an "equilibrium" recommender raised hit rate 19x over content filtering. Lehmann, Terrier & Lalive find that anti-congestion policies can hurt the side of the market that benefits from congestion. — [Rios & Torrico, arXiv 2308.02584](https://arxiv.org/pdf/2308.02584); [Chen/Hsieh/Lin (UCR seminar paper)](https://webarchive.ucr.edu/economics.ucr.edu/wp-content/uploads/2019/10/Hseih-paper-for-4-3-19-seminar-title-2.pdf); [Lehmann et al., QMUL WP 964](https://www.qmul.ac.uk/sef/media/econ/research/workingpapers/wp964.pdf)

### Inferences
- Hinge most likely uses Gale–Shapley as an assignment step after machine learning. A model predicts pairwise preference scores, the scores are turned into ranked lists for each user, and a stable-roommates-style pass picks one reciprocal "Most Compatible" pair per user per day. Hinge has confirmed "variation of Gale-Shapley + machine learning", but not this pipeline order.
- Stability guarantees mean little when the ranked lists are model estimates and users can always browse outside the assignment. A pair counts as "blocking" when both would prefer each other to their assigned partners. A blocking pair under the true (unknown) preferences can't be detected. The practical value of the algorithm is that it creates **reciprocity and a per-receiver capacity limit**: no one is everyone's top pick.
- **For Bink:** pickleball matching is mostly not one-to-one. A player wants several partners, and doubles involves groups of four. A Gale–Shapley variant that allows several matches per player (a many-to-many version, like Roth's hospital-residents setup) or the greedy ECDA equivalent fits better than strict one-to-one stable marriage. A sensible MVP is: score pairs by a predicted mutual outcome (both accept and actually play), then fill a daily "top pick" list greedily, with a cap on how many people can be shown any one player. This can run as a nightly SQL or Edge Function job in Supabase.

### Gaps
- No Hinge engineering blog post, patent or talk describing the actual implementation was found: model types, how ranked lists are built, list length, how ties are broken, or how the odd-person-out case in stable roommates is handled. Stable roommates does not always have a stable solution, and Hinge's fallback is unknown.
- Whether Most Compatible still uses Gale–Shapley after the March 2025 deep-learning recommender change is not confirmed. The 2024 spokesperson statement predates that change.
- I found no public interviews with a "Tim MacGougan" or with members of Hinge's ML team about the algorithm. I could not verify the name or role.

---

## Q2. How Hinge infers preferences, and its feedback loops

### Takeaway
Hinge has confirmed four signal sources. It learns from **likes and passes** (now mainly through a deep-learning model). It builds a "taste profile" that weights **who you like** and **who likes you back** equally. It asks for **post-date "We Met" feedback** after users exchange numbers. It treats **reply behaviour** as a quality signal, enforced through product rules such as Your Turn Limits. Hinge has also explicitly denied having an attractiveness score.

### Cited Findings
- **[Confirmed, Jan 2024]** McLeod: "we don't really have an attractiveness score." Hinge instead builds an individual "taste profile" from who a user likes and who likes them back, and McLeod said the two are weighted equally. — [Fortune, 2024-01-18](https://fortune.com/2024/01/18/hinge-ceo-justin-mcleod-interview-attractiveness-score-algorithm-rose-jail/)
- **[Confirmed, Jan 2024]** McLeod advised users not to try "to get as many likes as possible." He said being authentic gives "the greatest signal", which implies that selective liking makes the inferred preferences more useful. — [Fortune, 2024](https://fortune.com/2024/01/18/hinge-ceo-justin-mcleod-interview-attractiveness-score-algorithm-rose-jail/)
- **[Confirmed, Oct 2018]** "We Met" launched in October 2018. A few days after two matches exchange phone numbers in the app, Hinge asks whether they met, whether they enjoyed it, and whether they would want a second date. Hinge says it created the feature "to learn about our members' dates in order to provide better recommendations in the future", and that it never shares feedback with matches. In beta, 90% said their first dates were great and 72% wanted a second. — [TechCrunch, 2018-10-16](https://techcrunch.com/2018/10/16/hinge-is-first-dating-app-to-actually-measure-real-world-success); [Hinge Help: What is We Met](https://help.hinge.co/hc/en-us/articles/360010692913-What-is-We-Met)
- **[Press, 2018]** Coverage said Hinge planned to combine We Met data with other signals to infer which dates became relationships. Those signals included users going inactive or deleting their accounts, and email surveys. — [VentureBeat](https://venturebeat.com/business/hinge-now-wants-to-know-how-your-date-went-so-it-can-make-better-matches); [Bustle](https://www.bustle.com/p/hinges-new-feature-we-met-wants-to-use-feedback-from-your-date-to-give-you-more-compatible-matches-12615813)
- **[Confirmed, 2018]** Most Compatible learns preferences from likes and passes. — [TechCrunch, 2018](https://techcrunch.com/?p=1668547)
- **[Confirmed, 2025]** The new Discover recommender "uses deep learning to deliver more thoughtful recommendations by better predicting mutual compatibility." The target is mutual (both sides), not one-sided appeal. — [Hinge newsroom, 2025-11-10](https://hinge.co/newsroom/hinge-2025-product-evolution)
- **[Confirmed, 2025]** Other structured signals Hinge collects:
  - **Match Note** (February 2025): users can privately note identity, lifestyle or relationship details before chatting.
  - **"Did This Bother You?"**: asks recipients about messages they received, to refine content filtering.
  - **Prompt Feedback** (January 2025): tips on making Prompt answers more personal, refined using users' feedback on the tips.

  Hinge's release does not say whether these feed into ranking. — [Hinge newsroom, 2025-11-10](https://hinge.co/newsroom/hinge-2025-product-evolution)
- **[Confirmed, May 2025]** Match Group said Hinge would enhance "Warm Introductions" to "highlight shared interests to improve match quality." — [Match Group Q1 2025 prepared remarks, SEC Ex. 99.2](https://www.sec.gov/Archives/edgar/data/0000891103/000089110325000074/mtch8-k20250508ex992.htm)
- **[Product mechanic, widely documented]** On Hinge a user likes or comments on a *specific* photo or prompt rather than the whole profile. This gives the system feedback on individual profile elements. The 2018 coverage refers to "which profile elements a user liked or dismissed." — [Engadget, 2018](https://www.engadget.com/2018/07/12/hinge-most-compatible-suggestions/)

### Inferences
- The feedback loop is layered, from weakest to strongest signal: like or pass (on a specific profile element) → mutual match → messages and reply → phone-number exchange → "We Met" rating. Hinge's measured outcomes move steadily down this funnel. The 2018 8x figure counted number exchanges, and 2025 reporting counts "matches and contact exchanges". This matches the academic finding that optimising for the deeper outcome beats optimising for likes.
- **For Bink:** the matching outcome is clear and easy to observe: did the two players actually play, and would they play again? A "We Played" check-in after a game is the direct equivalent of We Met. It also gives a labelled signal for whether the skill match was right. Store it as an `interactions` or `play_feedback` table (one row per user, with a target user and an event type: view, like, pass, message, played, rating) so that weights can be learned later. Weighting "who you like" and "who likes you back" equally maps naturally to scoring both directions of each pair.

### Gaps
- Whether comments (as opposed to plain likes) are weighted more heavily is not confirmed by Hinge.
- No primary source confirms Hinge uses collaborative filtering as such. The public wording is "machine learning", then "deep learning". It is not known whether We Met feeds the current model directly.
- Cold start, meaning how new users are ranked before any behavioural data exists, is not documented publicly.

---

## Q3. How Discover, Standouts and Most Compatible are generated and refreshed; dealbreakers vs soft preferences

### Takeaway
Discover is the main ranked feed. Since late March 2025 it has been driven by a deep-learning recommender that predicts mutual compatibility. Hinge says this delivered a 15%+ lift in matches and contact exchanges. Most Compatible (2018) is a single daily reciprocal pick. Standouts is a separate daily batch, weighted toward people you are likely to like, and you can only act on it with Roses. Dealbreakers are hard filters, and the free tier allows only a few of them. Other preferences are soft and can be relaxed.

### Cited Findings
- **[Confirmed, May 2025]** "Since launching globally in late March, our new AI-powered recommendation algorithm has driven a greater than 15% increase in matches and contact exchanges." — [Match Group Q1 2025 prepared remarks, SEC](https://www.sec.gov/Archives/edgar/data/0000891103/000089110325000074/mtch8-k20250508ex992.htm); [Match Group Q1 2025 release](https://ir.mtch.com/investor-relations/news-events/news-events/news-details/2025/Match-Group-Announces-First-Quarter-Results/)
- **[Confirmed, Nov 2025]** Hinge describes the change as "global changes to Hinge's core recommendation system in Discover" contributing to "a double-digit increase in matches overall". It also encourages daters to loosen some filters, such as distance, and explains how dealbreakers and "Prefer Not to Say" answers affect who can see them. — [Hinge newsroom, 2025-11-10](https://hinge.co/newsroom/hinge-2025-product-evolution)
- **[Confirmed, Jun 2025]** CMO Jackie Jantos, later CEO: "Our recommendations have gotten really strong with the new AI recommender that we recently released." — [TechCrunch, 2025-06-03](https://techcrunch.com/2025/06/03/hinge-cmo-jackie-jantos-hopes-to-help-make-gen-zers-less-lonely)
- **[Confirmed, 2018]** Most Compatible is one pick placed at the top of Discover each day. — [TechCrunch, 2018](https://techcrunch.com/?p=1668547)
- **[Confirmed, Jan 2024]** McLeod on Standouts: "Standouts are people that are a bit more weighted towards, you're likely to like them". In other words, Standouts lean toward your interest in them rather than their likely interest in you. — [Fortune, 2024](https://fortune.com/2024/01/18/hinge-ceo-justin-mcleod-interview-attractiveness-score-algorithm-rose-jail/)
- **[Press/Help center summary]** Standouts is a daily feed of profiles "getting the most attention", tailored to the user's preferences, mutual dealbreakers and recent activity. A new set appears daily, and some Standouts may later appear in Discover. Users can only respond with a Rose. — [Fortune, 2024](https://fortune.com/2024/01/18/hinge-ceo-justin-mcleod-interview-attractiveness-score-algorithm-rose-jail/); Hinge Help "What is Standouts" (help.hinge.co article 360057625534; returned 403 to my fetch, so content came via search snippet)
- **[Confirmed via press, Jan 2024]** Filters at that time:
  - Free tier: dealbreaker-capable filters only for location, age range, ethnicity, religion and maximum distance.
  - Hinge+: adds preferences such as height and education.
  - HingeX: adds "enhanced recommendations" and a profile boost.

  — [Fortune, 2024](https://fortune.com/2024/01/18/hinge-ceo-justin-mcleod-interview-attractiveness-score-algorithm-rose-jail/)
- **[Confirmed, Jan 2024]** McLeod denied that the algorithm pushes users toward paying, saying "the free product is sacred" and "We really only charge for what we say we can't give away for free." — [Fortune, 2024](https://fortune.com/2024/01/18/hinge-ceo-justin-mcleod-interview-attractiveness-score-algorithm-rose-jail/)
- **[3rd-party]** Standouts refresh daily with an in-app timer. The exact refresh time is not fixed in any official source I found. — [SwipeStats](https://www.swipestats.io/blog/hinge-standouts)

### Inferences
- The architecture implied by these facts is likely:
  1. Hard filters: mutual dealbreakers, applied in both directions as a WHERE clause.
  2. A model scores the remaining candidates for predicted *mutual* outcome.
  3. Separate surfaces read from that scored pool. Most Compatible is the reciprocal top-1, assigned by Gale–Shapley as a daily batch. Standouts is a daily batch weighted toward the viewer's one-sided interest and monetised. Discover is a ranked queue served as the user swipes.

  Daily batches are confirmed for Most Compatible and Standouts. Whether the Discover candidate set is scored in real time or precomputed is not public.
- "Prefer Not to Say" combined with dealbreakers means a user who leaves a field blank can be excluded by someone who set a dealbreaker on that field. This is a lesson for Bink: decide explicitly whether a missing DUPR rating passes or fails a "DUPR ≥ X" filter.
- **For Bink:** treat skill band, area or distance, and possibly play style as *hard* filters only when the user marks them as dealbreakers. Otherwise use them as soft score terms, for example a penalty for skill gap or a bonus for overlapping home courts or play times. In Supabase, hard filters belong in the query or RLS policy. Soft scores can go in a SQL function or a nightly materialised table such as `recommendations(user_id, candidate_id, score, surface, generated_at)`.

### Gaps
- Discover's ranking features and whether scoring is real-time or batch are not disclosed.
- No official statement says whether Most Compatible still exists in its 2018 form or has been folded into the 2025 recommender.
- The help-center page for Standouts could not be fetched directly (403).

---

## Q4. Mechanics: limited daily likes, Your Turn Limits, roses, and their effect on supply, demand and ranking

### Takeaway
Hinge deliberately limits how many likes, Roses and open conversations each user can have. The limits make every signal mean more and stop a small group of users from being flooded. Free users get a capped number of daily likes (about 8) and one free Rose per week. Your Turn Limits blocks new connections while too many matches are waiting on your reply. Roses go to the top of the recipient's list and are reported to double date conversion.

### Cited Findings
- **[Confirmed, Jan 2024]** "Roses are two times more effective at actually getting you on a date." Users get one free Rose per week and can buy more. McLeod: "If everyone had unlimited Roses, then that Rose wouldn't mean anything anymore." — [Fortune, 2024](https://fortune.com/2024/01/18/hinge-ceo-justin-mcleod-interview-attractiveness-score-algorithm-rose-jail/)
- **[3rd-party, consistent across sources]** Roses appear at the top of the recipient's "Likes You" screen and do not count against the daily like limit. Paid tiers give unlimited likes, but extra Roses are not included in Hinge+ or HingeX. — [SwipeStats](https://www.swipestats.io/blog/hinge-standouts); [Business Insider NL](https://www.businessinsider.nl/heres-what-you-need-to-know-about-hinges-new-roses-feature-thats-meant-to-help-you-stand-out-on-the-dating-app/)
- **[Government guide / 3rd-party]** About 8 free likes per day are commonly cited. Hinge confirms a daily limit but does not publish one fixed number for all accounts. — [eSafety Commissioner guide](https://esafety.gov.au/key-topics/esafety-guide/hinge); [SwipeStats](https://www.swipestats.io/blog/how-many-likes-a-day-on-hinge)
- **[Confirmed, Sep 18 2024]** Your Turn Limits launched globally after a test. Daters with "too many people waiting on their response" must reply or end conversations before connecting with anyone new.
  - Test results: responsiveness +20%. 48% said it helped them focus on quality over quantity. 45% said it helped them focus on current matches. 45% said it made them more thoughtful about who they match with.
  - Rationale: Hinge cited analysis paralysis and dating burnout.

  — [Hinge press](https://hinge.co/press/your-turn-limits); [Hinge Help](https://help.hinge.co/hc/en-us/articles/31662181659027-What-is-Your-Turn-Limits)
- **[Government guide]** The threshold is reported as 8 or more matches you haven't responded to. Hinge's own pages give no number. — [eSafety Commissioner](https://esafety.gov.au/key-topics/esafety-guide/hinge)
- **[Press]** "Rose Jail" is user slang for Standouts profiles that can only be reached by sending Roses. — [Fortune, 2024](https://fortune.com/2024/01/18/hinge-ceo-justin-mcleod-interview-attractiveness-score-algorithm-rose-jail/)

### Inferences
- These limits act as the market-design counterpart to the capacity limits in Gale–Shapley and ECDA. Like caps limit demand per sender. Your Turn Limits limits how many open conversations a receiver carries. Roses work as a costly signal: an expensive, scarce way to show strong interest, which is why they convert better. Together they reduce the congestion described in Q1 and Q6.
- **For Bink:** pickleball has a natural capacity limit, since a player can only play so many games a week. A Your Turn-style rule fits well: cap pending, unanswered "want to play?" requests per player, and hide players who are already saturated. A scarce "priority invite", for example one per week, would mimic Roses without needing payments.

### Gaps
- No official numbers for like caps, the Your Turn threshold, or the Rose allowance were found on Hinge's own pages. Numbers come from eSafety and third parties.
- No official statement on whether sending or receiving Roses changes a user's ranking in Discover.

---

## Q5. Engineering posts, talks, patents, data-science interviews, and newer AI features (2024–2026)

### Takeaway
Hinge has published very little about its engineering. Public knowledge comes from press releases, exec interviews and Match Group investor materials. From 2024 to 2026 the AI story is: a deep-learning recommender predicting mutual compatibility (March 2025, 15%+ lift), Prompt Feedback (January 2025), AI-powered comment filtering (March 2025), and Convo Starters (in test). In December 2025, McLeod left to run Overtone, a separate AI-matchmaking venture backed by Match Group, and Jackie Jantos became Hinge CEO.

### Cited Findings
- **[Confirmed]** The AI recommender launched globally in late March 2025 with a >15% lift in matches and contact exchanges. — [SEC Ex. 99.2, May 8 2025](https://www.sec.gov/Archives/edgar/data/0000891103/000089110325000074/mtch8-k20250508ex992.htm)
- **[Confirmed, Nov 2025]** 2025 feature list from Hinge's newsroom: Prompt Feedback (January 2025); "Are You Sure?" and "Did This Bother You?" (early 2025); Comment Filter with added AI-powered filtering (March 2025); Match Note (February 2025); chat-specific notifications; Your World Prompts with Esther Perel (June 2025); Convo Starters (in test; topic ideas for a first message shown when viewing a profile); and a September 2025 moderation change that removes only the item that violated policy. — [Hinge newsroom, 2025-11-10](https://hinge.co/newsroom/hinge-2025-product-evolution)
- **[Confirmed, Dec 2025]** McLeod stepped down as Hinge CEO to lead Overtone, a standalone AI dating venture backed by Match Group, which planned to lead Overtone's first funding round in early 2026. Jackie Jantos was promoted to CEO. — [Match Group / Nasdaq release](https://www.nasdaq.com/press-release/match-group-announces-leadership-transition-hinge-and-strategic-spinout-new-venture); [The Star (Reuters)](https://www.thestar.com.my/tech/tech-news/2025/12/10/hinge-ceo-mcleod-stepping-down-to-lead-match-group-backed-ai-dating-startup)
- **[Confirmed, Jan 2024]** McLeod called AI a "big focus", aiming for "much more curated, targeted matches." — [Fortune, 2024](https://fortune.com/2024/01/18/hinge-ceo-justin-mcleod-interview-attractiveness-score-algorithm-rose-jail/)
- **[Press, 2025–2026]** Match Group says FaceCheck, AI-based identity and safety verification, is deployed across Tinder, Hinge and others. Q1 2026 remarks describe company-wide AI enablement as roughly cost-neutral in 2026. — [Motley Fool Q1 2026 transcript](https://www.fool.com/earnings/call-transcripts/2026/05/05/match-group-mtch-q1-2026-earnings-transcript/) (from search summary, not fetched in full)
- **[Press, 2026]** A search snippet reported that Hinge launched a badge signalling good dating behaviour in June 2026. Not verified against a primary source. — [mtch.com news listing](https://mtch.com/news/page/2/)
- **[Context]** Tinder (also Match Group) began AI-assisted matching in 2025, framed as a complement to swiping. — [TechCrunch, 2025-02-06](https://techcrunch.com/2025/02/06/tinder-will-try-ai-powered-matching-as-the-dating-app-continues-to-lose-users)

### Inferences
- The shift Hinge describes runs from "ML-inferred preferences + Gale–Shapley daily pick" (2018) to "deep model predicting mutual compatibility across the whole Discover feed" (2025). The lesson for a small app is to start with interpretable mutual scoring and add learned weights only once interaction data exists.
- AI features in 2025–26 have focused on profile quality and conversation quality rather than replacing the feed with AI-chosen matches. Fully AI-chosen matchmaking was moved to Overtone.

### Gaps
- **No Hinge engineering blog posts, patents or conference talks on the recommender were found.**
- No interviews with a "Tim MacGougan" or other named Hinge ML staff were found. Treat that name as unverified.
- No details on Overtone's matching method or launch status as of late 2026 were found.
- The full Match Group 2025 10-K and the Q1 2026 transcript were not read. They may hold further Hinge AI statements.

---

## Q6. Fairness and attention distribution: avoiding concentration on popular profiles

### Takeaway
Hinge has not published an explicit fairness or exposure policy. Its design choices still point at the problem:
- Reciprocal one-to-one assignment for Most Compatible.
- A taste profile that weights likes-back equally with likes.
- A deep model that predicts *mutual* compatibility.
- Scarcity limits: like caps, Roses, Your Turn Limits.

The clearest public evidence on why this matters comes from academic work. Ranking by one-sided appeal concentrates exposure, and the most-recommended users reply less.

### Cited Findings
- **[Confirmed]** Most Compatible pairs users reciprocally, so "the person you see is also seeing you". — [TechCrunch, 2018](https://techcrunch.com/?p=1668547)
- **[Confirmed]** The taste profile weights who you like and who likes you back equally, and Hinge denies having an attractiveness score. — [Fortune, 2024](https://fortune.com/2024/01/18/hinge-ceo-justin-mcleod-interview-attractiveness-score-algorithm-rose-jail/)
- **[Confirmed]** The 2025 recommender is aimed at "predicting mutual compatibility". — [Hinge newsroom](https://hinge.co/newsroom/hinge-2025-product-evolution)
- **[Confirmed]** Your Turn Limits explicitly targets the frustration of unanswered messages, a symptom of congestion at popular receivers: "we're directly addressing the frustration of unanswered messages" (McLeod). — [Hinge press, 2024-09-18](https://hinge.co/press/your-turn-limits)
- **[Counterpoint, Press]** Standouts deliberately shows profiles "getting the most attention" and sells access to them through Roses. Part of the product therefore monetises concentrated attention rather than reducing it. — [Fortune, 2024](https://fortune.com/2024/01/18/hinge-ceo-justin-mcleod-interview-attractiveness-score-algorithm-rose-jail/)
- **[Academic, 2026]** At CoupLink, the top 0.1% of receivers received 4.6% of recommendations, and their reply rate after a mutual like was about one-third of others'. Exposure caps (ECDA) raised the chance that a receiver gets a date in simulation. — [Sekiya et al., arXiv 2602.19689](https://arxiv.org/html/2602.19689v1)
- **[Academic]** Machine-learning recommenders create congestion (Chen, Hsieh & Lin). Policies that reduce congestion can hurt the side that benefits from it (Lehmann, Terrier & Lalive). — [UCR paper](https://webarchive.ucr.edu/economics.ucr.edu/wp-content/uploads/2019/10/Hseih-paper-for-4-3-19-seminar-title-2.pdf); [QMUL WP 964](https://www.qmul.ac.uk/sef/media/econ/research/workingpapers/wp964.pdf)

### Inferences
- **For Bink:** in a single-city pickleball pool, strong 4.5+ players with good availability will be sought by many lower-rated players and will become congested. Practical controls:
  1. Rank by *mutual* fit, which naturally down-ranks large skill gaps.
  2. Cap how often any one player appears in other people's "for you" lists per day or week (an exposure budget). Track this in a `daily_exposure` counter.
  3. Down-rank players who have many unanswered requests.
  4. Give new players a small exposure boost, so they show up before they have any match history.

  Because Bink is court-first, players who share a home court or a usual play time are high-value, low-congestion candidates.

### Gaps
- No Hinge statement on exposure caps, popularity damping or new-user boosts was found.
- No data on how concentrated attention is on Hinge itself.
