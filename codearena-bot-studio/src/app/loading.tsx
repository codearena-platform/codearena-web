export default function Loading() {
  return (
    <div className="grid w-full max-w-7xl grid-cols-1 gap-6 lg:grid-cols-3" aria-label="Loading bot studio">
      <div className="h-[500px] animate-pulse rounded-xl border border-white/10 bg-black/50 lg:col-span-2" />
      <div className="flex flex-col gap-4">
        {[320, 160, 160].map((height) => (
          <div key={height} className="animate-pulse rounded bg-white/5" style={{ height }} />
        ))}
      </div>
    </div>
  );
}
