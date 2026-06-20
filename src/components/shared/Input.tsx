import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...props }, ref) => (
    <div>
      <input
        ref={ref}
        className={`w-full rounded-xl bg-surface-container border px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none transition-colors ${
          error ? 'border-error focus:border-error' : 'border-outline-variant focus:border-primary'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-error mt-1">{error}</p>}
    </div>
  ),
)
Input.displayName = 'Input'
