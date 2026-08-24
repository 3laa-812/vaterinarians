// SkeletonCard — loading placeholder for list cards
// Used in: animal list, appointment list, owner list

export function SkeletonCard({ lines = 3, variant = "default" }: { lines?: number, variant?: "default" | "guardian" }) {
  const containerClass = variant === "guardian" 
    ? "rounded-xl border border-guardian-outline-variant bg-guardian-surface-container-highest p-4 animate-pulse"
    : "rounded-xl border border-outline-variant bg-surface-container-low p-4 animate-pulse";
    
  const innerClass = variant === "guardian"
    ? "bg-guardian-surface-container-high"
    : "bg-surface-container-high";

  return (
    <div className={containerClass}>
      <div className={`h-5 w-2/3 rounded-md ${innerClass} mb-3`} />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <div
          key={i}
          className={`h-3.5 rounded-md ${innerClass} mb-2 ${
            i === lines - 2 ? 'w-1/3' : 'w-1/2'
          }`}
        />
      ))}
    </div>
  )
}

export function SkeletonList({ count = 4, variant = "default" }: { count?: number, variant?: "default" | "guardian" }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} variant={variant} />
      ))}
    </div>
  )
}
