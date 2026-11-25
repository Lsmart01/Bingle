# How Facebook Marketplace matches buyers with local listings, and what Bink can borrow

Research date: 2026-11-24. Sources run from 2018 to Sep 2026, and each one is dated inline. "Confirmed" means Meta stated it in a primary source (a Meta paper, engineering blog, newsroom post or Transparency Center page). Anything else is marked as inference or third-party.

Scope note: Meta has published very little about Marketplace's *feed* ranking internals after 2018, beyond the Transparency Center system card. Most deep technical detail is about Marketplace *search* retrieval (Que2Search, Que2Engage, Aug2Search) or about Facebook Search in general (the EBR paper, KDD 2020). The general multi-stage pattern is best documented for Instagram Explore (2023). I found no Marketplace-specific KDD or RecSys paper on feed ranking.

---

## 1. What has Meta published about Marketplace's recommendation and search systems?

### Takeaway
Meta has published four main things about Marketplace. The first is a 2018 architecture post on multimodal product understanding, a buyer-product two-tower model, FAISS retrieval and a sparse NN final ranker with online training. The second is a series of search embedding-based retrieval (EBR) papers: Que2Search, then Que2Engage (WWW 2023), then Aug2Search (2025, using LLM-generated synthetic data). The third is an image-understanding line: MSURU (KDD 2019), then GrokNet. The fourth is a Transparency Center "system card" for the Marketplace feed, last updated 30 Sep 2026, which lists its prediction models and signals. The 2025-2026 product updates are about Meta AI seller tools and social features, not disclosed ranking changes.

