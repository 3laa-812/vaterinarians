import type { SelectHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, className = '', children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={`w-full rounded-xl bg-surface-container border px-4 py-3 text-on-surface appearance-none focus:outline-none transition-colors ${
          error ? 'border-error focus:border-error' : 'border-outline-variant focus:border-primary'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="absolute end-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
      />
    </div>
  ),
)
Select.displayName = 'Select'
