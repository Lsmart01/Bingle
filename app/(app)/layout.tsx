import type { Metadata } from "next";
import type { ReactNode } from "react";
import { brandFont } from "@/shared/styles/fonts";
import "@/shared/styles/tokens.css";
import "./app.css";

export const metadata: Metadata = {
  title: "Bingle",
};

// Root layout for the signed-in app (styled with Tailwind). There are no app
// pages yet; the app shell (navigation, tab bar) will be added here.
export default function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={brandFont.variable}>
      <body>{children}</body>
    </html>
  );
}
