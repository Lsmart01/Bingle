# Visual design of the Tinder, Bumble and Hinge marketing sites (as of Nov 2026)

Method note: I fetched the live homepages (tinder.com, bumble.com/en/, hinge.co) on 2026-11-16, both as rendered text and as raw HTML/CSS (via curl), and pulled the font and colour tokens straight from their stylesheets. Raw-HTML fetches cannot show rendered motion, scroll effects or exact pixel layout, so those parts are inferred and marked as such. Creative Review, Fast Company and Creative Bloq returned 403 errors or truncated pages, so rebrand commentary comes from It's Nice That, Design Compass and press coverage instead.

## Hero section: layout, imagery, headline, CTA

### Takeaway
All three heroes use one short, confident line and one CTA, but each has a different focus. Tinder leads with a playful brand line ("It starts with a swipe.™"). Bumble leads with photo profile cards and a mission statement. Hinge leads with a full-width photo of a real couple and a philosophy line ("Go on your last first date."). None of them uses a hard-sell form. The CTA is always "get the app".

### Cited Findings
- **Tinder:** The headline is "It starts with a swipe.™" and the primary CTA is "Get the app", with "Create account" and "Log in" also present. The supporting line is "Someone on Tinder might give you butterflies." with a "Find out who ↓" scroll cue. A disclaimer says all photos are of models and for illustration only. — [tinder.com](https://tinder.com)
- **Tinder nav:** Product, Subscriptions, Safety, Support, Download, Gift Cards, Events, plus a language selector. — [tinder.com](https://tinder.com)
- **Bumble:** The hero has a "Get the Bumble app" heading over a rotating set of profile-style cards showing a name, an age and a candid photo. Examples: "Danna, 28", a woman with a dark ponytail and sunglasses by the sea; "Josh, 34", a bearded man holding a camera outdoors; "Tiana, 30", in a red rainbow-striped jacket with silver headphones. The headline is "We exist to bring people closer to love." and the subhead is "We want our members to find meaningful and authentic relationships that ignite confidence and joy." The CTA is "Download Bumble". The nav reads Date, BFF, Stories, Safety, Support, plus "Sign in". — [bumble.com](https://bumble.com/en/)
- **Hinge:** The hero is a full-width image ("Two people sitting by a fountain"). It has a small eyebrow label, "Our Approach", above the headline "Go on your last first date." The body copy refers to a Nobel-Prize-winning algorithm meant to get users on dates rather than keep them in the app. The CTA is a text link, "How we do it" (to /mission). Hinge's CSS bundles the VideoJS player, which suggests video is used on the site, possibly in the hero, though this is unconfirmed. — [hinge.co](https://hinge.co); CSS at hinge.co/_next/static/css/ (fetched 2026-11-16)
- Hinge's brand guidelines list taglines in the same register: "Date a person, not a phone.", "Go on your last first date.", "Download. Delete.", "Ghost apps, not people." — [Hinge brand guidelines (preview deployment)](https://hinge-preview.vercel.app/brand)

### Inferences
- Bumble's "profile card" hero is the pattern most directly reusable for Bink. A stack of player cards ("Maya, 3.5 DUPR, plays Tues am at Oak Bay") shows the product in action without needing an app screenshot.
- Hinge is the most restrained of the three: a single photo, a serif headline and a text-link CTA. It reads as editorial or premium.
- Tinder's copy is jokey and self-aware, with lines like "You've read enough. Go find out."

### Gaps
- I could not confirm whether the heroes use video or autoplaying motion, because the raw HTML does not show rendered behaviour.

## Colour usage

### Takeaway
Each brand owns one hue and uses it sparingly against near-black and off-white. Tinder uses a pink-to-orange gradient (#FD267A → #FF6036). Bumble uses honey yellow #FFC629 as the button colour with near-black text. Hinge is about 90% black and off-white, with muted "outdoor" accents. None uses pure #000 or #FFF for main text and backgrounds.

### Cited Findings
- **Tinder (from live CSS tokens):**
  - `--color--brand-gradient-start: #fd267a` and `--color--brand-gradient-end: #ff6036`.
  - `--color--brand-primary: #ff2358`.
  - `theme-color` meta is #fd267a.
  - New 2026 rebrand tokens: `--color--brand-rebrand-haze: #9db9e6` (soft blue) and `--color--brand-rebrand-petal: #f5b1eb` (soft pink).
  - There is a full blue scale (e.g. blue-50 #0083f8) and green scale (e.g. green-30 #38d27c).
  - Dark neutral gray-95 is #101113.
  - Gradient backgrounds are built from tokens such as `linear-gradient(to bottom right, purple-60…)` and `(to top right, gold-30…)`.
  - Source: tinder.com raw HTML, fetched 2026-11-16 ([tinder.com](https://tinder.com)).
- The 2026 rebrand (Porto Rocha) keeps the warm red, orange and pink, and adds blue and green to cover "a wider spectrum of the emotions" users feel. Earlier gradients had no usage rules; the new system assigns each one a purpose. — [It's Nice That, 14 Jul 2026](https://www.itsnicethat.com/features/porto-rocha-tinder-rebrand-graphic-design-spotlight-140726); [Design Compass](https://designcompass.org/en/2026/07/15/tinder-first-rebranded-in-nearly-a-decade/)
- Third-party sites disagree on Tinder's hex values (#FF7854, #FF7158, #FE3C72, #FD3A73). The live CSS values above should take precedence. — [oppadu design-system gallery](https://www.oppadu.com/tools/design-systems-site/brand/tinder.html); [colorfyi](https://colorfyi.com/tr/brands/tinder)
- **Bumble (from live CSS tokens):**
  - `--token-button-primary-background-color-on-light: #ffc629` with `--token-button-primary-text-color-on-light: #141414`, i.e. a yellow button with near-black text.
  - On a yellow ("brand") background the primary button turns white (#fff) with #141414 text, and the secondary button is #ffd95c.
  - Other common values are #ffdb5b (lighter yellow) and #fff7de (pale yellow selected state).
  - Text colours are #202020 (by far the most common, 900+ uses in the HTML) and #141414.
  - Page background is #FCFCFC.
  - There is a red accent, #cd2e0f, and greens #1a964a and #0a6947.
  - Source: bumble.com HTML and CSS, fetched 2026-11-16 ([bumble.com](https://bumble.com/en/)).
- Third-party sources agree that Bumble yellow is #FFC629 (approx. Pantone 123 C, which is not official). — [brandcolorcode.com](https://www.brandcolorcode.com/bumble); [logos-world](https://logos-world.net/bumble-logo/)
- The 2024 rebrand broadened the palette into several yellows. Design Compass called the range of shades "a bit confusing" because it is unclear which yellow is primary. — [Design Compass, May 2024](https://designcompass.org/en/2024/05/01/bumble-rebrand)
- **Hinge (from guidelines):**
  - Hinge Black is #1A1A1A and Hinge White is #FFFEFD. Both are "intentionally not pure… for an organic feel".
  - Accents: Midnight #3E1768, Aubergine #67295F, Lilac #75457D, Mauve #9F81A5, Mist #C7C7E5, Sand #CCAC9F, Pebble #EEE1DB, Stone #484848, Forest #025656, Kelp #097270, Coral #D45847 (Coral is reserved for warnings and alerts).
  - Black and white take up at least 90% of a space, and accents no more than 10%.
  - The palette "draws from the outdoors, where members spend time off the app."
  - Source: [Hinge brand guidelines (preview deployment; official hinge.co/brand returned 404)](https://hinge-preview.vercel.app/brand)
- The live hinge.co CSS confirms the guideline colours are in use: #fffefd, #67295f (Aubergine) and #484848 (Stone) appear. — hinge.co CSS, fetched 2026-11-16

### Inferences
- For a small brand, a one-hue system is the proven pattern: one saturated accent used on CTAs and highlights, near-black text (#141414–#202020) and an off-white background (#FCFCFC / #FFFEFD).
- Tinder's 2026 move to add soft blue (#9DB9E6) and pink (#F5B1EB) "haze/petal" tints shows big brands adding pastel secondaries to soften a loud primary.

### Gaps
- I did not find an official Bumble or Tinder brand guideline page. Tinder's values come from the live CSS tokens, which is strong evidence but not an official spec.

## Typography

### Takeaway
All three now pair an expressive headline face with a clean sans for body and UI. Hinge uses Tiempos Headline (serif) with Modern Era (sans). Tinder's 2026 rebrand adds a serif, "Society", with a sans, "Regola", and keeps Proxima Nova for body. Bumble uses its own BumbleSans in a regular and a condensed cut.

### Cited Findings
- **Tinder (live CSS):**
  - `--font-name--serif: "Society"`, `--font-name--sans: "Regola"`, `--font-name--proxima-nova: "ProximaNova"`, with a "Helvetica Neue"/Arial fallback.
  - Token names show the roles. The serif covers "serif-base-2-xl" and "serif-italic-2-xl/sm" (large serif and serif-italic headlines). The sans covers "sans-display-1/2/3 regular/strong". Proxima Nova covers body-1/2/3 and button-1/2.
  - Source: [tinder.com](https://tinder.com) raw HTML, 2026-11-16.
- The 2026 rebrand moved the wordmark from lowercase sans to ALL CAPS and introduced an "expressive serif". Porto Rocha senior designer Yedo Han said it gives "boldness and confidence, and a little bit of edge". Press coverage does not name the typeface; the CSS name is "Society". — [It's Nice That](https://www.itsnicethat.com/features/porto-rocha-tinder-rebrand-graphic-design-spotlight-140726); [DesignRush](https://news.designrush.com/tinder-gen-z-rebrand-porto-rocha)
- **Bumble:** The live site loads BumbleSans (weights 400/500/600/700, e.g. BumbleSans-Medium.woff2) and BumbleSansCondensed (e.g. BumbleSans-BoldCondensed.woff2). The 2024 rebrand created this new proprietary font and moved the wordmark from lowercase "bumble" to "Bumble", with a prominent round capital B. — bumble.com/bumble-brand-assets/fonts/BumbleSans/fonts-bumble.css; [Design Compass](https://designcompass.org/en/2024/05/01/bumble-rebrand)
- **Hinge:** The guidelines specify:
  - Tiempos Headline Semibold for main headlines and subheads (tracking 0, leading 110%).
  - Modern Era Regular for body (tracking 10, leading 140%).
  - CTA labels in Modern Era Bold, ALL CAPS, tracking 150.
  - Labels in Modern Era Bold caps, tracking 100.
  - Text left-aligned, CTAs centred.
  - Source: [Hinge brand guidelines](https://hinge-preview.vercel.app/brand)
- The live hinge.co CSS confirms "Tiempos Headline, serif" (29 declarations), "Modern Era, sans-serif" (29+) and "Tiempos Text Narrow". — hinge.co CSS, 2026-11-16
- The Hinge wordmark is custom; the H–i ligature references "Hi". — [Hinge brand guidelines](https://hinge-preview.vercel.app/brand); [Made Good Designs](https://madegooddesigns.com/hinge-brand-guidelines/)

### Inferences
- An editorial serif paired with a friendly sans is now the shared category look (Hinge since about 2019, Tinder from 2026). Free near-equivalents for Bink: Fraunces, Instrument Serif or Newsreader for the serif, and Inter, Manrope or DM Sans for the sans. Bumble's single rounded proprietary sans is the alternative "friendly, sporty" route.
- Spaced-out all-caps CTA labels (Hinge, tracking 150) are a cheap way to make a button look premium.

### Gaps
- I did not confirm the foundry or designer for Tinder's "Society" and "Regola" (Regola may be Fontwerk's Regola Pro; unverified). No pixel font sizes were extracted.

## Section structure below the hero

### Takeaway
The sections follow a common order: features or modes, then safety, then a testimonial or success story, then the app download (QR code plus button), then a large multi-column footer. Hinge stands out by using its homepage for mission, research ("love scientists"), testimonials and press instead of features.

### Cited Findings
- **Tinder order:**
  1. "A lot has changed since your last swipe.", with three feature cards (Double Date, Astrology Mode, Music Mode), each with "Learn more →".
  2. A pull quote: "The best things that ever happened to you started with 'let's just see.'"
  3. Feature deep-dives.
  4. "Your safety comes first.", a four-card grid (Verification, Respect, Control, Support).
  5. "Ok but.. why Tinder?"
  6. An FAQ teaser: "Any questions? Everyone has *at least* one."
  7. A closing band: "You've read enough. Go find out." with a "Download Tinder" CTA.
  8. A scrolling marquee strip repeating "Download the app!" / "RSVP on Tinder!".
  9. A QR code ("Scan QR Code to download").
  10. A footer with social links and legal links, and "available in 190 countries".
  - App stores appear as text links, not badges. — [tinder.com](https://tinder.com)
- **Bumble order:**
  1. Lifestyle image cards ("Outdoors", "Running", "Dog parent").
  2. "Member Circle" community sign-up with a circular badge stamp.
  3. Product cards for Bumble Date ("Find your person") and BFF ("Find your people").
  4. A couple testimonial (Leslie & Thomas, married 2025) with "Read more stories".
  5. "Get the app": "Just scan the QR code to get started", a "Download now" button and an image of three phone screens.
  6. A footer with columns (Our apps / Company / Legal) and seven social icons.
  - There are no official store badges; all download links go to one OneLink URL. — [bumble.com](https://bumble.com/en/)
- **Hinge order:**
  1. "Hinge Labs: We're love scientists." with a photo of a couple laughing.
  2. "What Our Users Say": three quote blocks (Jake C., Kathryn B. & Nik N., Diana V.).
  3. Careers ("Let's work together", making dating "effective rather than addictive").
  4. Press ("Hinge in the headlines.").
  5. A footer with nav, index, resources (Safe Dating Tips, FAQ, Trust & Safety) and legal columns.
  - There are no stats or feature sections on the homepage. — [hinge.co](https://hinge.co)

### Inferences
- A QR code plus one "Download" button has replaced store badges on two of the three sites. For a beta, Bink can swap this for an email or waitlist field in the same closing-band slot.
- Tinder's closing band ("You've read enough. Go find out.") and Bumble's lifestyle "interest" cards map well to Bink: skill-level or "play style" cards, plus a closing "See you on the court" sign-up band.
- Every site gives safety its own section, which is relevant for meeting strangers to play.

### Gaps
- No site shows hard stats (e.g. user counts) on the homepage, apart from Tinder's "190 countries" in the footer.

## Motion and interaction

### Takeaway
Rendered motion could not be observed directly. The evidence shows Tinder uses marquee strips, "swipe-to-reveal" motion, glossy 3D icons and animated gradients; Bumble uses rotating profile cards; and Hinge deliberately avoids game-like animation.

### Cited Findings
- Tinder's 2026 system reinterprets the swipe as revealing what lies beneath (type, logo or imagery). Described animations include the wordmark morphing into the flame, a collage transitioning to pink with "Anyone can happen", a rotating 3D silver flame pendant, and translucent glossy "juicier" icons (red tulip, pink ring, blue moon, heart lollipop). — [It's Nice That](https://www.itsnicethat.com/features/porto-rocha-tinder-rebrand-graphic-design-spotlight-140726)
- The tinder.com homepage has a repeating scrolling strip ("Download the app!" / "RSVP on Tinder!"). — [tinder.com](https://tinder.com)
- The Bumble hero is a rotating carousel of profile cards. — [bumble.com](https://bumble.com/en/)
- Hinge's 2019 redesign avoided "game-like animations" used by rivals, and notifications "appear subtly". This refers to the app, but it is the brand's stated stance. — [It's Nice That, Apr 2019 (older)](https://www.itsnicethat.com/news/hinge-rebrand-less-addictive-graphic-design-100419)
- Bumble's CSS uses rounded corners heavily: 16px radius is the most common, plus pill shapes (1000px) and 50% circles. — bumble.com CSS, 2026-11-16

### Inferences
- Cheap motion for Bink: a CSS marquee strip, a gently auto-rotating stack of player cards, and hover lifts on cards.

### Gaps
- Hover states, scroll-triggered animation and parallax could not be verified without a rendering browser.

## Photography and illustration style

### Takeaway
All three favour candid, natural-light lifestyle photography of diverse, specific-looking people doing things, not posed stock. Tinder (2026) adds collage, memes, paintings and object metaphors. Hinge adds hand-drawn, mostly black-and-white illustration.

### Cited Findings
- Tinder 2026 art direction runs three image types at once:
  1. Real daters, chosen to feel "natural rather than stocky or over-flashed".
  2. Metaphoric imagery, e.g. two toothbrushes colliding.
  3. Found and mixed media, e.g. anime screenshots, painting close-ups, flowers.
  - The designer's test for each image was whether she would see herself on the app. — [It's Nice That](https://www.itsnicethat.com/features/porto-rocha-tinder-rebrand-graphic-design-spotlight-140726); [Design Compass](https://designcompass.org/en/2026/07/15/tinder-first-rebranded-in-nearly-a-decade/)
- Bumble's homepage photos show people mid-activity, with a personality-revealing detail (skateboard, camera, dog, headphones, running in a park). — [bumble.com](https://bumble.com/en/)
- Hinge's photography guidance is "honest and authentic", showing couples enjoying each other's company and individuals "in genuine moments that reveal personality". — [Hinge brand guidelines](https://hinge-preview.vercel.app/brand)
- Hinge's illustration is "human, distinctive, imperfect", made from handmade textures and brushes, with rubber-hose limbs on a shared rig. Each illustration is about 80% black and white and 20% evenly distributed colour, and depicts specific individuals "never generalize or stereotype". — [Hinge brand guidelines](https://hinge-preview.vercel.app/brand); [It's Nice That 2019](https://www.itsnicethat.com/news/hinge-rebrand-less-addictive-graphic-design-100419)
- Bumble's 2024 rebrand introduced a new custom illustration style, but no detail is available. — [Design Compass](https://designcompass.org/en/2024/05/01/bumble-rebrand)

### Inferences
- For Bink, real local players mid-rally or laughing at the net, shot in daylight on Victoria courts, will beat stock imagery. A Hinge-style 80/20 line illustration is a cheap fallback before a photoshoot.

### Gaps
- No source specifies colour-grading recipes.

## What critics and designers have said about the rebrands

### Takeaway
Tinder's July 2026 Porto Rocha rebrand is the most discussed. It is praised for a coherent strategy (the "T" columnist voice, embracing "contradiction") and questioned on execution. Bumble's 2024 in-house rebrand drew mild criticism for a muddled yellow palette. Hinge's identity (about 2019, Red Antler-associated) is widely treated as the category's tasteful benchmark.

### Cited Findings
- **Tinder** (rebrand announced about 14–15 July 2026, Porto Rocha):
  - The identity centres on the fictional columnist "T", inspired by the 1990s *Dear Karen* column and Carrie Bradshaw.
  - The strategy plays on "contradiction": Gen Z is "burnt out on dating but holding out hope".
  - Clichés are flipped ("happily ever after" becomes "Happily TBD").
  - Strategy and copy director Natalee Ranii-Dropcho: "Designing for everyone doesn't mean you can't have an opinion."
  - Sources: [It's Nice That](https://www.itsnicethat.com/features/porto-rocha-tinder-rebrand-graphic-design-spotlight-140726); [YPulse](https://www.ypulse.com/newsfeed/2026/07/16/tinder-got-its-first-rebrand-in-nearly-a-decade/)
- Elmwood's Jade Horton (in Creative Bloq) called the Tinder rebrand "brave, fresh, and a statement of intent", but said it "lacks the finished thought". This is reported via a search summary; the article itself could not be fetched. — [Creative Bloq](https://www.creativebloq.com/design/branding/is-the-tinder-rebrand-a-total-success-not-everyone-is-so-sure)
- The previous Tinder identity (2017) introduced the gradient flame, which Dezeen compared to Instagram's 2016 redesign. **This is a past version.** — [Dezeen](https://www.dezeen.com/?p=1120398)
- **Bumble** (30 Apr 2024, in-house Creative Studio): a new logo (honeycomb symbol without its hex frame, capitalised wordmark), bolder type, refreshed colour and custom illustration, launched alongside the "Opening Moves" feature. — [Business Wire](https://www.businesswire.com/news/home/20240430323928/en/Bumble-Gives-Women-More-Choice-to-Make-the-First-Move); [Design Compass](https://designcompass.org/en/2024/05/01/bumble-rebrand)
  - The accompanying campaign drew a public backlash over celibacy-themed billboards ("A vow of celibacy is not the answer"), which Bumble apologised for. This is from my background knowledge and was not re-verified in this session.
- **Hinge:** The 2019 refresh made the app "less addictive", with bolder fonts, a brightened palette and illustration. CMO Nathan Roth: "Everything we do at Hinge is focused on one thing: getting our members off the app and out on great dates." **This is from 2019; the identity remains in use in 2026, as confirmed by the live CSS fonts.** — [It's Nice That](https://www.itsnicethat.com/news/hinge-rebrand-less-addictive-graphic-design-100419)
- Red Antler lists Hinge brand identity, art direction and UX among its work. — [Red Antler](https://www.redantler.com/work/hinge)
- I found no Brand New (UnderConsideration) or Awwwards coverage of any of the three sites in searches.

### Inferences
- Critics reward one clear voice and point of view. The friendly, witty, "real talk" tone (Hinge "speak like a friend… light wit and gentle bluntness"; Tinder's columnist) is the shared direction.

### Gaps
- Full Creative Review, Fast Company (Bumble) and Creative Bloq articles were blocked (403 errors or truncated pages).

## Concrete takeaways for Bink (small startup)

### Takeaway
Copy the system, not the spend: one owned accent colour, near-black and off-white neutrals, a serif-plus-sans pairing, candid local photography, a card-stack hero, a safety section, and a witty closing CTA band.

### Cited Findings
These recommendations are drawn from the findings above.
- **Colour:** One saturated accent on CTAs only, with near-black text on dark buttons (Bumble: #FFC629 button with #141414 text). Off-white page background (#FCFCFC / #FFFEFD). Keep accents to about 10% of the page (Hinge's 90/10 rule). — [bumble.com CSS](https://bumble.com/en/); [Hinge guidelines](https://hinge-preview.vercel.app/brand)
- **Gradient (optional):** A two-stop brand gradient in the style of Tinder's #FD267A → #FF6036, used only on a hero accent or the CTA. — [tinder.com CSS](https://tinder.com)
- **Typography:** A semibold serif headline at about 110% leading, a sans body at about 140% leading, and all-caps tracked CTA labels. — [Hinge guidelines](https://hinge-preview.vercel.app/brand)
- **Hero:** A Bumble-style rotating profile-card stack (name, age or level, candid photo), a one-line headline and a single CTA. — [bumble.com](https://bumble.com/en/)
- **Copy tone:** Short, warm and self-aware ("It starts with a swipe.", "You've read enough. Go find out.", "Go on your last first date."). — [tinder.com](https://tinder.com); [hinge.co](https://hinge.co)
- **Below the hero:** Three feature cards, then a safety grid, then a testimonial quote, then an FAQ teaser, then a closing CTA band with a marquee strip. Use a QR code or button instead of store badges, or a waitlist form for the beta. — [tinder.com](https://tinder.com); [bumble.com](https://bumble.com/en/)
- **Shape:** 16px card radius and pill buttons (Bumble). — bumble.com CSS

### Inferences
- Pickleball-specific suggestion: a single court-colour accent (e.g. a ball yellow-green or a court teal) used on CTAs, with Hinge-style restraint. This keeps Bink distinct from Bumble's honey yellow and Tinder's pink.

### Gaps
- No usability or conversion data was found for any of these page layouts.
