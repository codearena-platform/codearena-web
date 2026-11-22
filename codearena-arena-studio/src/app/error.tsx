"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-bold text-red-400">Something went wrong</h1>
      <p className="max-w-lg text-sm text-gray-400">{error.message || 'An unexpected error occurred.'}</p>
      <button
        type="button"
        onClick={reset}
        className="border border-cyan-500 px-4 py-2 text-xs font-bold uppercase tracking-widest text-cyan-500 hover:bg-cyan-500 hover:text-black"
      >
        Try again
      </button>
    </main>
  );
}
