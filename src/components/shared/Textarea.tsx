import type { TextareaHTMLAttributes } from 'react'
import { forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = '', ...props }, ref) => (
    <div>
      <textarea
        ref={ref}
        className={`w-full rounded-xl bg-surface-container border px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none transition-colors resize-none ${
          error ? 'border-error focus:border-error' : 'border-outline-variant focus:border-primary'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-error mt-1">{error}</p>}
    </div>
  ),
)
Textarea.displayName = 'Textarea'
