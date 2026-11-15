import type { Viewport } from "next";
import type { ReactNode } from "react";
import { brandFont } from "@/shared/styles/fonts";
import "@/shared/styles/tokens.css";
import "./website.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Root layout for the public website. It loads only the website's own styles,
// so nothing here leaks into the app (and the app's Tailwind never touches the site).
export default function WebsiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={brandFont.variable} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
