# app/: pages and URLs

Next.js turns the folders in here into URLs. For example, `app/(app)/profile/page.tsx` becomes `/profile`. Keep page files short: a page should pull its real code from `features/` (app) or from a `_components/` folder next to it (website).

The folders in parentheses are route groups. They're left out of the URL, and each one has its own root layout, so the website and the app load separate styles and never affect each other. Going from one to the other is a full page load.

| Folder | What it is | Styling | URLs |
|---|---|---|---|
| `(website)/` | Public site | Plain CSS in `website.css` | `/` now; later `/about`, `/faq`, `/login`, `/signup` |
| `(app)/` | Signed-in app | Tailwind, set up in `app.css` | Planned: `/profile`, `/players`, `/events`, `/hill` |

A URL can only exist in one group. For example, `/login` can't be in both.

Unknown URLs show Next.js's default 404 page. A branded 404 that covers both groups needs `global-not-found.tsx`, which is still experimental in this version of Next.js.
