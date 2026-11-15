import { Bricolage_Grotesque } from "next/font/google";

// Bingle's brand font, used by both the website and the app.
// Next.js downloads it at build time and serves it from the site itself.
// Add `brandFont.variable` to <html>, then use var(--font-brand) in CSS.
export const brandFont = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-brand",
});
