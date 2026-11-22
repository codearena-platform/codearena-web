/**
 * Browser-safe app configuration.
 *
 * Every NEXT_PUBLIC_* member is written statically so Next.js can inline it at
 * build time. Next's Link component adds the configured `basePath` itself;
 * `withBasePath` is for imperative URLs such as fetch() calls.
 */

export const APP_KEYS = ["arena", "bot", "dashboard"] as const;
export type AppKey = (typeof APP_KEYS)[number];

const APP_URLS: Record<AppKey, string | undefined> = {
  arena: process.env.NEXT_PUBLIC_ARENA_URL,
  bot: process.env.NEXT_PUBLIC_BOT_URL,
  dashboard: process.env.NEXT_PUBLIC_DASHBOARD_URL,
};

const PLATFORM_URL = process.env.NEXT_PUBLIC_PLATFORM_URL;

/** Accept both `base` and `/base/` and always return a trailing-slash-free path. */
export function normalizeBasePath(value?: string | null): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed || trimmed === "/") return "";
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.replace(/\/+$/, "");
}

/** Prefix a root-relative URL with the app base path, without double-prefixing. */
export function withBasePath(path: string, basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH)): string {
  if (!path) return basePath || "/";
  // Absolute URLs and relative paths are owned by their caller.
  if (!path.startsWith("/")) return path;
  if (!basePath || path === basePath || path.startsWith(`${basePath}/`)) return path;
  return `${basePath}${path}`;
}

/**
 * Resolve a navigation target for Link. Internal paths are returned without a
 * base path because next/link applies `basePath` from next.config at runtime.
 */
export function resolveAppHref(
  key: AppKey,
  urls: Record<AppKey, string | undefined> = APP_URLS,
): string {
  const configured = urls[key]?.trim();
  return configured && configured !== "/" ? configured : `/${key}`;
}

export function resolvePlatformHref(url: string | undefined = PLATFORM_URL): string {
  const configured = url?.trim();
  return configured && configured !== "/" ? configured : "/";
}
