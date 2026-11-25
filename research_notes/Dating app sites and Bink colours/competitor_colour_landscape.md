# Competitor Colour Landscape for Bink (dating/social-matching apps + pickleball/racket brands)

Method note (applies to every "site scrape" citation below): on 2026-11-16 I downloaded each brand's official homepage (and, where reachable, its linked CSS) with curl and counted how often each 6-digit hex code appeared. The `theme-color` meta tag is the brand's declared browser/UI colour, so it is the strongest signal. Raw frequency counts are a weaker signal: they are inflated by neutrals and greys, and sometimes by third-party social icons (TikTok #fe2c55/#25f4ee, Google #4285f4 etc.) or WordPress default presets (#0693e3, #00d084, #ff6900, #fcb900). I removed those where I recognised them. Counts are shown in parentheses as "(n)". Brandfetch (403) and Pickleheads/PickleballBrackets/Franklin (blocked or no response to curl) could not be scraped.

## Primary and secondary colours of each brand

### Takeaway
Dating is clearly split. Tinder holds hot pink-red, Bumble holds yellow, and Hinge, Raya and Feeld have moved to "premium" black/white/off-white with muted or lilac accents. Timeleft is the main warm outlier, with navy and orange. On the pickleball side, almost everything is navy or blue with a neon yellow-green (ball colour) accent. The exceptions are MLP's navy and orange, Selkirk's red, and JOOLA's black and greyscale.

### Cited Findings

**(a) Dating / social-matching**

| Brand | Primary | Secondary / accents | Confidence / notes |
|---|---|---|---|
| Tinder | Pink-red #FD267A (homepage `theme-color`) | #FF2358, #EB0052 (gradient stops / CTA reds), dark grey #424242 | High for #FD267A. Third-party databases disagree: #FD3A73 + #424242 (Brand Palettes), #FE3C72 (ColorPickerCode), #FF7158 orange + #FD2B7B (colorfyi, the old orange-to-pink flame gradient) |
| Hinge | Black #1A1A1A ("Hinge Black") and off-white #FFFEFD ("Hinge White") | Site uses dark slate #2B333F, pale blue tints #EDF9FE/#BEE9FB, aubergine #67295F | Black/white confirmed by Hinge brand material via search summary; third-party red #E94B3C does not match official material |
| Bumble | Yellow #FFC629 | Lighter yellow #FFDB5B, near-black #202020 (dominant, 1,203 occurrences), red-orange #CD2E0F (68) | Site CSS confirms #FFC629 (48 hits). Brandcolorcode notes yellow values are not stated explicitly in Bumble's guidelines |
| Bumble BFF | (not separately found) | Historically a teal/green sub-brand; unverified | Gap: no source found this session |
| Raya | Black/white monochrome (from memory, unverified) | Homepage stub showed teal #15ACBE (14), system red #FF3B30, greys | Low. raya.app returned only a 1.4 KB stub page |
| Feeld | Deep purple-black #2B263A (119) and #181424 (108) | Lilac #EECAFF, periwinkle #C9CEF8, cobalt #394ACB, coral #FF8469, mint #B0FFD1, violet #652184 | 2023 rebrand by Made Thought: fluid colour fields from dancer footage, described as "playful and demure" |
| Coffee Meets Bagel | Not determinable | Homepage only exposed pale teals #E5F5F5, #A5D5D5 | Low; gap |
| Meetup | Historic "Meetup red" (logo retained red in the 2016 Sagmeister & Walsh rebrand) | Site CSS: teal #00798A (24), red #C80000, raspberry pinks #E32359/#D63B63, near-black #121215 | Sept 2025 redesign introduced a "lively color palette" and new logo, but no hex values were published |
| Timeleft | Deep navy #181F32 (392) | Orange #F97709 (60), peach #FFD8C8 (30), warm beige #DED7CA / #F2EFE9 | High (strong frequency signal) |

Sources: Tinder (site scrape) — [tinder.com](https://tinder.com); [Brand Palettes – Tinder](https://brandpalettes.com/tinder-color-codes/); [colorfyi – Tinder](https://colorfyi.com/tr/brands/tinder); [ColorPickerCode – Tinder](https://www.colorpickercode.com/color-palette/brand-palettes/tinder/). Hinge — [Hinge brand guidelines preview](https://hinge-preview.vercel.app/brand); [hinge.co](https://hinge.co/en-us) (scrape). Bumble — [bumble.com](https://bumble.com) (scrape); [Brand Color Code – Bumble](https://www.brandcolorcode.com/bumble); [Brand Palettes – Bumble](https://brandpalettes.com/bumble-color-codes/). Raya — [raya.app](https://www.raya.app) (scrape). Feeld — [feeld.co](https://feeld.co) (scrape); [It's Nice That on the Feeld rebrand](https://itsnicethat.com/news/feeld-rebrand-graphic-design-141123); [Feeld designer roundtable](https://feeld.co/ask-feeld/how-to/a-roundtable-with-feeld-designers-on-the-app-s-newest-evolution); [Feeld brand art direction](https://brand.feeld.co/art-direction). Coffee Meets Bagel — [coffeemeetsbagel.com](https://coffeemeetsbagel.com) (scrape). Meetup — [meetup.com](https://meetup.com) (scrape); [Meetup blog, 2025 redesign](https://www.meetup.com/blog/new-design-2025/); [LogoLounge, Sagmeister interview](https://www.logolounge.com/news/meetup-grows-up-an-interview-with-stefan-sagmeister); [Business Wire, 30 Sep 2025](https://www.businesswire.com/news/home/20250930663024/en). Timeleft — [timeleft.com](https://timeleft.com) (scrape).

**(b) Pickleball / racket sport**

| Brand | Primary | Secondary / accents | Confidence / notes |
|---|---|---|---|
| DUPR | Deep navy #05155E (44) | Bright blues #3898EC, #3A79E0, #2B63C2, #4B97FE, #0163D0; dark navy #0F2134/#0A1933; green #3C7C43 | High: blue/navy brand |
| PickleballBrackets | — | — | Site did not respond to curl; gap |
| Playtomic | Electric blue #335FFF (12) | Neon lime #C8FC2C (10), dark navy #0E2433, white | High |
| PlayYourCourt | Near-black #0A0A0A / #141412 | Neon yellow #E8FF3D, #F2FF6B; olive #6B7A00; warm greys #76766F, #D2D2CB | High: black plus ball-yellow |
| Pickleheads | — | Only #313131 visible (bot-blocked page) | Gap |
| CourtReserve | Dark charcoal #212424 | Lime green #94DE64 (21), forest green #4A812F/#56803A, blue #0274BE | Medium-high |
| Selkirk | Red #D00B2B (99) | Charcoal #252525, warm sand #D8D0B2 (32), red #D6312D, greys | Medium: red dominates site CSS. A third-party "pine-toned" palette is explicitly an unofficial interpretation |
| JOOLA | Black/charcoal #303030, #1E1E1E | White, greys; blue #2332D5 (6) | Medium: e-commerce greyscale, low accent use |
| Franklin Pickleball | Navy #10162C (only colour visible) | — | Low: page mostly blocked |
| PPA Tour | Navy #0C2B44 (`theme-color`) | Bright blue #228BE6 (37), yellow #FFD521 | High for navy |
| Major League Pickleball | Navy #0A2137 (30) / #06192E | Orange #EF612D (29), pale aqua #B2EBF2 | High |
| Pickleball Canada | Unclear | Homepage colours are WordPress defaults (#0693E3, #00D084, #FCB900, #FF6900), so not brand evidence; #32373C dark grey | Low; gap |
| Victoria Regional Pickleball Association (VRPA) | Hosted on Pickleball Canada club platform; template blue #4C76E0 | — | Low: platform template, not a distinct brand. VRPA is the main regional club (about 635–870 members reported across 2023–2025) |
| Victoria Pickleball Centre (Langford) | — | — | Gap: site not found at guessed domain |

Sources: [dupr.com](https://dupr.com); [playtomic.com](https://playtomic.com); [playyourcourt.com](https://playyourcourt.com); [courtreserve.com](https://courtreserve.com); [selkirk.com](https://selkirk.com); [Made Good Designs, unofficial Selkirk palette](https://madegooddesigns.com/?p=67955); [joola.com](https://joola.com); [franklinpickleball.com](https://franklinpickleball.com); [ppatour.com](https://ppatour.com); [majorleaguepickleball.co](https://majorleaguepickleball.co); [pickleballcanada.org](https://pickleballcanada.org) (all site scrapes); [VRPA about page](https://secure.pickleballcanada.org/club/victoria-regional-pickleball-association/1033/about-vrpa/3454/); [Capital Daily on Victoria pickleball](https://www.capitaldaily.ca/news/pickleball-is-booming-and-victoria-wants-to-lead-the-way); [Langford, Victoria Pickleball Centre opening](https://langford.ca/people-are-so-excited-victoria-pickleball-centre-now-open-in-langford/).

### Inferences
- Tinder has moved from the older orange-to-pink flame gradient (#FF7158 → #FD2B7B) towards a single hot pink-red (#FD267A) as its declared theme colour. Treat the orange-led gradient as legacy.
- Meetup's red-led identity is now one part of a broader 2025 "lively" palette. The teal and raspberry seen in the CSS may be leftovers from the old design system, so this needs visual confirmation.

### Gaps
- No official hex values were found for Bumble BFF, Raya, Coffee Meets Bagel, PickleballBrackets, Pickleheads or Pickleball Canada. Brandfetch returned 403 and these sites blocked scraping. Checking these visually (screenshots or App Store icons) is recommended.
- Selkirk's red may be its e-commerce sale/CTA colour rather than its logo colour. A visual check is needed.

## Which colours are saturated/overused

### Takeaway
In pickleball, navy/deep blue plus a neon yellow-green "ball" accent is the default. Five of the nine scrapeable pickleball/racket brands use navy or blue as their lead colour, and three use neon lime or yellow. In dating, hot pink/red (Tinder, Meetup's legacy red) and yellow (Bumble) are owned outright. The "premium" set (Hinge, Raya, Feeld) has crowded black/white/aubergine-lilac.

### Cited Findings
- Navy/deep blue leads at DUPR (#05155E), PPA Tour (#0C2B44), MLP (#0A2137), Franklin (#10162C), and Playtomic (navy #0E2433 under electric blue #335FFF) — scrapes of [dupr.com](https://dupr.com), [ppatour.com](https://ppatour.com), [majorleaguepickleball.co](https://majorleaguepickleball.co), [franklinpickleball.com](https://franklinpickleball.com), [playtomic.com](https://playtomic.com).
- Neon ball yellow-green appears as the accent at Playtomic (#C8FC2C), PlayYourCourt (#E8FF3D/#F2FF6B) and CourtReserve (#94DE64 lime) — [playtomic.com](https://playtomic.com), [playyourcourt.com](https://playyourcourt.com), [courtreserve.com](https://courtreserve.com).
- Blacks and charcoals lead at JOOLA and PlayYourCourt — [joola.com](https://joola.com), [playyourcourt.com](https://playyourcourt.com).
- Orange appears at MLP (#EF612D) — [majorleaguepickleball.co](https://majorleaguepickleball.co). Red appears at Selkirk (#D00B2B) — [selkirk.com](https://selkirk.com).
- Grassroots club logos lean on navy and gold. For example, the Royal Pickle Indonesia concept uses a navy and gold palette — [search summary of Contra portfolio](https://contra.com/p/AocLQRAR-royal-pickle-indonesia-or-logo).
- Dating: Tinder pink-red #FD267A ([tinder.com](https://tinder.com)); Bumble yellow #FFC629 ([bumble.com](https://bumble.com), [Brand Color Code](https://www.brandcolorcode.com/bumble)); Hinge black/white ([Hinge brand](https://hinge-preview.vercel.app/brand)); Feeld purple-black with lilac and periwinkle ([feeld.co](https://feeld.co)).

### Inferences
- Crowded in pickleball: navy, royal or electric blue, neon lime/ball yellow, and black-with-neon "performance" looks. Also crowded, less heavily: orange (MLP) and red (Selkirk).
- Crowded in dating/social: hot pink, coral-red and red; Bumble yellow (any warm saturated yellow reads as Bumble); monochrome black/off-white (Hinge, Raya); and purple/lilac (Feeld). Timeleft has claimed navy plus orange in the "meet strangers IRL" space.
- Teal: the brief lists teal as a suspected pickleball cliche. In this sample it shows up only at Meetup (#00798A) and as a Raya stub colour. That is weaker evidence than for navy or lime, but teal is still not distinctive.

### Gaps
- The sample covers official sites only. Local Victoria club logos (VRPA, Saanich Peninsula group, Victoria Pickleball Centre) could not be checked visually.

## What colour territory is open for a friendly, social pickleball brand

### Takeaway
The open territory is warm and soft-but-saturated hues that neither cluster uses. The best candidates are a terracotta/clay or tomato-coral **with** a warm cream base, a fresh mid or "kelly" green that is clearly not neon lime, and soft sky blue or periwinkle used as a secondary only. A warm off-white or cream background avoids both the navy sport look and the black/white premium-dating look.

### Cited Findings
- Picklewood (Seattle) used court-derived "green and clay" Pantone-matched colours, preppy plaid patterns and warm wood finishes to stand apart from sporty pickleball branding — [Creative Boom](https://www.creativeboom.com/inspiration/picklewood/); [Transform magazine](https://www.transformmagazine.net/articles/2024/tongue-in-cheek-identity-designed-for-seattle-pickleball-club-and-restaurant-picklewood/); [GDUSA](https://gdusa.com/people-people-serves-up-retro-visuals-for-pickleball-club/).
- Timeleft (a social "dinner with strangers" app) differentiates with navy, orange, peach and warm beige — [timeleft.com](https://timeleft.com).
- Afternoon Social Club (Australia) positioned its pickleball identity as "more street than sporty… deliberately uncompetitive" — [Hoodzpah / search summary](https://hoodzpahdesign.com/?p=94612) (attribution as given in search summary; not fetched).

### Inferences
- Open: clay/terracotta (#C8553D-ish range), warm coral that leans orange rather than pink (but avoid MLP's #EF612D and Timeleft's #F97709 exactly), and a mid "court" green paired with cream. These suggest real courts and friendliness, and they do not read as Tinder pink, Bumble yellow or ball-neon.
- Also open: warm cream/off-white bases (around #F6F0E6). Only Timeleft uses warm beige among these competitors.
- Avoid as the **lead** colour: navy/royal blue, neon lime or yellow, hot pink, Bumble yellow, black/white monochrome, and lilac/purple.
- Victoria-specific (inference only): Pacific Northwest and coastal references (sea-glass greens, ocean blue-green, arbutus-bark red-orange) could localise a clay-and-green palette. No source tested this.

### Gaps
- No colour-psychology or user research was gathered on what "friendly, social, skill-matched" pickleball players respond to.

## Notable recent pickleball/sport-social identities praised for design

### Takeaway
The pickleball identities that design press has praised reject the neon-and-navy tour look in favour of retro country-club or heritage cues. Picklewood uses green, clay and plaid, Nettie uses a stark retro palette, and Pickleball Australia's 2025 rebrand centres "joyful rebellion" and play.

### Cited Findings
- **Picklewood (Seattle, 2024, People People)**: retro 1960s/70s country-club identity with Caddyshack-like patterns and Wes Anderson cues, a "Picklewood Plaid", and green and clay courts — [Creative Boom](https://www.creativeboom.com/inspiration/picklewood/); [Transform](https://www.transformmagazine.net/articles/2024/tongue-in-cheek-identity-designed-for-seattle-pickleball-club-and-restaurant-picklewood/).
- **Nettie Pickleball (Hoodzpah)**: nostalgic, playful, "elevated" paddle brand with a stark, simple palette, reviewed on Brand New (UnderConsideration) — [Abduzeedo](https://abduzeedo.com/node/88898); [Dribbble](https://WWW.dribbble.com/shots/16315538-Nettie-Pickleball-Brand-Identity). Hex values not found.
- **Pickleball Australia (6 Nov 2025, The Contenders)**: identity built around "joyful rebellion", bridging backyard play and elite competition. Colours were not described — [Ministry of Sport](https://ministryofsport.com/pickleball-australia-announce-new-brand-identity/); [B&T](https://www.bandt.com.au/pickleball-australia-serves-up-a-fresh-new-look-bold-vision-for-the-future/).
- **Feeld (2023, Made Thought)**: the most design-praised identity among the social/dating apps. It uses fluid colour fields in lilac, periwinkle, coral and mint over purple-black — [It's Nice That](https://itsnicethat.com/news/feeld-rebrand-graphic-design-141123); [The Brand Identity](https://the-brandidentity.com/project/turning-up-the-heat-feelds-rebrand-born-of-collaboration-is-charged-with-electricity-and-energy); [Fast Company](https://www.fastcompany.com/91128467/made-thought-innovation-by-design-2024).
- **Meetup (Sept 2025 redesign)**: new logo, "lively color palette", new fonts and illustrations — [Meetup blog](https://www.meetup.com/blog/new-design-2025/).

### Inferences
- The award-friendly pattern is heritage or leisure warmth (clay, court green, cream, plaid/pattern) rather than performance-tech neon. That fits Bink's "friendly and social" positioning and is still uncommon among pickleball apps.

### Gaps
- No hex palettes were published for Picklewood, Nettie, Pickleball Australia or Meetup's 2025 system. Visual sampling of their imagery would be needed.
- No It's Nice That or Brand New coverage was found for pickleball *apps* (as opposed to clubs or paddle brands).
