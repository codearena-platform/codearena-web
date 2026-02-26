"use client";

const links: { href: string; label: string; key: "arena" | "bot" | "dashboard" }[] = [
  { href: "/arena", label: "Arena Studio", key: "arena" },
  { href: "/bot", label: "Bot Studio", key: "bot" },
  { href: "/dashboard", label: "Dashboard", key: "dashboard" },
];

function getLink(key: "arena" | "bot" | "dashboard"): string {
  const url = (typeof process !== "undefined" && process.env[`NEXT_PUBLIC_${key.toUpperCase()}_URL` as keyof NodeJS.ProcessEnv]) as string | undefined;
  if (url) return url;
  const base = (typeof process !== "undefined" && process.env.NEXT_PUBLIC_PLATFORM_URL) || "";
  return base ? `${String(base).replace(/\/$/, "")}/${key}` : `/${key}`;
}

export function Nav({ current }: { current?: "arena" | "bot" | "dashboard" }) {
  const homeHref = process.env.NEXT_PUBLIC_PLATFORM_URL || "/";

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
