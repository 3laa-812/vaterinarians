// ErrorMessage — displays bilingual error message from API response
// Never shows raw error objects — always the localized { ar, en } message

'use client'

import { useLocale } from 'next-intl'

interface BilingualError {
  ar: string
  en: string
  code?: string
}

interface ErrorMessageProps {
  error: BilingualError | string | null
  className?: string
}

export function ErrorMessage({ error, className = '' }: ErrorMessageProps) {
  const locale = useLocale()

  if (!error) return null

  const message =
    typeof error === 'string'
      ? error
      : locale === 'ar'
        ? error.ar
        : error.en

  return (
    <div
      role="alert"
      className={`rounded-xl bg-error-container/30 border border-error/20 px-4 py-3 text-sm text-error ${className}`}
    >
      {message}
    </div>
  )
}