### Cited Findings
**2018 architecture (Engineering at Meta, 2 Oct 2018; older and probably superseded in its details)**
- Each listing's index has text and image layers. DeepText handles text, and Lumos handles images with a "50-layer ResNet encoder pretrained on the image classification task". The image encoder output and the text embedding are "concatenated and sent into a multilayer perceptron" to form the product model. — [Engineering at Meta, 2018](https://engineering.fb.com/2018/10/02/ml-applications/under-the-hood-facebook-marketplace-powered-by-artificial-intelligence/)
- A buyer model is built from embeddings of profile demographics and Marketplace search keywords. "The system computes the cosine similarity between the two models as a ranking score." FAISS does the similarity search "to reduce computing load and speed up retrieval". — [Engineering at Meta, 2018](https://engineering.fb.com/2018/10/02/ml-applications/under-the-hood-facebook-marketplace-powered-by-artificial-intelligence/)
- "We perform a final ranking using a Sparse Neural Network model with online training." It uses real-time signals such as counters of real-time events on each product. It is "computationally heavier, so we do not use it as the model at the retrieval stage." — [Engineering at Meta, 2018](https://engineering.fb.com/2018/10/02/ml-applications/under-the-hood-facebook-marketplace-powered-by-artificial-intelligence/)
- The same models proactively detect and remove policy-violating listings from their text, photos and logos. Category autosuggest classifies listings into 29 top categories at post time, because 7 to 9% of sellers abandoned listing creation before it existed. Meta reported a "nearly 100 percent increase in consumer engagement with the listings" after the product-indexing rollout. Training used 4 million products. — [Engineering at Meta, 2018](https://engineering.fb.com/2018/10/02/ml-applications/under-the-hood-facebook-marketplace-powered-by-artificial-intelligence/)
- When an item is no longer available, visual similarity search recommends alternatives (the 2018 example is similar lamps). — [Engineering at Meta, 2018](https://engineering.fb.com/2018/10/02/ml-applications/under-the-hood-facebook-marketplace-powered-by-artificial-intelligence/)

**Search EBR line (Que2Search, then Que2Engage, then Aug2Search)**
- Que2Engage (WWW '23 Companion, Feb 2023) is a two-tower model. The query tower encodes raw query text with a 2-layer XLM encoder and character trigrams with an EmbeddingBag. The document tower fuses text tokens, an image token (pre-computed GrokNet embeddings) and a "context token" through a 6-layer XLM-R multimodal transformer. — [Que2Engage, arXiv 2302.11052](https://arxiv.org/pdf/2302.11052)
- The paper treats contextual information as its own modality. "Contextual information such as price, category and creation time" goes through an MLP encoder, with numeric features as single neurons and categoricals one-hot encoded, followed by BatchNorm and an MLP. The introduction names "product price, production condition, seller rating" as important contextual signals. — [Que2Engage](https://arxiv.org/pdf/2302.11052)
- Key modelling finding: plain in-batch contrastive negatives "implicitly sample from the distribution of engaged products". A relevant listing with an unreasonable price therefore gives the model almost no negative signal. The fix is multitask training: a contrastive relevance loss plus a BCE loss on "<query, product> pairs displayed to the searchers but receive no searcher engagements as hard negatives", weighted 0.8 and 0.2. — [Que2Engage](https://arxiv.org/pdf/2302.11052)
- The training data was 150M displayed (query, product) pairs, 75M engaged and 75M not engaged. Offline evaluation had two tracks: a 26k human-rated relevance set and a 220k future-engagement set. Engagement ROC-AUC rose from 55.88 (Que2Search) to 76.90. — [Que2Engage](https://arxiv.org/pdf/2302.11052)
- Que2Engage is deployed "as a parallel retrieval source to the traditional lexical-based search retrieval". In two weeks of A/B testing it raised searcher engagement by 4.5% with NDCG neutral, and it powers "millions of search queries per day". — [Que2Engage](https://arxiv.org/pdf/2302.11052)
- Modality dropout (randomly masking the context, image or text encoder outputs) improved robustness to missing fields. Fine-tuning the image encoder end to end helped slightly but was *not* shipped "for simplicity". — [Que2Engage](https://arxiv.org/pdf/2302.11052)
- Aug2Search (arXiv, May 2025) trains Marketplace EBR on a mix of original and LLM-generated synthetic query-listing data. It reportedly used eight Llama models and about 100M data points from Marketplace logs. I only saw these figures in search-result and abstract summaries, not the full text. — [Aug2Search, arXiv 2505.16065](https://arxiv.org/abs/2505.16065v3); [review summary](https://www.themoonlight.io/review/aug2search-enhancing-facebook-marketplace-search-with-llm-generated-synthetic-data-augmentation)
- A Meta Careers blog post (11 Nov 2025) says the Facebook Search team is exploring how to integrate LLMs such as Llama into the search ranking stack, with models meant to generalise across search on Instagram, Marketplace and Threads. I saw this only in a search snippet. — [Meta Careers, Nov 2025](https://www.metacareers.com/blog/inside-search-ai-how-the-llms-are-transforming-the-search-at-meta/)

**Image understanding (MSURU, then GrokNet)**
- MSURU (KDD 2019) builds large-scale e-commerce image classifiers from search-log weak supervision (queries plus clicked listings as labels). It processes product images uploaded daily to Marketplace, beat Facebook's then state of the art by 16%, and improved search success rate and interactions on Marketplace. — [Meta AI publication page](https://ai.meta.com/research/publications/msuru-large-scale-e-commerce-image-classification-with-weakly-supervised-search-data/)
- GrokNet succeeded MSURU as Meta's product-recognition backbone, and Marketplace search EBR used its embeddings as of 2023. — [Que2Engage](https://arxiv.org/pdf/2302.11052); [eProduct paper describing MSURU as predecessor](https://arxiv.org/pdf/2107.05856)

**Transparency Center system card (feed; updated 30 Sep 2026)**
- The Marketplace AI system "predicts which listings, sellers and content you are most likely to be interested in". It runs four steps: gather inventory, then leverage signals, then make predictions, then rank by score. Boosted listings and ads in the feed are *not* ranked by this system. — [Meta Transparency Center](https://transparency.meta.com/features/explaining-ranking/fb-marketplace/); [search summary of same page](https://transparency.meta.com/features/explaining-ranking/fb-marketplace/)
- The system cards launched in June 2023 (22 cards, 14 of them for Facebook). Meta says they list only the top ~10 prediction models and that "models and signals change frequently". — [Meta AI blog, system cards](https://ai.meta.com/blog/how-ai-powers-experiences-facebook-instagram-system-cards/); [Meta newsroom, June 2023](https://about.fb.com/news/2023/06/how-ai-ranks-content-on-facebook-and-instagram/)

**2025-2026 product updates (newsroom; product features, not ranking disclosures)**
- 13 Nov 2025 "Glow Up": Collections shared with friends, a friend joining a buyer-seller chat, reactions and comments on listings, Meta AI "suggested questions", AI vehicle insights, and eBay and Poshmark inventory in the feed. On personalisation: liking an item means "Marketplace will learn what you're interested in". One in four young-adult Facebook DAUs in the US and Canada use Marketplace. — [Meta newsroom, Nov 2025](https://about.fb.com/news/2025/11/facebook-marketplace-gets-a-glow-up/)
- 12 Mar 2026: Meta AI drafts listings from photos, suggests prices "based on similar items listed in your area", auto-replies using description, availability, pickup location and price, and shows an AI summary at the top of seller profiles (Facebook tenure, friend count, item types, seller ratings). — [Meta newsroom, Mar 2026](https://about.fb.com/news/2026/03/facebook-marketplace-new-meta-ai-tools/)

### Inferences
- The 2018 buyer-to-product cosine design is the closest public analogue to a "player to player" two-tower match. The 2018 caveat matters: production has almost certainly moved on, likely to MTML rankers like Instagram's, but Meta has not published a newer Marketplace feed architecture.
- The Que2Engage lesson carries over directly. Retrieval trained only on "similar to what got engagement" ignores attributes that make a candidate relevant but unappealing (for Marketplace, price; for Bink, perhaps an incompatible play time or skill gap). Shown-but-ignored impressions are the needed hard negatives.

### Gaps
- No public paper or blog post (2019 to 2026) describes the current Marketplace *feed* ranking model architecture, candidate counts after the first ~1,000, or objective weights.
- I could not verify GrokNet's specifics (datasets and loss counts) from a fetched primary source, so they are omitted.
- I did not read the full Aug2Search paper. Its figures come from abstract and review summaries.
- I found no Marketplace-specific RecSys or KDD feed-ranking paper.

---

## 2. How is locality handled (radius filters, location buckets, delivery vs local pickup, distance vs relevance)?

### Takeaway
Meta confirms that location and "distance to the buyer" are ranking inputs, and that users can set a location and search radius different from their profile location. It does not publish how distance is weighted against relevance. Third-party reports show the radius behaves as a hard straight-line filter for local items, while shippable items are exempt from it. In general Facebook Search, location was handled both as boolean terms (city tokens) in the retrieval query and as features fed into the embedding towers.

### Cited Findings
- The system card lists "location" among the signals it weighs, and "distance to the buyer" plus "buyer's country" as inputs to the *save-listing* prediction model. Location therefore enters as a learned feature inside per-action models, not only as a filter. — [Meta Transparency Center, Sep 2026](https://transparency.meta.com/features/explaining-ranking/fb-marketplace/)
- User control: "Set the location or search radius (can differ from your profile location)". — [Meta Transparency Center](https://transparency.meta.com/features/explaining-ranking/fb-marketplace/)
- Facebook Search EBR (KDD 2020) added location features to both towers. On the query side these were "searcher city, region, country, and language", and on the document side public info such as "explicit group location tagged by the admin". This gave +2.20% recall in groups search, against +1.77% for social-embedding features. The text-plus-location model ranked same-city documents higher for a Louisville searcher. — [Embedding-based Retrieval in Facebook Search, arXiv 2006.11632](https://arxiv.org/pdf/2006.11632)
- That paper's retrieval engine (Unicorn) mixes hard boolean location terms with embedding matching. Example: `(and (or (term location:seattle) (term location:menlo_park)) (or (and (term text:john) (term text:smithe)) (nn model-141795009 :radius 0.24 :nprobe 16)))`. Location acts as a hard pre-filter and the NN operator adds fuzzy semantic matches inside it. Radius-mode NN (a cosine-distance threshold) was chosen over top-K because it allows a "constrained NN search" against the other boolean constraints. — [EBR in Facebook Search](https://arxiv.org/pdf/2006.11632)
- Third-party reports: the radius is a straight-line circle around the chosen location, with a smallest app option reported at 0.6 mi. When shipping is available, shipped items appear far outside the radius. Sorting by "Distance" only reorders results and does not filter them. There is no guaranteed pickup-only toggle. — [Alphr](https://www.alphr.com/facebook-hide-ships-to-you/); [MakeTechEasier](https://maketecheasier.com/view-facebook-marketplace-local-listings-only); [Technobezz](https://www.technobezz.com/how-to-show-local-listings-on-facebook-marketplace) *(third-party; UI details may be out of date)*
- Users complain that straight-line radius ignores geography, for example results "that would make me cross a body of water". — [AOL / user commentary](https://www.aol.com/facebook-marketplace-needs-stop-showing-094501206.html)
- Pricing suggestions use "similar items listed in your area", so locality also scopes seller tools, not only buyer ranking. — [Meta newsroom, Mar 2026](https://about.fb.com/news/2026/03/facebook-marketplace-new-meta-ai-tools/)
- Seller auto-replies include "pickup location", which confirms that local pickup is a first-class listing attribute alongside shipping. — [Meta newsroom, Mar 2026](https://about.fb.com/news/2026/03/facebook-marketplace-new-meta-ai-tools/)

### Inferences
- The observable pattern is a two-layer approach. First comes a hard eligibility gate (radius for pickup items, with shippable items bypassing it). Then distance is a soft feature that per-action models weigh against relevance (distance feeds the "save" model). Bink can copy this directly. The hard gate is "same city / within X km of my courts", and the soft feature is distance or travel time to the candidate's home courts.
- The "body of water" complaint applies to Victoria, a peninsula where cross-harbour or Colwood-to-Saanich trips are slower than straight-line distance suggests. Distance between *home courts* (or neighbourhood or area buckets), or precomputed travel time between court pairs, would serve better than raw point-to-point radius. With a few dozen courts, a court-to-court travel-time matrix is cheap to precompute.
- Meta's boolean `location:city` terms combined with embedding-NN are effectively a pattern Postgres can express: a `WHERE` clause on area or court IDs (or PostGIS `ST_DWithin`) followed by `ORDER BY` a similarity score, optionally with pgvector.

### Gaps
- Meta has not published how distance is weighted against relevance in the Marketplace feed or search, whether location buckets such as geohash or S2 cells are used, or how shippable and local inventory are blended.
- The radius UI options and default radius are documented only by third parties.
- A search-engine summary said a 2023 Meta paper on group-search failures attributed 18% of "junkiness" failures to location mismatch, second only to fuzzy text matches at 53%. I could not identify or fetch that paper, so this is unverified.

---

## 3. How does the multi-stage pipeline work (candidate generation, then light ranking, then heavy ranking, then re-ranking)?

### Takeaway
For Marketplace, Meta confirms only "gather inventory (recency + relevance, policy-filtered), about 1,000 listings, then per-action predictions plus integrity processes, then a single score sort". The 2018 version was two-tower/FAISS retrieval followed by a heavier online-trained sparse NN. Meta's best-documented general pipeline (Instagram Explore, 2023) has four stages: multiple retrieval sources returning hundreds each, a distilled first-stage ranker over thousands, an MTML second-stage ranker over the top ~100, and final re-ranking with integrity and diversity rules. A weighted-sum "value model" combines predicted action probabilities.

### Cited Findings
- Marketplace step 1: the system pulls listings from multiple sources, "including recency and relevance to your activity", excluding blocked categories and Commerce-Policy rejections, and "sends around 1,000 listings on to the next stage". — [Meta Transparency Center, Sep 2026](https://transparency.meta.com/features/explaining-ranking/fb-marketplace/)
- Marketplace step 4: each listing gets a score, and "Listings that the system predicts will provide more value for you are shown to you first." — [Meta Transparency Center](https://transparency.meta.com/features/explaining-ranking/fb-marketplace/)
- Marketplace 2018: two-tower cosine retrieval via FAISS, then a "Sparse Neural Network model with online training" for final ranking using real-time event counters. — [Engineering at Meta, 2018](https://engineering.fb.com/2018/10/02/ml-applications/under-the-hood-facebook-marketplace-powered-by-artificial-intelligence/)
- Marketplace search: Que2Engage EBR runs as a *parallel retrieval source* alongside lexical retrieval, and a separate ranking stage puts more weight on contextual signals to up-rank engaging products. Que2Engage's purpose was to make retrieval consistent with ranking, because downstream rankers may not rank EBR-retrieved items well. — [Que2Engage](https://arxiv.org/pdf/2302.11052)
- Facebook Search pushes embedding similarity down the funnel as a ranking feature ("Embedding as ranking feature … helps the ranker recognize new results from embedding-based retrieval"). Query embeddings are computed online and document embeddings in offline Spark batches. — [EBR in Facebook Search](https://arxiv.org/pdf/2006.11632)
- EBR training finding: hard negatives alone did *not* beat random negatives. Mixing easy and hard negatives worked best, with recall saturating at easy:hard = 100:1. Random-negative models optimise recall at large K, and non-click-impression models optimise precision at small K. — [EBR in Facebook Search](https://arxiv.org/pdf/2006.11632)
- Instagram Explore (Aug 2023): retrieval "sources" each "select hundreds of relevant items from a media pool of billions" and are mixed with tunable weights. A first-stage lightweight ranker "can recall thousands of candidates" and is trained to predict which items the second stage would put in its top K (distillation). The second-stage MTML model "operates on the 100 best candidates". A final stage applies business rules. — [Engineering at Meta, Instagram Explore, 2023](https://engineering.fb.com/2023/08/09/ml-applications/scaling-instagram-explore-recommendations-system/)
- Value model: "Expected Value = W_click * P(click) + W_like * P(like) – W_see_less * P(see less) + etc." — [Instagram Explore, 2023](https://engineering.fb.com/2023/08/09/ml-applications/scaling-instagram-explore-recommendations-system/)
- Two Tower limitation: "the model can't consume user-item interaction features". Item embeddings are computed offline and the user tower online, and both can be cached. — [Instagram Explore, 2023](https://engineering.fb.com/2023/08/09/ml-applications/scaling-instagram-explore-recommendations-system/)
- Final-stage rules include integrity downranking or filtering and diversity, for example "Do not show items from the same authors in a sequence." Models are fine-tuned hourly. — [Instagram Explore, 2023](https://engineering.fb.com/2023/08/09/ml-applications/scaling-instagram-explore-recommendations-system/)
- People You May Know (Facebook card, updated 13 Dec 2024) follows the same template. Inventory comes from "friends of your existing friends" or "people in groups you're a member of". Profiles are then ranked by predicted interaction, and finally integrity filters remove Community-Standards violators. — [Meta Transparency Center, PYMK](https://transparency.meta.com/features/explaining-ranking/fb-people-you-may-know/)
- A patent on multi-stage filtering for recommended connections notes that friends-of-friends pools reach up to about 90,000 candidates for a 300-friend user, which is why staged filtering is needed. I could not confirm the assignee from the results. — [US10313456B2](https://patents.google.com/patent/US10313456)

### Inferences
- The multi-stage funnel exists because the candidate pools are millions or billions of items. With fewer than ~5,000 players in one city, Bink can score *every* eligible player in a single SQL query, so stages 1 to 3 collapse into "filter, then score". What survives is the *logical* separation: (a) eligibility and hard filters (blocked users, safety flags, city, visibility settings), (b) a scoring function, and (c) a final re-rank pass for diversity, freshness and new-user exposure.
- The PYMK inventory sources (friends-of-friends, shared groups) map neatly onto a court-first model. "Players who share a home court with me" and "players who share a court with someone I've played with" are the natural candidate sources, and shared-court count is the analogue of mutual-friend ratio.
- The value-model weighted sum is the right shape for Bink's hand-tuned "for you" score, with hand-set weights instead of learned probabilities. One example is a weighted sum of skill proximity, schedule overlap, shared courts, style match and distance, minus penalties for prior dismissals.

### Gaps
- Meta does not publish candidate counts for Marketplace after the first stage, or confirm whether Marketplace uses a distinct first-stage/second-stage split today.
- The Instagram Explore numbers describe Explore, not Marketplace. Applying them to Marketplace is an inference.

---

## 4. Which signals are used (engagement, messaging a seller, seller responsiveness and ratings, freshness, social graph)?

### Takeaway
The Marketplace system card confirms eight per-action prediction models: hide, click into seller profile, share, start a conversation with the seller, swipe photos, communicate multiple times, click the listing, and save. Their inputs are mostly engagement history with time windows (7 and 60 days), keyword and category matches, price, distance, device or access method, and a click-through-rate upper confidence bound. "Communicating multiple times" (a back-and-forth conversation) is a modelled outcome in its own right. Freshness enters through inventory sourcing ("recency"). Seller rating is named as a contextual signal in search. Social-graph signals are prominent in Facebook Search EBR and PYMK, but Meta does not list them as Marketplace feed signals.

### Cited Findings
- Prediction models and example inputs from the system card (updated 30 Sep 2026). — [Meta Transparency Center](https://transparency.meta.com/features/explaining-ranking/fb-marketplace/)
  - *Hide listing:* past hide clicks on listings, categories or channels, and product category.
  - *Click into seller profile:* saves in a channel, time since last save, and access method (iOS, Android, iPad, tablet, Instagram).
  - *Attempt to share:* keywords of saved or shared listings, time spent viewing, and past share attempts.
  - *Start a conversation with seller:* commerce tag IDs clicked in the last 7 days, long-clicks and photo-carousel impressions in a leaf category over 60 days, keyword matches, and image-hash IDs clicked in the last 7 days.
  - *Swipe or click photos:* access method, buyer clicks (overall and on photos), and photo opens relative to clicks.
  - *Communicate multiple times:* seller messages and buyer messages.
  - *Click listing:* product-page scroll count, "click-through rate upper confidence bound", engaged keyword IDs over 60 days, keyword matches, and price.
  - *Save listing:* product-page scroll count, distance to buyer, time spent viewing, price, and buyer's country.
- The system weighs Facebook-activity signals "such as location, category, condition, or price". — [Meta Transparency Center](https://transparency.meta.com/features/explaining-ranking/fb-marketplace/)
- Freshness: inventory sources include "recency". In 2018, the final ranker used "counters of real-time events on each product". In search, "creation time" is a contextual feature. — [Transparency Center](https://transparency.meta.com/features/explaining-ranking/fb-marketplace/); [Engineering at Meta, 2018](https://engineering.fb.com/2018/10/02/ml-applications/under-the-hood-facebook-marketplace-powered-by-artificial-intelligence/); [Que2Engage](https://arxiv.org/pdf/2302.11052)
- Seller rating, price and condition are named as contextual signals important for engagement in Marketplace search. — [Que2Engage](https://arxiv.org/pdf/2302.11052)
- Explicit negative feedback: hiding a listing reduces similar listings and is its own prediction target. Users can also browse non-personalised and declare interests. — [Meta Transparency Center](https://transparency.meta.com/features/explaining-ranking/fb-marketplace/)
- Explicit positive feedback (Nov 2025): liking items teaches Marketplace your interests. — [Meta newsroom, Nov 2025](https://about.fb.com/news/2025/11/facebook-marketplace-gets-a-glow-up/)
- Social graph in Facebook Search: "social embedding features" gave +1.77% recall in groups search, and the paper frames the searcher's "social graph" as an integral part of search context. — [EBR in Facebook Search](https://arxiv.org/pdf/2006.11632)
- Social graph in PYMK: the "ratio of number of mutual friends to total number of friends", whether the suggested person uploaded your contact, friend-request history and accept rates. — [Meta Transparency Center, PYMK, Dec 2024](https://transparency.meta.com/features/explaining-ranking/fb-people-you-may-know/)
- Social features on Marketplace (Nov 2025) are product surfaces (shared Collections, friend joins chat, reactions and comments), not documented ranking inputs. — [Meta newsroom, Nov 2025](https://about.fb.com/news/2025/11/facebook-marketplace-gets-a-glow-up/)

### Inferences
- Marketplace optimises for *conversations*, not clicks. "Start a conversation" and "communicate multiple times" are separate targets, and a multi-message exchange is a stronger success signal than a first message. For Bink, the analogous success ladder is profile view, then message or invite sent, then reply received, then game actually played (confirmed). The later rungs should carry more weight when tuning, and the eventual training labels should come from them.
- The "CTR upper confidence bound" feature is a bandit-style exploration signal. Items with few impressions get an optimistic estimate, so new items still get shown. This scales down well: a new player with few profile views can get an exploration boost, for example score + c * sqrt(log N / n_views).
- Time-windowed engagement counters (7-day and 60-day) are cheap to maintain in Postgres as materialised aggregates or rollup tables.

### Gaps
- Meta does not publish objective weights, seller-responsiveness inputs to *feed* ranking, or whether social-graph proximity (friends selling or friends of friends) boosts Marketplace listings.
- The system card does not list seller ratings or responsiveness as inputs to the feed models. Only the search paper mentions seller rating.

---

## 5. Trust and safety: seller ratings, fraud detection, and how reputation affects ranking

### Takeaway
Confirmed trust mechanisms are: policy filtering before ranking (rejected listings never enter inventory), "integrity processes" that reduce distribution of fraudulent or low-quality content during prediction, user hide and report controls, mutual buyer-seller ratings (since 2018, covering responsiveness, friendliness and reliability), and since March 2026 an AI-generated seller-profile summary showing tenure, friend count, item types and ratings. Meta states that integrity *demotes* (reduces distribution) rather than only removing. It does not say how much reputation weighs in ranking.

### Cited Findings
- Listings rejected under Commerce Policies and blocked categories are excluded at inventory gathering. During prediction, "integrity processes … help reduce the distribution of content that is fraudulent, low-quality" or policy-violating. The system also "hides content that—while not against Commerce Policies—you may not want to see". — [Meta Transparency Center, Sep 2026](https://transparency.meta.com/features/explaining-ranking/fb-marketplace/)
- Reporting a listing triggers review and possible removal. — [Meta Transparency Center](https://transparency.meta.com/features/explaining-ranking/fb-marketplace/)
- In 2018, the same multimodal models were used to "proactively detect and remove listings that violate our policies" from text, photos and logos. — [Engineering at Meta, 2018](https://engineering.fb.com/2018/10/02/ml-applications/under-the-hood-facebook-marketplace-powered-by-artificial-intelligence/)
- In Oct 2018, Meta introduced mutual buyer and seller ratings that include response time, friendliness and reliability. — [Meta newsroom, Oct 2018](https://about.fb.com/news/2018/10/marketplace-turns-two/)
- In Mar 2026, a Meta AI summary at the top of the seller profile shows Facebook tenure, friend count, item types sold and seller ratings, "helping to build trust and transparency with every transaction". — [Meta newsroom, Mar 2026](https://about.fb.com/news/2026/03/facebook-marketplace-new-meta-ai-tools/)
- Meta uses enforcement and review teams plus detection tools. Responses include disabling commerce accounts, removing listings and cancelling orders. — [Meta Scam Protection Center](https://www.meta.com/safety/scam-protection-center/marketplace-trust-safety/); [Meta Marketplace safety](https://www.meta.com/safety/scam-prevention/marketplace-safety/)
- Third-party sources say ratings are shown publicly only after about 5 ratings, and that badges such as "Very Responsive" and "Highly Rated" reflect prompt replies and good feedback. These are not official criteria, and the sources disagree on thresholds. — [Keeper Security, Nov 2024](https://www.keepersecurity.com/blog/2024/11/26/is-facebook-marketplace-safe/); [OneShop](https://oneshop.com/blog/facebook-marketplace-badges); [Lilach Bullock](https://www.lilachbullock.com/?p=145722) *(third-party)*
- PYMK applies integrity filters as a final stage that removes profiles that "may go against our Community Standards". — [Meta Transparency Center, PYMK](https://transparency.meta.com/features/explaining-ranking/fb-people-you-may-know/)
- Instagram Explore's final stage filters or downranks "based on integrity-related scores". — [Instagram Explore, 2023](https://engineering.fb.com/2023/08/09/ml-applications/scaling-instagram-explore-recommendations-system/)

### Inferences
- Meta's trust pattern has three layers: hard exclusion before ranking, soft demotion during or after ranking, and visible reputation signals in the UI (badges, AI summaries, tenure, friend count). Bink can use all three cheaply. The first is RLS and SQL `WHERE` exclusions (blocked, reported-pending-review, suspended, hidden). The second is a score penalty for low reply rate, no-shows or new unverified accounts. The third is UI badges such as "Replies quickly", "Verified DUPR", "Plays at 3 of your courts" and "Member since".
- The minimum-count-before-display pattern (about 5 ratings) prevents a single bad review from defining a new user. It is worth copying for any player feedback, such as "played with" confirmations or sportsmanship ratings.
- For people discovery, the trust risks differ from commerce (harassment and safety rather than payment fraud). PYMK's "limit who can find me" control is the closer analogue to Bink's privacy needs than Marketplace's fraud tooling.

### Gaps
- Meta does not disclose whether seller ratings or responsiveness boost or demote listings in feed ranking, or which fraud-detection models run on Marketplace today (no 2024-2026 engineering paper found).
- I found no official current badge criteria.

---

## 6. Which patterns scale down to a single-city app (hundreds to thousands of users), and which need big-data scale?

### Takeaway
Most of Meta's *architecture* (two-tower EBR, FAISS or ANN, distilled first-stage rankers, MTML models, hourly retraining, LLM synthetic data) exists to handle billions of items and dense engagement logs. Bink has neither. What scales down is the *structure*: hard eligibility filters, then a transparent weighted value score over explicit features, then a final re-rank pass for diversity, freshness and new-user exposure. Add explicit negative feedback (hide), success events logged as future labels, and layered trust. Once enough labelled matches exist (low thousands of message, reply and played events), a simple learned model can replace hand-tuned weights.

### Cited Findings (scale facts that motivate the big-data patterns)
- Instagram Explore retrieval works from "a media pool of billions of items" and retrains models hourly. — [Instagram Explore, 2023](https://engineering.fb.com/2023/08/09/ml-applications/scaling-instagram-explore-recommendations-system/)
- Que2Engage was trained on 150M query-product pairs and serves "millions of search queries per day". — [Que2Engage](https://arxiv.org/pdf/2302.11052)
- 2018 Marketplace models needed 4M products and distributed training to cut training from more than a week to 1-2 days. — [Engineering at Meta, 2018](https://engineering.fb.com/2018/10/02/ml-applications/under-the-hood-facebook-marketplace-powered-by-artificial-intelligence/)
- EBR needed product quantisation (PQ or OPQ) and IVF tuning to fit the index, with recall traded against scanned documents. — [EBR in Facebook Search](https://arxiv.org/pdf/2006.11632)
- Friends-of-friends pools can reach about 90k candidates per user, which motivates multi-stage filtering. — [US10313456B2](https://patents.google.com/patent/US10313456)
- Even at Meta's scale, simpler options were preferred when gains were small: pre-computed image embeddings rather than end-to-end fine-tuning, "for simplicity". — [Que2Engage](https://arxiv.org/pdf/2302.11052)

### Inferences (Bink-specific mapping; these are design recommendations, not sourced facts)
**Scales down well and worth adopting now:**
1. **Hard filter, then score, then re-rank** in one Postgres function or view (for example a Supabase RPC `for_you(player_id)`). The filters are: same city, not blocked or hidden, visible profile, active in the last N days, and an optional skill window (for example ±0.75 of self-rated or DUPR). Use RLS for visibility and safety exclusions, which mirrors Meta excluding policy-rejected inventory *before* ranking.
2. **A value-model weighted sum** with hand-set weights, as in the Instagram formula. Example components:
   - skill proximity (prefer DUPR when verified, otherwise self-rating, with a wider tolerance for self-rated)
   - play-style match (fun, social or competitive compatibility matrix)
   - schedule overlap (Jaccard over usual-time slots)
   - court overlap (shared home courts, the analogue of PYMK's mutual-friend ratio)
   - court-to-court travel time (the analogue of Marketplace's "distance to buyer", but using courts rather than straight-line radius, given Victoria's geography)
   - recency of activity (the analogue of the "recency" inventory source)
   - penalties for previous hides or dismissals
3. **Explicit negative feedback** ("not for me" or hide) stored per viewer-candidate pair, used as a hard exclusion and optionally to down-weight similar profiles. This mirrors the Marketplace hide model and control.
4. **Exploration boost for new or low-exposure players** (the CTR-UCB analogue). This solves cold start for new sign-ups, which matters a lot in a small network where every new player is valuable.
5. **Final re-rank rules**: diversity (do not show five players from the same court in a row, and mix skill levels within the window), freshness (recently joined or recently active players near the top), and a cap on how often the same person is shown to the same viewer. This mirrors Instagram's "not the same author in sequence" rule.
6. **Log the success ladder** (impression, profile view, invite or message, reply, multi-message thread, confirmed game) from day one. Marketplace's separate "start conversation" and "communicate multiple times" targets show that the deeper events are the real objective. These logs become training labels later.
7. **Layered trust**: RLS exclusion, then score demotion (low reply rate, reported), then visible badges ("replies quickly", DUPR-verified, "member since", shared courts). Show ratings only after about 5 entries.
8. **Courts as the location primitive**: a boolean "plays at court X" condition plus a score, the equivalent of Meta's `location:city` term combined with an NN operator. Can be done with plain joins, and PostGIS only if needed.

**Optional at small scale (cheap, but only if useful):**
- **pgvector embeddings** of free-text bios or "looking for" text for a semantic-similarity feature. This is feasible on Supabase, but a few thousand rows need no ANN index, and an exact scan is fine. Structured features will carry most of the signal.
- **A logistic regression or GBDT** trained on logged "invite to reply" or "played" outcomes once there are a few thousand labelled pairs. It replaces hand weights, as Meta's value model replaces hand rules, and should include shown-but-ignored impressions as negatives (the Que2Engage lesson).

**Needs big-data scale; skip for Bink:**
- Two-tower deep models, FAISS or ANN with PQ/IVF tuning, distilled first-stage rankers, MTML multi-head networks, hourly online training, multimodal image understanding (GrokNet or MSURU style), LLM-generated synthetic training data (Aug2Search), and hard-negative mining at 100:1 ratios. All of these assume millions of items or labels and a candidate pool too large to score exhaustively.
- Distance-versus-relevance *learned* trade-offs, which need dense engagement data across many distances. Hand-tune the weights instead, perhaps per play style (competitive players may travel farther).

### Gaps
- I found no published Meta guidance on small-scale or cold-start-dominated deployments. The scale-down recommendations above are reasoned analogies, not sourced practice.
- I found no source quantifying how many labelled interactions are needed before a learned ranker beats hand-tuned weights in a small social-matching app. Run a test once data exists.
