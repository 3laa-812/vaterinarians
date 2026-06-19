// SkeletonCard — loading placeholder for list cards
// Used in: animal list, appointment list, owner list

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4 animate-pulse">
      <div className="h-5 w-2/3 rounded-md bg-surface-container-high mb-3" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <div
          key={i}
          className={`h-3.5 rounded-md bg-surface-container-high mb-2 ${
            i === lines - 2 ? 'w-1/3' : 'w-1/2'
          }`}
        />
      ))}
    </div>
  )
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
