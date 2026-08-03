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
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="40" height="40" rx="14" fill="var(--color-primary)" fillOpacity="0.15" />
        
        {/* Paw Toes */}
        <path d="M13.5 16.5C12.1193 16.5 11 14.933 11 13C11 11.067 12.1193 9.5 13.5 9.5C14.8807 9.5 16 11.067 16 13C16 14.933 14.8807 16.5 13.5 16.5Z" fill="var(--color-primary)"/>
        <path d="M20 13.5C18.2051 13.5 16.75 11.933 16.75 10C16.75 8.067 18.2051 6.5 20 6.5C21.7949 6.5 23.25 8.067 23.25 10C23.25 11.933 21.7949 13.5 20 13.5Z" fill="var(--color-primary)"/>
        <path d="M26.5 16.5C25.1193 16.5 24 14.933 24 13C24 11.067 25.1193 9.5 26.5 9.5C27.8807 9.5 29 11.067 29 13C29 14.933 27.8807 16.5 26.5 16.5Z" fill="var(--color-primary)"/>
        
        {/* Main Pad with Medical Cross Knockout */}
        <path 
          fillRule="evenodd" 
          clipRule="evenodd" 
          d="M10.5 22.5C10.5 18 15 15.5 20 15.5C25 15.5 29.5 18 29.5 22.5C29.5 28 24 31.5 20 31.5C16 31.5 10.5 28 10.5 22.5ZM19 19.5H21V21.5H23V23.5H21V25.5H19V23.5H17V21.5H19V19.5Z" 
          fill="var(--color-primary)"
        />
      </svg>

      {showWordmark && (
        <span className="font-bold text-xl text-on-surface tracking-tight leading-none whitespace-nowrap">
          {t('prefix')}
          <span className="text-primary font-black ml-[1px]">{t('accent')}</span>
        </span>
      )}
    </div>
  )
}
