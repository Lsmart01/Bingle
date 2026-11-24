import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { brandFont } from "@/shared/styles/fonts";
import "@/shared/styles/tokens.css";
import "./app.css";
import { AppNav, AppNavLinks } from "./_components/app-nav";
import { TestPlayerSwitcher } from "@/shared/auth/test-player-switcher";

export const metadata: Metadata = {
  title: {
    default: "Bink",
    template: "%s | Bink",
  },
};

// Root layout for the signed-in app (styled with Tailwind): a header with the
// section tabs, then the current feature's page below it.
export default function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={brandFont.variable}>
      <body className="min-h-dvh">
        <header className="border-b border-line bg-card">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
            <span className="text-2xl font-extrabold tracking-tight">Bink</span>
            <Suspense fallback={<AppNavLinks active={null} />}>
              <AppNav />
            </Suspense>
          </div>
          {/* TESTING ONLY until sign-in exists: pick which sample player you are. */}
          <div className="mx-auto max-w-5xl px-4 pb-3 sm:px-6">
            <Suspense fallback={null}>
              <TestPlayerSwitcher />
            </Suspense>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
