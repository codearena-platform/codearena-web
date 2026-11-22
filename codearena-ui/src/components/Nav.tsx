"use client";

const links: { href: string; label: string; key: "arena" | "bot" | "dashboard" }[] = [
  { href: "/arena", label: "Arena Studio", key: "arena" },
  { href: "/bot", label: "Bot Studio", key: "bot" },
  { href: "/dashboard", label: "Dashboard", key: "dashboard" },
];

// Next.js only inlines statically written process.env members in browser bundles.
const APP_URLS = {
  arena: process.env.NEXT_PUBLIC_ARENA_URL,
  bot: process.env.NEXT_PUBLIC_BOT_URL,
  dashboard: process.env.NEXT_PUBLIC_DASHBOARD_URL,
  platform: process.env.NEXT_PUBLIC_PLATFORM_URL,
};

function getLink(key: "arena" | "bot" | "dashboard"): string {
  const url = APP_URLS[key];
  if (url) return url;
  const base = APP_URLS.platform || "";
  return base ? `${String(base).replace(/\/$/, "")}/${key}` : `/${key}`;
}

export function Nav({ current }: { current?: "arena" | "bot" | "dashboard" }) {
  const homeHref = APP_URLS.platform || "/";

  return (
    <nav className="flex gap-4 items-center border-b border-white/10 pb-4 mb-6">
      <a href={homeHref} className="text-lg font-bold text-cyan-400 tracking-tight">
        CodeArena
      </a>
      {links.map(({ href, label, key }) => {
        const linkHref = getLink(key);
        const isActive = current === key;
        return (
          <a
            key={href}
            href={linkHref}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive ? "text-cyan-400 border-b-2 border-cyan-400" : "text-gray-400 hover:text-white"
            }`}
          >
            {label}
          </a>
        );
      })}
    </nav>
  );
}
