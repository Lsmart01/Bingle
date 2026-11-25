# Design-led dating and meet-people marketing sites (excluding Tinder, Bumble, Hinge): what to borrow for Bink

Research date: 16 Nov 2026. Method: I fetched live homepages (WebFetch, plus raw HTML/CSS with curl to pull hex codes and font-family names), and read design press (It's Nice That, Fast Company, Creative Boom, Fonts In Use, agency pages).

Caveats:
- Hex codes and fonts come from the most frequent values in each site's HTML/CSS on 16 Nov 2026. They show what the site uses, not an official brand palette.
- Raya (raya.app returned HTTP 522 / empty), Lex (Cloudflare block) and Thursday/Pie (client-rendered SPAs with no readable content) could not be inspected live.

## 1. Which dating-app marketing sites are considered the best-looking, and by whom?

### Takeaway
No dating-app marketing site turned up as an Awwwards, CSSDA or FWA winner in my searches. The design credibility in this category comes from **brand identity work praised by the design press and design awards**. The strongest candidates are:
1. Feeld (Fast Company Innovation by Design 2024; It's Nice That)
2. Lex (&Walsh; It's Nice That, Creative Boom)
3. Cerca (Saint Urbain; It's Nice That, March 2026)
4. happn (Socialclub rebrand, 2023)
5. Timeleft (a people-meeting site with a polished current site)
6. Breeze
7. Boo
8. Coffee Meets Bagel (Framer site)

The League is the counter-example: it looks dated.

### Cited Findings
- An Awwwards search surfaced only a small showcase entry for the blind-date app "Incinq", described as using "retro wave" styling with "design without complex elements". I found no major dating brand among Awwwards winners — [Awwwards: Incinq](https://www.awwwards.com/sites/incinq-dating-application-case)
- The other "best dating app designs" roundups (DesignRush, colorlib, fireart) mostly cover in-app UI concepts, not marketing sites. They are SEO/agency content of low value — [DesignRush](https://www.designrush.com/best-designs/apps/trends/best-dating-app-designs)
- **Feeld** (rebrand Nov 2023):
  - Made Thought (gradients and identity) and Concept Bureau (research) did the work. Charlotte Rohde designed the custom typeface and wordmark, built on her New Edge 666. Molly Matalon shot the photography — [It's Nice That](https://www.itsnicethat.com/news/feeld-rebrand-graphic-design-141123)
  - The rebrand won a 2024 Fast Company Innovation by Design Award (graphic design) — [Fast Company](https://www.fastcompany.com/91128467/made-thought-innovation-by-design-2024); [search summary of fontsinuse/brand-identity coverage](https://the-brandidentity.com/project/turning-up-the-heat-feelds-rebrand-born-of-collaboration-is-charged-with-electricity-and-energy)
  - Fonts In Use lists the typefaces as "FEELD Edge Rounded" (a custom New Edge 666 Rounded) supported by ABC Diatype — [Fonts In Use](https://fontsinuse.com/uses/78852/feeld)
  - Instrument did the app and onboarding work, including a "gloops" motif — [Instrument](https://www.instrument.com/work/feeld-app)
- **Lex** (rebrand Jan 2023):
  - &Walsh (Jessica Walsh) did the messaging framework, identity, UX/UI toolkit **and website design & development**.
  - The rebrand moved Lex from dating to "a queer space for platonic relationships", with a "whimsical, fluid logo", "fresh 'spring' colors" chosen instead of rainbow tropes, and custom stickers for pronouns and interests — [&Walsh](https://andwalsh.com/work/all/lex/); [Abduzeedo](https://abduzeedo.com/node/87696); [Creative Boom](https://www.creativeboom.com/inspiration/its-a-queer-playground-jessica-walsh-on-the-new-brand-for-lqbtq-app-lex/); [It's Nice That](https://www.itsnicethat.com/news/and-walsh-lex-graphic-design-260123)
  - Users were split on the rebrand, and some lamented the lost "craigslist feeling" — [TechCrunch](https://techcrunch.com/2023/02/01/keep-lex-filthy-users-react-queer-dating-apps-redesign/amp/)
- **Cerca** (2 Mar 2026): It's Nice That profiled Saint Urbain's identity. It praised the "intentionally silly, loose and very human" characters, the nostalgic warmth of meeting people through friends, and motion that feels human rather than "tech-forward" — [It's Nice That](https://www.itsnicethat.com/articles/saint-urbain-cerca-animation-graphic-design-project-020326)
- **happn** (June 2023): Paris agency Socialclub launched a new identity built on a black-and-white base, with bright colours tied to places and activities, alongside the CrushPoints feature — [CB News](https://www.cbnews.fr/node/77210); [La Réclame / Socialclub](https://lareclame.fr/socialclub/realisations/find-your-crush-in-the-places-you-love)
- Other dating identities in 2025–26 design press: Koit (HolmanDesign) and Hily (O0 Design). These are agency/trade write-ups, not independent critique — [Creative Brands Mag](https://creativebrandsmag.com/holmandesign-repositions-koit-as-a-relationship-manager-for-intentional-connection/)

### Inferences
- "Best-looking" in this category is led by identity systems: custom type, art-directed community photography, and a distinctive colour logic. Web-award-style effects (WebGL, scroll-jacking) play little part. Bink should aim for a strong identity system rather than an Awwwards-style tech showpiece.
- The most praised recent work (Lex, Cerca) is explicitly **social, friendly and non-sexual**, which is close to Bink's positioning.

### Gaps
- I found no Awwwards, CSSDA or FWA Site of the Day for Raya, Feeld, Lex, Thursday, CMB, The League, happn, Boo or Breeze. A direct browse of Awwwards' "dating" tag was not possible within the tool budget.
- I found no Brand New (UnderConsideration) reviews of these apps.
- I found no agency credit for Timeleft's identity.

## 2. Site-by-site breakdown (hero, imagery, palette, type, copy, CTA, motion)

### Takeaway
The best sites share four traits:
- **One big, confident, human headline**
- **Real community photography or a quirky character system**
- **A warm, non-default palette**: cream or peach grounds with a deep "near-black" plum or navy, not pure black or white
- **A single repeated CTA**

### Cited Findings

**Feeld — feeld.co** (live 16 Nov 2026) — [feeld.co](https://feeld.co)
- **Hero:** A large headline broken over staggered lines in editorial style ("A dating app / for the … Explore your desires in a judgement-free place"). Below it sits a social-proof pill, "Join a community of 14M+", with overlapping avatar photos. The CTA is "Start exploring for free", with a video element and an iPhone mockup on the right.
- **Body:** Rows of pill-shaped "desire tag" chips that repeat across rows, suggesting marquee tickers. Also testimonial cards (photo, name, age, identity), feature blocks with thin line icons in distinct accent colours, event cards ("Let's meet in-person") and magazine cards.
- **CTAs:** Varied but warm: "Start your journey", "Explore together", "Sign me up".
- **Colours** (most frequent hex in the HTML): #181424 and #2b263a (deep plum-black, dominant), #fafafa, pastel accents #eecaff (lilac) and #c9cef8 (periwinkle), #394acb (blue), #ff8469 (coral).
- **Fonts:** Custom families in the CSS: feeld-edge, feeld-ivar-text (serif), feeld-typowriter, feeld-otto, feeld-light.
- **Tone:** "Playful, inclusive, reassuring", with short punchy headlines.
- **Brand gradients:** "Heat mapping and auras" — [It's Nice That](https://www.itsnicethat.com/news/feeld-rebrand-graphic-design-141123)

**Timeleft — timeleft.com** (strangers-to-friends dinners; live 16 Nov 2026) — [timeleft.com](https://www.timeleft.com)
- **Hero:** Centred and text-led. H1 "The weekly gatherings turning strangers into friends", with a small "eyes" icon. Sub-copy "No bios. No swiping. No planning. We'll match you with your group and handle the details." Primary button "Sign up now", then "or download our app" with store badges.
- **Body:** A 3-step "How it works" (Choose your activity / Book your spot / Show up and settle in), activity cards (Book a dinner / drinks / coffee), a mock "Personality Quiz — Step 1 of 3" card, and a stats band (4M+ members, 300,000+ dinners, 4,000+ bookings a day, 200+ cities, 52 countries). Testimonials sit under "Ready to show up?" and a likely logo marquee and FAQ accordion follow.
- **Colours:** #181f32 (deep navy, dominant), #f97709 (orange), #ffd8c8 (peach), #ded7ca and #f2efe9 (warm stone/cream).
- **Fonts:** FeatureDeck, including Extrabold Italic, for display, and FixelText for body. Large radii (32px, "radius-3xl").
- **Copy:** Anxiety-reducing ("Don't be nervous").
- **Older figures:** An older Timeleft page called it "The Friendship App"; it launched 1 May 2023 — [Timeleft About](https://timeleft.com/about/)

**Breeze — breeze.social** ("No chat, just real dates"; live 16 Nov 2026) — [breeze.social](https://www.breeze.social)
- **H1:** "Love is worth the leap", with copy about real connection happening in person. Sections: "How Breeze works…", a time-stamped storyline ("7PM: …"), "Serious about you and your time", "You got this".
- **Colours:** #ff5f3f (orange-red, logo), #29061b (deep plum), #fde4d6 and #fef0e9 (peach), #ccc9e6 (lavender).
- **Fonts:** Apris Black (heavy display) with DM Sans (body).
- **404 page:** Playful copy ("Hello? R U there? 404 👻"), a sign of voice consistency.

**happn — happn.com** (live 16 Nov 2026) — [happn.com](https://www.happn.com)
- **Colours:** Cream base rgb(251,248,241)/#fbf8f1 and #f1ede5, near-black #100f0a, grey #767470. Accents: #f66d43 (orange), #ef6685 (pink), #f6cc5b (yellow), #d7b7e3 (lilac), plus a vivid green rgb(49,238,51).
- **Fonts:** La Nord (Regular/Medium) for UI/body and **RB Spyk Display Black Italic** for display, plus Inter and Noto Sans Mono.
- **System:** Matches the 2023 identity: black-and-white with bright, place-coded colours — [CB News](https://www.cbnews.fr/node/77210)
- **Ownership:** happn was acquired by China's Hello Group in Sept 2025 — [Maddyness](https://www.maddyness.com/2025/09/19/lapp-francaise-de-dating-happn-est-desormais-chinoise/)

**Boo — boo.world** (personality-based; live 16 Nov 2026) — [boo.world](https://www.boo.world)
- **H1:** "Real connection starts with you." Sections: "Personality comes first", "Shared interests break the ice", "More than dating", "Meet someone on your wavelength", "There's more to you than a type."
- **Colours:** Teal #4edcd4, a warm gradient #ffe000 → #ffbd00 → #ff9c00, pinks #ff6689, #ff3a44, #c31162.
- **Fonts:** Roboto and Roboto Serif, plus Bebas Neue, Kaushan Script and "budokanRounded". Pill buttons (9999px radius, 30px/1.5rem cards).
- My judgement: the mix of four or more typefaces including a script font reads busier and less premium than Feeld or Timeleft.

**Coffee Meets Bagel — coffeemeetsbagel.com** (live 16 Nov 2026) — [coffeemeetsbagel.com](https://coffeemeetsbagel.com)
- **Build:** Framer.
- **H1:** "For serious daters", set word by word, which suggests an animated text reveal. Sections: "Why we're here" ("founded by three sisters…") and "How we do it" (claims 91% of users want a committed relationship).
- **Fonts:** Inter, Inter Display, Museo Sans Rounded 900 and Google Sans.
- **Colours:** Mostly white and #333 text, with blue rgb(73,92,233), rgb(0,153,255) and navy rgb(0,17,34).

**Cerca — cercadating.com** (2026) — [cercadating.com](https://www.cercadating.com); [It's Nice That](https://www.itsnicethat.com/articles/saint-urbain-cerca-animation-graphic-design-project-020326)
- **Hero:** H1 "Date Mutuals, Not strangers." over a rooftop photo, with a **3D mascot** ("Heart Boy", re-skinnable in chrome, clouds, fur, grass or galaxy textures) and a single "Download App" CTA.
- **Identity:** A 1960s–70s geometric wordmark with tight spacing, loose line illustrations of people surfing, cycling and embracing, and a 1980s "computer love" (Kraftwerk) mood.
- **Palette** (from article images): cream, burgundy, orange, red, black and pink-purple 3D.
- **Taglines:** "Fewer matches, better connections."

**Lex — lex.lgbt / thisislex.app** (2023 identity; site blocked to my fetch) — [&Walsh](https://andwalsh.com/work/all/lex/)
- &Walsh designed and built the website.
- **Identity:** A fluid hand-drawn logo, spring palette (no rainbow), a sticker system for pronouns and interests, and a "queer playground" positioning — [Creative Boom](https://www.creativeboom.com/inspiration/its-a-queer-playground-jessica-walsh-on-the-new-brand-for-lqbtq-app-lex/)

**The League — theleague.com** (live 16 Nov 2026; counter-example) — [theleague.com](https://www.theleague.com)
- **Build:** A WordPress site with FontAwesome icons.
- **Type:** News Gothic Std. Headings: "ARE YOU TOLD…", "So you want to Date", "Date. Intelligently", "ARE YOU IN?"
- **Colours:** Teal #1ddfd2 and #25dbc9 on #272727 and white.

**Thursday — thursday.com** (live title only) — [thursday.com](https://www.thursday.com/)
- The page title now reads "Events, Everyone Single. Every Week | Get Your Tickets Here", so Thursday has pivoted to ticketed singles events.
- The client-rendered page gave no design details.

### Inferences
- **Recurring dark neutral:** Feeld, Timeleft and Breeze all use a deep tinted near-black (plum #181424 / #29061b, navy #181f32) instead of #000. happn, Timeleft and Breeze use cream or peach grounds (#fbf8f1, #f2efe9, #fef0e9). This "warm cream + tinted ink + one hot accent (orange/coral)" formula is the clearest shared pattern.
- **Display type:** The best sites pair a characterful display face (Feeld Edge, FeatureDeck Extrabold Italic, Apris Black, RB Spyk Black Italic) with a plain sans for body text (Diatype, FixelText, DM Sans, La Nord).

### Gaps
- I could not inspect Raya's site (522 error), Lex (blocked), or the Thursday and Pie SPAs.
- Motion was inferred from markup (marquees, word-split headlines, video), not observed in a browser.
- I found no official brand-guideline hex values. All hexes are measured from the live HTML.

## 3. Recurring patterns in the best sites vs things that look dated or cheap

### Takeaway
**Strong:**
- A big human headline that says what you get in plain words ("No bios. No swiping. No planning.")
- Real community photos or one ownable character or motif
- Warm tinted neutrals
- One custom or characterful display font
- Social proof as numbers or avatars
- Repeated single CTA
- Playful microcopy even on 404 pages

**Dated:**
- Pure-black or teal-on-grey palettes
- Stock FontAwesome icons and WordPress templates
- Exclusivity copy ("ARE YOU IN?")
- Rainbow or heart clichés
- Typeface soup (several decorative and script fonts)

### Cited Findings
- Feeld dropped the rainbow motif for aura and heat-map gradients — [It's Nice That](https://www.itsnicethat.com/news/feeld-rebrand-graphic-design-141123). Lex also avoided "rainbow tropes" — [Abduzeedo](https://abduzeedo.com/node/87696)
- Feeld's site uses community testimonials (name, age, identity), a 14M+ avatar pill, and tag-chip marquees — [feeld.co](https://feeld.co)
- Timeleft's stats band and 3-step "How it works" — [timeleft.com](https://www.timeleft.com)
- Cerca praised for motion that is "human rather than overly polished or tech-forward" — [It's Nice That](https://www.itsnicethat.com/articles/saint-urbain-cerca-animation-graphic-design-project-020326)
- The League: WordPress, FontAwesome, News Gothic, teal #1ddfd2 on #272727, and "ARE YOU IN?" copy — [theleague.com](https://www.theleague.com)
- Boo uses Roboto, Roboto Serif, Bebas Neue, Kaushan Script and a rounded display face together — [boo.world](https://www.boo.world)

### Inferences
- Phone mockups are still common (Feeld, Timeleft). On the best sites they support photography or a character rather than serving as the hero by themselves.
- Pastel-gradient "aura" backgrounds (Feeld) are a 2023–25 trend that is now widespread. Using them would make Bink look like a dating app, not a sports and community app.

### Gaps
- I found no designer-authored critique ranking these sites against each other. The dated/strong calls in this section are my judgement, based on the cited evidence.

## 4. Patterns suited to a "friendly & social / community" feel (vs sexy or exclusive)

### Takeaway
For Bink, the closest models are **Timeleft** (structure, copy and warm palette), **Lex** (stickers, spring colours, platonic repositioning), **Cerca** (silly-human characters and a 3D mascot, "mutuals not strangers") and **Breeze** (in-person, "you got this" encouragement, playful voice). Feeld is a craft benchmark, but its tone is too sensual to copy.

### Cited Findings
- **Timeleft:**
  - Avoids dating language entirely and focuses on "turning strangers into friends". The steps are framed as actions (choose, book, show up).
  - Reassuring copy ("Don't be nervous") and activity cards for different formats.
  - Source: [timeleft.com](https://www.timeleft.com)
- **Lex:** Explicit pivot to "platonic relationships". Stickers "available on and offline" to show interests and pronouns. Spring colours "associated with growth, energy and well-being" — [Abduzeedo](https://abduzeedo.com/node/87696)
- **Cerca:** Characters "intentionally silly, loose and very human". The team deliberately avoided safety or morality messaging to keep things light. "Mutuals, not strangers" — [It's Nice That](https://www.itsnicethat.com/articles/saint-urbain-cerca-animation-graphic-design-project-020326)
- **Breeze:** "Love is worth the leap", "You got this", and a time-of-day storyline ("7PM: …") — [breeze.social](https://www.breeze.social)
- **Feeld:** Has an in-person events section ("Let's meet in-person") with venue, title and date cards — [feeld.co](https://feeld.co). This pattern transfers directly to Bink's "games near you".
- **Pie** (friendship app from the Bonobos co-founder) groups people into events with "a high density of the kinds of people you might click with" — [TechCrunch](https://techcrunch.com/2025/03/04/andy-dunns-new-app-pie-uses-ai-to-help-you-make-friends)

### Inferences (Bink-specific suggestions)
- **Palette:** Use Timeleft/Breeze-style warm cream (~#f2efe9 to #fef0e9), a tinted deep ink (navy or court-green-black rather than #000), and one energetic accent. A pickleball optic yellow or orange would play the role #f97709 / #ff5f3f plays for those brands.
- **Imagery:** Real Victoria players in candid group shots (Feeld/Matalon-style community photography), plus one ownable motif such as a ball or paddle character in the spirit of Cerca's Heart Boy, or Lex-style stickers for skill level ("3.0", "dinker", "early bird").
- **Copy:** A Timeleft-style triple negative plus a promise, e.g. "No group chats. No no-shows. Just games at your level." Follow it with a 3-step "How it works".
- **Social proof:** At beta stage, swap member counts for local proof: courts covered and players already on the list, shown with an avatar pill like Feeld's "Join a community of 14M+".
- **Things to avoid:** Pastel aura gradients, heart and spark motifs, and exclusivity language. These all signal dating.

### Gaps
- No pickleball or sports-social site was examined. That is outside this scope.

## 5. Waitlist and beta sign-up patterns

### Takeaway
Raya and The League used **application-plus-waitlist exclusivity**, with the waitlist itself acting as marketing. That fits "exclusive" brands and clashes with a friendly community app. The friendly-site pattern (Timeleft, Feeld, Cerca) is one low-friction primary CTA repeated through the page. For a Bink beta, combine the low friction with **local, communal scarcity** (city launch, founding players) rather than gatekeeping.

### Cited Findings
- **Raya:**
  - Applications are reviewed by a committee (reported as about 500 members voting; this is press-reported and unverified). Acceptance is often cited at about 8%.
  - The waitlist exceeded 1.5M in 2023 per Wikipedia. More recent reporting cites the WSJ at 2.5M, with users in the low six figures.
  - Sources: [WRAL](https://www.wral.com/amp/story/elites-meet-your-match/17665217/); [Global Dating Insights](https://www.globaldatinginsights.com/featured/raya-waitlist-hits-decline-trend-breaking-2-5-million-users/)
- A 2026 Startup Fortune piece argues Raya "never spent a single dollar on marketing" and that "the waiting list is the marketing" — [Startup Fortune](https://startupfortune.com/raya-built-a-25-million-person-waitlist-without-spending-a-dollar-on-marketing-and-that-is-the-business-lesson/). Development Today frames the waitlist as a status judgment users read into — [Development Today](https://developmentstoday.com/culture/raya-waitlist-digital-exclusivity-economics)
- **The League:** Had a waitlist of nearly 100,000 in 2015 (old figure). VIP passes were resold on Craigslist. Referrals speed up review — [Business Insider (2015)](https://www.businessinsider.in/Exclusive-dating-app-The-Leagues-has-a-waitlist-thats-nearly-100000-people-long-Now-people-are-selling-VIP-passes-to-it-on-Craigslist-for-100/articleshow/46449798.cms). The live site still closes with "ARE YOU IN?" — [theleague.com](https://www.theleague.com)
- **Timeleft:** One primary CTA ("Sign up now"), repeated lower down as "Find your group" and "Create your account", with app badges as a secondary option — [timeleft.com](https://www.timeleft.com)
- **Feeld:** The CTA varies in wording but keeps one action ("Start exploring for free", "Sign me up") — [feeld.co](https://feeld.co)
- **Cerca:** A single "Download App" CTA with no waitlist form — [cercadating.com](https://www.cercadating.com)
- **Pie:** Launched city by city (Chicago, then SF) — [TechCrunch 2024](https://techcrunch.com/2024/11/19/irl-social-app-pie-is-coming-to-sf-to-make-you-less-lonely)

### Inferences
- For a Victoria-first beta, a friendly sign-up pattern would:
  - Put the email field in the hero with one inviting verb ("Get on the court", not "Apply")
  - Ask one or two optional qualifiers on the next step (skill level, preferred courts or times), Timeleft quiz-card style, to make sign-up feel like matchmaking
  - Show a local progress counter ("142 Victoria players so far")
  - Use referral as "bring your doubles partner" rather than as a queue-jump
- City-by-city launches (Pie, Timeleft's city lists) make "Launching first in Victoria, BC" a natural framing.
- Avoid Raya/League-style review-committee or "ARE YOU IN?" gatekeeping copy, which contradicts "friendly & social".

### Gaps
- I could not observe live waitlist form UX for Raya (site down) or the original 2014–15 League landing page. The descriptions above rest on press reports.
- I found no conversion data comparing waitlist designs in this category.
