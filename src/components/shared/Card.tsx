// Card — the one surface container used everywhere. Change styling here, it changes everywhere.

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-outline-variant bg-surface-container-low p-5 shadow-medical ${
        onClick ? 'cursor-pointer hover:border-primary/30 transition-colors' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
