import { Anton, DM_Serif_Display, Inter, Inter_Tight } from "next/font/google";

// Fonts for the public website. Next.js downloads them at build time and
// serves them from the site itself. The app keeps its own brand font.

// Body text
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Headings, labels, the logo and buttons
export const interTight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter-tight",
});

// The "More than a game." headline
export const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-anton",
});

// The italic line under the headline
export const dmSerif = DM_Serif_Display({
  weight: "400",
  style: "italic",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-serif",
});

export const websiteFonts = [inter, interTight, anton, dmSerif].map((f) => f.variable).join(" ");
