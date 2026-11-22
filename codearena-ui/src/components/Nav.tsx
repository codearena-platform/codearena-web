"use client";

import Link from "next/link";
import { resolveAppHref, resolvePlatformHref, type AppKey } from "../lib/appConfig";

const LINKS: { label: string; key: AppKey }[] = [
  { label: "Arena Studio", key: "arena" },
  { label: "Bot Studio", key: "bot" },
  { label: "Dashboard", key: "dashboard" },
];

export function Nav({ current }: { current?: AppKey }) {
  return (
    <nav className="flex gap-4 items-center border-b border-white/10 pb-4 mb-6">
      <Link href={resolvePlatformHref()} className="text-lg font-bold text-cyan-400 tracking-tight">
        CodeArena
      </Link>
      {LINKS.map(({ label, key }) => (
        <Link
          key={key}
          href={resolveAppHref(key)}
          className={`px-3 py-1.5 text-sm font-medium transition-colors ${
            current === key
              ? "text-cyan-400 border-b-2 border-cyan-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
