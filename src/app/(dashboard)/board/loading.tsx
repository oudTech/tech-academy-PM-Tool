export default function BoardLoading() {
  return (
    <div className="flex gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="w-72 shrink-0">
          <div className="h-6 bg-muted animate-pulse rounded mb-3" />
          <div className="space-y-2.5 bg-muted/30 rounded-xl p-2 min-h-[400px]">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="h-28 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
