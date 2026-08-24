// Card — the one surface container used everywhere. Change styling here, it changes everywhere.

interface CardProps {
  children?: React.ReactNode
  className?: string
  onClick?: () => void
  variant?: 'default' | 'guardian'
}

export function Card({ children, className = '', onClick, variant = 'default' }: CardProps) {
  const baseStyles = variant === 'guardian'
    ? 'bg-guardian-surface shadow-[0_12px_32px_rgba(62,63,41,0.05)] rounded-3xl p-6'
    : 'rounded-xl border border-outline-variant bg-surface-container-low p-5 shadow-medical'
    
  const hoverStyles = onClick 
    ? variant === 'guardian'
      ? 'cursor-pointer hover:scale-[1.02] active:scale-95 transition-transform'
      : 'cursor-pointer hover:border-primary/30 transition-colors'
    : ''

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${hoverStyles} ${className}`}
    >
      {children}
    </div>
  )
}
