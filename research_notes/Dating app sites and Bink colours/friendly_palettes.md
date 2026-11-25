# Bink Court-Colour Palettes: Court Blue + Green + White, Friendly & Social

Scope: build Bink's marketing-site palette from pickleball court colours (court blue, court green, white line paint) while keeping it friendly and social, not cold or clinical. This replaces the earlier direction (navy #0E1B2C / lime #C8F03C / off-white #F6F7F2 / orange #FF8A3D). Research date: 16 Nov 2026.

Method notes (applies to every number below):
- Contrast ratios were computed locally with the WCAG 2.x relative-luminance formula (sRGB linearisation; L = 0.2126R + 0.7152G + 0.0722B; ratio = (L1+0.05)/(L2+0.05)). Thresholds: 4.5:1 normal text, 3:1 large text (at least 24px, or 18.5px bold), 3:1 for UI components/graphics. — [W3C Understanding SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- Colour-vision-deficiency (CVD) checks: hexes were simulated with the Viénot et al. (1999) protanopia/deuteranopia matrices and the Machado et al. (2009) tritanopia matrix (severity 1.0), in linear RGB. Separation is reported as CIE76 ΔE in Lab. Rough reading: ΔE above 20 is clearly different, 10–20 is noticeable, and below 10 is easily confused. This is my own computation, not a sourced tool output. Verify the final pick in a simulator (e.g. Figma/Stark, Coblis).
- Court-colour hex values are my on-screen approximations. No manufacturer publishes hex/RGB for court coatings (see Q1 gaps).
- The palettes and token names are a design synthesis, not sourced facts. The rationale ties back to cited findings.

---

## 1. What are the real pickleball court-surface colours (blue, green, white lines)?

### Takeaway
There is no official pickleball colour standard, but the convention is clear: a blue playing area with green surrounds and white lines. Manufacturers' most common shades are a mid "standard" blue, a deeper "pro" blue, a light blue, and medium-to-deep "pro/competition" greens. They are matte, somewhat greyed (low-chroma) acrylic colours, not saturated screen primaries. No manufacturer publishes hex values.

### Cited Findings
- "There are no official pickleball court colors". The traditional scheme is "a blue playing area with green surroundings", and blue and green are the most popular. — [The Pickleball Source](https://thepickleballsource.com/pickleball-court-colors/)
- USA Pickleball (USAPA) recommends white lines, because "white lines will contrast with almost any color". — [The Pickleball Source](https://thepickleballsource.com/pickleball-court-colors/)
- Acrytech (a court-coating supplier) on the PPA Tour blog: "The most common colors include Competition Green, Pro Green, Pro Blue, Standard Blue and Light Blue." Slate, Crimson, Red, Competition Blue and earth tones are gaining popularity, and coloured line paint is used as a design choice. This is a vendor perspective. — [PPA Tour blog](https://www.ppatour.com/ppa-blog/pickleball-court-colors-acrytech-has-you-covered/)
- SportMaster's pickleball Court Designer offers 18 standard colours, including Light Green, Light Blue, Ice Blue, Dove Gray, Sandstone, Red, Brite Red, Orange, Tournament Purple, Maroon and Brown. Its featured example is a Light Green court, a Light Blue non-volley zone (kitchen), Light Blue out-of-bounds and White lines. The site warns that "colors may vary slightly from actual product". — [SportMaster Court Designer](https://www.sportmaster.net/courtdesigner/pickle-ball/)
- Laykold offers 20 standard, 12 vibrant and 4 tournament colours, including named shades such as "US Open Blue" and "US Open Green". APP (Association of Pickleball Players) official tournament court colours are exclusive to Laykold. — [Laykold news](https://www.laykold.com/news/pp-launches-new-official-tournament-court-colors-by-laykold); [Laykold colour selector](https://laykold-courts.squarespace.com/colorselector)
- California Sports Surfaces (Plexipave, DecoTurf, Rebound Ace) offers custom RAL/Pantone colour matching, and colours "may vary due to job site conditions, mixing proportions and installation methods". — [California Sports Surfaces](https://www.californiasportssurfaces.com/custom-color-program/); [CSS pickleball](https://www.californiasportssurfaces.com/systems-by-sport/pickleball/)

### Inferences
- Approximate on-screen equivalents (my estimates, not manufacturer values). Use them as "court-inspired anchors":
  - Light Blue (kitchen/surround): about #6FA3D6–#86B6E3
  - Standard Blue: about #2F6DAE–#3E78B8
  - Pro / US Open–style deep blue: about #1D4F8C–#12335A
  - Light Green: about #5E9E68–#7FB585
  - Pro / Competition Green: about #2D6B45–#1E5138
  - Line White: a slightly warm off-white, about #F5F4EF–#F8FAF7 (line paint is not pure #FFFFFF)
- Real courts are matte and mid-value. Reproducing them literally on screen tends to look dull. The variants below push chroma slightly for the bright and pastel options and keep it low for the premium option.
- Pickleballs themselves are typically optic yellow or yellow-green (the current lime #C8F03C is essentially "ball colour"). That gives a sport-native justification for a warm accent. This is observation, not sourced in this session.

### Gaps
- No manufacturer (Laykold, Plexipave/California Products, SportMaster, DecoTurf, Acrytech) publishes hex/RGB/LRV for court colours on pages I could access. The Laykold "Vibrant" PDF contained only design-file swatches, not court-colour values. — [Laykold Vibrant PDF](https://cdn.shopify.com/s/files/1/1713/4277/files/Colors-Laykold-Vibrant.pdf). To get exact values, photograph physical colour chips under daylight with a reference card, or ask a rep for Pantone/RAL matches.
- I did not verify the specific court colours used at Victoria-area courts. A photo audit of local courts would let Bink match "your" court.

---

## 2. Colour theory: which blue/green pairings work, which colour should dominate, and is a warm accent needed?

### Takeaway
Blue and green are analogous hues. They harmonise easily but can muddy if they share the same lightness and saturation. Keep them apart in value (L*), let one dominate (blue, which is closer to "the court" and carries trust), and add a small warm accent. In a cool analogous scheme, the warm accent supplies the "friendly/exciting" energy and the CTA pop that blue and green can't. The pickleball's own yellow makes the accent feel native rather than bolted on.

### Cited Findings
- Labrecque & Milne (J. Academy of Marketing Science 2012, 40(5):711–727): hue maps onto brand-personality dimensions, with blue → competence and red → excitement (as summarised in secondary literature). Saturation and value (lightness) amplify or change those effects. — [Springer DOI](https://link.springer.com/doi/10.1007/s11747-010-0245-y); [J. Brand Mgmt 2017 citing L&M](https://springerlink.bibliotecabuap.elogim.com/10.1057/s41262-017-0086-9)
- Elliot (2015): blue on stores and logos raises perceived quality and trustworthiness. Warm, long-wavelength colours are theorised to feel warm and arousing. The literature is "at a nascent stage", "much of the research remains underpowered", and context changes meaning (color-in-context theory). — [Frontiers in Psychology 2015](https://www.frontiersin.org/articles/10.3389/fpsyg.2015.00368/full); [Elliot & Maier 2014, Annual Review of Psychology](https://pubmed.ncbi.nlm.nih.gov/23808916/)
- Practitioner guidance on 60-30-10: the accent (about 10%) is for "buttons, links, CTAs", and "an accent that does not stand out against the dominant has failed its job". Building the palette from tints and shades of the same hues helps the ratio hold. — [UX Planet](https://uxplanet.org/the-60-30-10-rule-a-simple-way-to-creating-catchy-user-interfaces-e9e2cf957213); [Visily](https://www.visily.ai/?p=90572); [uxdesign.cc Bootcamp](https://bootcamp.uxdesign.cc/60-30-10-rule-how-to-choose-colors-for-your-ui-design-713b3d4c1445)
- Colour pairs that carry meaning should differ in lightness or saturation, not just hue. — [Data Europa accessible palettes guide](https://data.europa.eu/apps/data-visualisation-guide/accessible-colour-palettes); [designsystemproblems deuteranopia guide](https://designsystemproblems.pages.dev/accessibility-compliance/deuteranopia-color-palette)
- Headspace refreshed its brand to be "warmer and more inviting" with orange, explicitly escaping a "dreary sea of blues and greys". Cool-only palettes risk reading clinical in consumer contexts. — [It's Nice That](https://www.itsnicethat.com/articles/italic-studio-headspace-graphic-design-project-250424)
- Friendly consumer brands anchor on one hero colour plus a looser secondary palette. Mailchimp: "We anchor on a single color, used with purpose… Our secondary palette allows us to be more flexible and dynamic." — [Mailchimp design](https://mailchimp.com/design/)

### Inferences
- Dominant colour: Court Blue. It is the playing surface (the most recognisable "court" cue), it carries trust, which matters for meeting strangers, and white text passes on mid/deep blue. Green becomes the 30% supporting colour (sections, illustration, the "surround"). A green-led variant (V4) is included as an alternative.
- Avoiding mud: in my computations, the pairs that read best keep a gap of about 6–12 L* between blue and green, and never place them as adjacent text/background. For example, blue-700 vs green-700 is only 1.23:1, so the two never carry text on each other. Separate them with Line White or use white text on each.
- Is a warm accent needed? Yes. (a) Blue and green are both cool and sit next to each other on the wheel, so the scheme has little temperature contrast and reads calm or "clinical" rather than social. (b) The research links warm hues with excitement and warmth, and blue with competence, so warm + cool covers "welcoming + trustworthy". (c) 60-30-10 needs an accent that stands out against both dominant hues. (d) Ball yellow is literally on court, so it stays inside the "court colours" brief. Keep it to about 5–10% of the page: CTAs, highlights, a ball motif.
- Friendliness levers besides hue: tinted warm whites instead of #FFF, rounded shapes, generous light-tint surfaces (blue-50/green-50), and warm near-black text rather than pure black or cold navy.

### Gaps
- I found no study directly testing "blue+green" palettes for perceived friendliness. The claim that a warm accent increases friendliness is an inference from general warm/excitement findings and brand practice.
- I could not access the full L&M paper, so the hue→trait mappings beyond red/blue/brown/white are unverified.

---

## 3. Website colour best practice: 60-30-10, neutral scale, text, semantic colours, WCAG 2.2, colour-blind safety, dark mode

### Takeaway
For each variant, use: about 60% tinted Line White/neutral surfaces, about 30% court blue (plus green as a supporting colour), and about 10% warm ball accent. Use a tinted neutral scale, warm-ink text, and semantic colours that never rely on hue alone. Blue vs green is well separated for protanopia and deuteranopia (the common red-green CVDs) but weak for tritanopia, so pair them with value differences, labels or icons. Every variant has a clean dark mode.

### Cited Findings
- WCAG 2.2 SC 1.4.3 (AA): 4.5:1 for normal text, 3:1 for large text (18pt / 14pt bold ≈ 24px / 18.5px). SC 1.4.11 uses 3:1 for UI component boundaries and graphics (the Understanding page cites a button "just above 3:1 passes"). — [W3C Understanding 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- In the 60-30-10 rule, the dominant colour is usually neutral and covers backgrounds and large surfaces. The secondary goes to headings, sections and navigation, and the accent to buttons, links and CTAs. Many successful sites bend the rule. — [uxdesign.cc Bootcamp](https://bootcamp.uxdesign.cc/the-60-30-10-color-rule-for-ui-design-32695d04a7c2); [Flowmapp](https://www.flowmapp.com/blog/qa/60-30-10-rule); [Vision Australia](https://secure.visionaustralia.org/business-consulting/digital-access/Creating-accessible-digital-colour-palettes-60-30-10-design-rule)
- CVD guidance: blue stays relatively distinguishable for deuteranopes, and blue/yellow pairings remain distinguishable. Blue vs green is the weak spot under tritanopia. Okabe-Ito is the standard CVD-safe reference set. — [designsystemproblems](https://designsystemproblems.pages.dev/accessibility-compliance/deuteranopia-color-palette); [Studio Matrx](https://www.studiomatrx.org/students/colour-theory-and-application/colour-blindness-and-inclusive-colour); [Jfly (Okabe & Ito)](https://jfly.uni-koeln.de/color)
- 2026 trend context: neutrals are warming away from cool greys and sharp whites. Pantone 2026 is a white (11-4201 Cloud Dancer), which supports a soft "Line White" base. — [Galerie](https://galeriemagazine.com/pantone-announces-cloud-dancer-color-of-the-year-2026/); [Adobe colour trends](https://www.adobe.com/uk/creativecloud/design/discover/color-trends.html); [color-tools blog (low authority)](https://color-tools-et1.pages.dev/blog/web-design-color-trends-2026.html)

### Computed CVD separation, blue vs green pairs (ΔE76: normal / protan / deutan / tritan)
| Pair | Normal | Protan | Deutan | Tritan | L* |
|---|---|---|---|---|---|
| V1 blue-700 #1D5FA8 vs green-700 #2D7A4B | 76.7 | 71.0 | 70.0 | 13.7 | 40 vs 46 |
| V1 blue-500 #3E86D6 vs green-500 #4FA36B | 81.2 | 76.2 | 75.3 | 13.8 | 55 vs 61 |
| V1 blue-50 #EAF2FB vs green-50 #E8F4EC | 8.9 | 8.5 | 8.1 | 1.5 | 95 vs 95 |
| V2 blue-600 #2E6DB4 vs green-600 #3C8A5E | 72.0 | 66.8 | 65.6 | 12.9 | 45 vs 52 |
| V2 blue-300 #8DB8E8 vs green-300 #94CBA6 | 47.4 | 45.3 | 44.3 | 9.8 | 73 vs 77 |
| V3 navy #12335A vs forest #1E5138 | 46.6 | 42.3 | 40.8 | 12.2 | 21 vs 31 |
| V3 navy #12335A vs green-500 #3F9A63 | 74.1 | 66.5 | 61.5 | 39.9 | 21 vs 57 |
| V4 green-700 #2F7D52 vs blue-600 #2C72B8 | 70.4 | 65.7 | 65.2 | 12.2 | 47 vs 47 |
| V1 success #2D7A4B vs error #C0392B | 90.3 | 12.0 | 29.9 | 106.4 | 46 vs 45 |

### Inferences
- Protanopia/deuteranopia (about 8% of men of Northern European descent; prevalence not sourced this session): court blue vs court green stays clearly distinct (ΔE 40–76), because the green collapses toward olive/yellow-grey while the blue stays blue.
- Tritanopia (rare): blue vs green becomes hard to tell apart (ΔE about 10–17), and the difference is almost entirely lightness. Rules: never encode meaning only as "blue vs green". Keep at least about 10 L* between blue and green used side by side. The 50-tints (ΔE about 8, same L*) are decorative only.
- Success-green vs error-red collapses under protanopia (ΔE 12.0). Always pair semantic colours with icons and text ("✓ Matched", "⚠ Fix this"), and use a distinct error red/orange.
- Neutral scale: one hue-tinted grey ramp per variant (tinted toward that variant's dominant hue). Use a light border (about 1.4:1) for card dividers only (decorative). Input and checkbox borders need at least 3:1 against their surface (e.g. #7C8A82 = 3.61:1 on white; #8A978F = 3.04:1, which is borderline).
- Dark mode: in each variant, the dominant blue or green deepens into the dark background, with 300-level tints for links and accents. All tested dark pairs are 6.9:1 or higher.

### Gaps
- The CVD simulation matrices are approximations, and ΔE76 is a coarse metric. I did not run a perceptual user test. Prevalence figures are not sourced here.

---

## 4. The candidate court palettes (3–4 variants) with full tokens, roles and contrast

### Takeaway
Four variants follow. The recommended default is V1 "Outdoor Court": bright standard-blue dominant, pro-green secondary, Line White base and a ball-yellow accent. It is the most recognisably "pickleball court", it is cheerful rather than clinical, white text passes on both brand colours, and it carries over the current lime "ball" equity. V2 "Sunday Social" is the friendliest/softest alternative for a beginner-first tone. V3 "Night Session" is the premium option. V4 "Kitchen Line" is green-led.

### Cited Findings
- Court conventions (blue court, green surround, white lines; light blue kitchen in SportMaster's example) — [The Pickleball Source](https://thepickleballsource.com/pickleball-court-colors/); [SportMaster](https://www.sportmaster.net/courtdesigner/pickle-ball/)
- Contrast thresholds — [W3C 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- All ratios below were computed locally (see the method notes).

### V1 "Outdoor Court": bright, sunny daytime court (RECOMMENDED)
Roles and ratio: 60% Line White/neutral surfaces · 30% Court Blue (with Pro Green as about 10–15% of that, for sections and illustration) · 10% Ball Yellow plus the blue CTA.

| Token | Hex | Role |
|---|---|---|
| blue-700 "Court Blue" | #1D5FA8 | Primary: CTA fill, headings, links, nav |
| blue-500 | #3E86D6 | Hover/illustration, large type only |
| blue-50 | #EAF2FB | Tinted section background |
| green-700 "Pro Green" | #2D7A4B | Secondary: section bands, badges, success |
| green-500 | #4FA36B | Illustration, large type with ink |
| green-50 | #E8F4EC | Tinted section background |
| ball-400 "Ball Yellow" | #F4E04D | Accent: highlight CTA fill (with ink text), ball motif, underlines |
| bg "Line White" | #F8FAF7 | Page background |
| surface | #FFFFFF | Cards |
| border-subtle | #D5DED8 | Dividers (decorative) |
| border-input | #7C8A82 | Form controls |
| ink (text) | #15233A | Body/headings |
| ink-muted | #4B5A6B | Secondary text |
| error | #C0392B | Errors (with icon) |
| warning-text | #9A5B00 | Warnings |
| success | = green-700 | Success (with icon) |

Contrast (light): ink/bg **15.01** · muted/bg **6.73** · muted/white **7.06** · blue-700/bg **6.15** · white on blue-700 CTA **6.45** · white on blue-500 **3.76** (large only) · green-700/bg **5.01** · white on green-700 **5.25** · white on green-500 **3.10** (large only) · ink on green-500 **5.09** · ink on blue-50 **13.94** · ink on green-50 **13.94** · ink on Ball Yellow **11.71** · Ball Yellow shape on bg **1.28** (fails 3:1, so a yellow button needs an ink border or must sit on a blue/dark band) · border-input/white **3.61** · border-subtle/white 1.38 (decorative only) · error/bg **5.18** · white on error **5.44** · error on #FDECEA **4.76** · warning/bg **5.17** · blue-700 on blue-50 **5.71** · green-700 on green-50 **4.65** · blue-700 vs green-700 **1.23** (never text-on-each-other).

Dark mode: bg #0F1A2A, surface #172538, text #EEF2F0, muted #A9B6C4, blue-300 #7FB2EE, green-300 #7CCB98, Ball Yellow #F4E04D. Ratios: text/bg **15.48** · text/surface **13.69** · muted/bg **8.47** · blue-300/bg **7.91** · bg-coloured text on blue-300 CTA **7.91** · green-300/bg **9.03** · yellow/bg **13.00**. Very feasible.

Why recommended: it is the most literal and recognisable court cue (blue court, green surround, white lines, yellow ball), it uses friendly brightness without neon, it has the strongest CVD separation (ΔE ≥ 70 protan/deutan for the main pair), the primary CTA passes AA with white text, and Ball Yellow preserves equity from the current lime while adding warmth.

### V2 "Sunday Social": soft, pastel, beginner-friendly
Roles: 60% warm Line White plus light blue/green tints (like the kitchen and surround) · 30% mid blue/green · 10% Sunny accent (a warm, ball-like amber).

| Token | Hex | Role |
|---|---|---|
| blue-600 | #2E6DB4 | Primary: links, headings, secondary CTA (white text) |
| blue-300 "Kitchen Blue" | #8DB8E8 | Large tinted panels, illustration |
| blue-100 | #DCEAF8 | Section background |
| green-700 | #2F7550 | Green text/buttons (AA with white) |
| green-600 | #3C8A5E | Illustration/large only |
| green-300 | #94CBA6 | Panels/illustration |
| green-100 | #DDF0E3 | Section background |
| sunny-400 | #FFB84D | Primary CTA fill (ink text), highlights |
| bg | #FAFAF6 | Page |
| surface | #FFFFFF | Cards |
| border-input | #8494A6 | Form controls |
| ink | #1D2B3A | Text |
| ink-muted | #55657A | Secondary text |
| error | #B3261E | Errors |

Contrast: ink/bg **13.76** · muted/bg **5.69** · blue-600/bg **5.06** · white on blue-600 **5.30** · green-600/bg **4.02** (fails normal text, so use green-700) · white on green-600 **4.21** (fail) · green-700/bg **5.31** · white on green-700 **5.55** · ink on blue-300 **6.96** · ink on green-300 **7.78** · ink on blue-100 **11.77** · ink on green-100 **12.10** · ink on Sunny CTA **8.37** · white on Sunny **1.72** (FAIL, never do this) · Sunny shape on bg **1.64** and blue-300 on bg **1.98** (decorative; buttons need an ink border or label) · border-input/white **3.10** · error/bg **6.25**.

Dark mode: bg #121A22, text #EDF1F4 **15.45** · blue-300 **8.49** · green-300 **9.49** · Sunny **10.21** · dark text on Sunny CTA **10.21**. Feasible.

CVD caution: blue-300 vs green-300 is fine for protan/deutan (ΔE about 44) but tritan ΔE is 9.8 (confusable), so pastels should never be the only cue.

When to choose: if the founder wants maximum warmth and approachability for beginners. Trade-off: a less "sporty" look, and it relies on an amber accent that is a step away from literal court colours.

### V3 "Night Session": deep, premium court under lights
Roles: 60% Line White (light sections) plus deep navy hero/footer bands · 30% navy/forest · 10% Optic ball yellow.

| Token | Hex | Role |
|---|---|---|
| navy-900 "Pro Blue" | #12335A | Primary: hero/footer bands, headings |
| blue-600 | #2F6DAE | Links, secondary buttons |
| forest-800 "Competition Green" | #1E5138 | Secondary bands, success |
| green-500 | #3F9A63 | Illustration, large accents on navy |
| optic-400 "Optic Ball" | #DDEB4A | CTA fill (navy text), highlights on navy |
| bg "Line White" | #F5F4EF | Page |
| surface | #FFFFFF | Cards |
| ink | #111C2B | Text |
| ink-muted | #4A5563 | Secondary text |
| error | #B42318 | Errors |

Contrast: ink/bg **15.57** · muted/bg **6.88** · navy/bg **11.58** · white on navy **12.75** · blue-600/bg **4.87** · white on blue-600 **5.36** · forest/bg **8.33** · white on forest **9.17** · green-500 on navy **3.65** (large/graphics only) · navy on Optic CTA **9.75** · Optic text on navy **9.75** · Optic shape on bg **1.19** (only place Optic buttons on navy bands, or add a border) · navy vs forest **1.39** (never text-on-each-other) · error/bg **5.97**.

Dark mode (native fit): bg #0B1626, surface #12233A, text #F0EFE9 **15.76** / **13.73** · blue-400 #6FA3DD **6.88** · green-400 #5FB884 **7.50** · Optic **13.88**. Excellent.

Trade-off: closest to the current navy/lime brand (easy migration) but the least "friendly". The dark bands read premium/competitive. Navy vs forest is only ΔE about 41–47 normal/CVD and L* 21 vs 31, so they look muddy if adjacent. Separate them with white.

### V4 "Kitchen Line": green-led court (green dominant, blue secondary)
Mirrors SportMaster's example (Light Green court, Light Blue kitchen, White lines). Roles: 60% Line White · 30% green · 10% blue + Ball Yellow.

| Token | Hex | Role |
|---|---|---|
| green-700 | #2F7D52 | Primary: CTA (white text), headings |
| green-500 | #58A874 | Illustration |
| green-100 | #E3F2E7 | Sections |
| blue-600 | #2C72B8 | Secondary: links, badges |
| blue-300 "Kitchen Blue" | #86B6E3 | Panels |
| ball-400 | #F4E04D | Accent (ink text) |
| bg | #F9FAF6 | Page |
| ink | #17271F | Text (green-black) |
| ink-muted | #4E5E55 | Secondary text |

Contrast: ink/bg **14.88** · muted/bg **6.55** · green-700/bg **4.80** · white on green-700 **5.03** · blue-600/bg **4.76** · white on blue-600 **4.99** · ink on blue-300 **7.29** · ink on green-100 **13.46** · ink on Ball Yellow **11.60**.
Dark: bg #0F1A14, text #ECF1EC **15.58** · green-300 #7FC99A **9.10** (and dark text on it 9.10) · blue-300 **8.33**.

Trade-off: green-dominant reads "outdoors/nature" and fits the Pacific Northwest, but it competes with Duolingo-style green associations and success-state semantics. green-700 and blue-600 share L* 47, so they are confusable in greyscale and tritanopia (ΔE 12.2). Use them together only with labels.

### Inferences
- Recommendation: **V1 "Outdoor Court"**, optionally borrowing V2's tinted blue-100/green-100 section backgrounds to add softness. If the founder prioritises an evolution of the existing navy/lime brand, V3 is the low-friction migration, but it should be paired with lots of Line White and photography of people to stay friendly.
- In all variants, bright accents (Ball Yellow, Sunny, Optic) always carry dark text, and white text only goes on the -600/-700 blues and greens or darker.

### Gaps
- No user testing of perceived friendliness between variants. A quick 5-second test or preference poll with local players would settle V1 vs V2.

---

## 5. Keeping it friendly & social (not cold/clinical), and pitfalls to avoid

### Takeaway
Blue + green + white can easily slide into "hospital/fintech/SaaS". The fixes are warm-tinted whites, a warm ball-yellow accent, a warm ink text colour, tinted section backgrounds, and people-first photography. Avoid neon overload, pure #FFFFFF expanses with cool greys, and owning a competitor's hero hue.

### Cited Findings
- Consumer brands warm up to escape a "sea of blues and greys" (Headspace). — [It's Nice That](https://www.itsnicethat.com/articles/italic-studio-headspace-graphic-design-project-250424)
- Friendly brands use one hero colour plus warm near-black type and a looser secondary palette (Mailchimp: Cavendish Yellow hero, Peppercorn accents). — [Mailchimp design](https://mailchimp.com/design/); [Mailchimp brand assets](https://mailchimp.com/about/brand-assets/)
- Hero hues of well-known friendly brands to avoid matching: Duolingo Feather Green #58CC02 (third-party hex), Airbnb Rausch #FF385C, Mailchimp yellow #FFE01B (third-party). — [Canny Creative](https://www.canny-creative.com/brand-breakdown/brand/duolingo/); [color.codes.in](https://color.codes.in/brands/airbnb); [webdesignhot](https://www.webdesignhot.com/design.md/mailchimp/)
- Red is linked with avoidance and caution in achievement contexts, so it is a poor dominant colour for anxious beginners. — [Frontiers in Psychology 2015](https://www.frontiersin.org/articles/10.3389/fpsyg.2015.00368/full)
- Bumble's 2024 rebrand (new logo, fonts, colours, illustrations) was followed by a sharp fall in brand perception, driven mainly by the campaign messaging. A palette alone doesn't make a brand feel friendly. — [YouGov](https://business.yougov.com/content/51733-from-rebrand-to-controversy-bumbles-brand-health-struggles-in-2024-2025); [Marketing Brew](https://marketingbrew.com/stories/2024/06/05/what-went-wrong-with-bumble-s-rebrand)
- 2026 trend: warm neutrals over cool greys. Pantone 2026 Cloud Dancer is a soft white. — [Galerie](https://galeriemagazine.com/pantone-announces-cloud-dancer-color-of-the-year-2026/); [Adobe](https://www.adobe.com/uk/creativecloud/design/discover/color-trends.html)
- The current palette's orange #FF8A3D with white text is 2.35:1 (fails AA), and lime on off-white is 1.22:1 (computed). — threshold from [W3C](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

### Inferences
- Pitfalls specific to court palettes:
  1. Mid-saturation "SaaS blue" (#2563EB-style) at #FFFFFF reads corporate. Prefer slightly greyed court blues on a warm Line White.
  2. Blue and green at the same lightness next to each other look muddy and fail tritan CVD. Separate them with white or by at least 10 L*.
  3. Neon ball-yellow as large fields causes "neon fatigue". Keep it at 10% or less.
  4. Green as a brand colour conflicts with success-state semantics. Use icons and labels, and consider a distinct success shade.
  5. A literal matte court reproduction looks drab on screen, so lift chroma slightly.
- Friendliness boosters within the brief: rounded corners, illustrated court lines as playful motifs (e.g. the kitchen line as a section divider), light-blue "kitchen" tinted panels, and warm ink text.
- Earlier non-court candidates from the first pass, for reference only (all AA-checked): "Harbour Sunset" (teal #0F4C5C + coral #FF6B4A, ink-on-coral CTA 5.20), "Salish Sun" (kelp #1F6F5C + yellow #FFC845), "Court Clay" (terracotta #B8502A + sage), "Camas Meadow" (violet #5B4BA8 + marigold #FFB23F), "Beacon Hill Blossom" (evergreen + raspberry #C2255C). These are superseded by the court-colour direction.

### Gaps
- I could not verify direct pickleball competitors' palettes (DUPR, Pickleheads returned 403, PlayByPoint, CourtReserve). Many pickleball apps likely already use blue/green/lime, so a manual competitor sweep is needed to make sure V1 is still distinctive.
- Meetup, Hinge, Partiful and Timeleft palettes are unverified (no reliable sources found).
