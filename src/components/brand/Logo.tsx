// Logo — the clinic system's brand mark. Used in: Sidebar, login page, PWA splash.
// SVG-based so it's crisp at any size and inherits color from currentColor.

'use client'

import { useTranslations } from 'next-intl'

interface LogoProps {
  size?: number
  showWordmark?: boolean
  className?: string
}

export function Logo({ size = 32, showWordmark = false, className = '' }: LogoProps) {
  const t = useTranslations('brand')

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="40" height="40" rx="11" fill="var(--color-primary)" />
        <path
          d="M20 9c-1.1 0-2 .9-2 2v3.2c0 .6.4 1 1 1h2c.6 0 1-.4 1-1V11c0-1.1-.9-2-2-2z"
          fill="var(--color-on-primary)"
        />
        <path
          d="M14.5 13.5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM25.5 13.5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
          fill="var(--color-on-primary)"
        />
        <path
          d="M20 17.5c-3.6 0-7 2.8-7 6.8 0 2.6 1.9 4.2 4.2 4.2.9 0 1.5-.3 2.1-.7.5-.3.9-.5 1.7-.5s1.2.2 1.7.5c.6.4 1.2.7 2.1.7 2.3 0 4.2-1.6 4.2-4.2 0-4-3.4-6.8-7-6.8z"
          fill="var(--color-on-primary)"
        />
      </svg>

      {showWordmark && (
        <span className="font-bold text-lg text-on-surface leading-none whitespace-nowrap">
          {t('prefix')}
          <span className="text-primary">{t('accent')}</span>
        </span>
      )}
    </div>
  )
}
