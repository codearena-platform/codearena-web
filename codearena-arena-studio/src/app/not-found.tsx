import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-bold text-cyan-400">404 — Page not found</h1>
      <p className="text-sm text-gray-400">This route is not part of Arena Studio.</p>
      <Link href="/" className="border border-cyan-500 px-4 py-2 text-xs font-bold uppercase tracking-widest text-cyan-500 hover:bg-cyan-500 hover:text-black">
        Back to Arena Studio
      </Link>
    </main>
  );
}
