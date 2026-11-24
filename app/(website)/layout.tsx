import type { Viewport } from "next";
import type { ReactNode } from "react";
import { websiteFonts } from "./fonts";
import "./website.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Root layout for the public website. It loads only the website's own fonts and styles,
// so nothing here leaks into the app (and the app's Tailwind never touches the site).
export default function WebsiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={websiteFonts}>
      <body>{children}</body>
    </html>
  );
}
