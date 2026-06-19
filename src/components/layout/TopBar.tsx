// TopBar — language toggle + user menu
// Used in: dashboard layout (desktop)

'use client'

import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { LangToggle } from '@/components/shared/LangToggle'
import { UpdateBanner } from '@/components/layout/UpdateBanner'

export function TopBar() {
  const t = useTranslations('auth')
  const { data: session } = useSession()

  return (
    <>
      <UpdateBanner />
      <header className="h-16 border-b border-outline-variant bg-surface-container-low flex items-center justify-between px-4 sticky top-0 z-30">
        {/* Left: user name */}
        <span className="text-sm font-medium text-on-surface-variant">
          {session?.user.name}
        </span>

        {/* Right: lang toggle + logout */}
        <div className="flex items-center gap-3">
          <LangToggle />
          <button
            id="logout-button"
            onClick={() => signOut({ callbackUrl: '/ar/login' })}
            className="text-sm text-on-surface-variant hover:text-error transition-colors px-2 py-1 rounded-lg hover:bg-error-container/20"
          >
            {t('logout')}
          </button>
        </div>
      </header>
    </>
  )
}
