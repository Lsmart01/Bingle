"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

// One tab per app feature. Add a tab here when a new feature gets its own page.
const tabs = [
  { segment: "hill", href: "/hill", label: "King of the hill" },
  { segment: "events", href: "/events", label: "Live map" },
  { segment: "players", href: "/players", label: "Matchmaking" },
];

export function AppNav() {
  // The URL segment under app/(app)/, such as "hill" on /hill.
  const active = useSelectedLayoutSegment();

  return (
    // Full width under the logo on phones, beside it from the sm breakpoint up.
    <nav aria-label="App sections" className="w-full sm:w-auto">
      <ul className="flex flex-wrap gap-1">
        {tabs.map((tab) => {
          const isActive = tab.segment === active;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={`block rounded-full px-3 py-1.5 text-sm font-semibold sm:px-4 sm:py-2 sm:text-base ${
                  isActive ? "bg-ball text-[#10202b]" : "text-muted hover:bg-mint hover:text-ink"
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
