// Button — primary and secondary variants. Every button in the app uses one of these.

import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'guardian-primary' | 'guardian-secondary' | 'guardian-outline'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'rounded-xl font-semibold px-5 py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-primary text-on-primary hover:bg-primary/90',
    secondary:
      'border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-outline',
    ghost:
      'text-on-surface-variant hover:text-on-surface hover:bg-surface-container',
    'guardian-primary': 'bg-guardian-accent text-white hover:bg-guardian-accent/90 shadow-[0_4px_20px_rgba(99,102,241,0.25)] border-none',
    'guardian-secondary': 'bg-guardian-secondary text-white hover:bg-guardian-secondary/90 shadow-[0_4px_20px_rgba(251,146,60,0.25)] border-none',
    'guardian-outline': 'bg-transparent border border-guardian-accent/20 text-guardian-accent hover:bg-guardian-accent/5',
  }

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  )
}
