// TopBar — language toggle + user menu
// Used in: dashboard layout (desktop)

'use client'

import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { LangToggle } from '@/components/shared/LangToggle'
import { UpdateBanner } from '@/components/layout/UpdateBanner'
import { LogOut } from 'lucide-react'

export function TopBar() {
  const tAuth = useTranslations('auth')
  const tRoles = useTranslations('roles')
  const { data: session } = useSession()

  const roleKey = session?.user?.role as 'SUPER_ADMIN' | 'CLINIC_ADMIN' | 'DOCTOR' | undefined
  const roleLabel = roleKey ? tRoles(roleKey) : ''

  return (
    <>
      <UpdateBanner />
      <header className="h-14 border-b border-outline-variant bg-surface-container-low flex items-center justify-between px-4 sticky top-0 z-30">
        {/* Left: role & name */}
        <div className="flex flex-col">
          {roleLabel && (
            <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
              {roleLabel}
            </span>
          )}
          <span className="text-sm font-semibold text-on-surface leading-tight">
            {session?.user?.name}
          </span>
        </div>

        {/* Right: lang toggle + logout */}
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <LangToggle compact />
          </div>
          <div className="hidden md:block">
            <LangToggle />
          </div>
          <button
            id="logout-button"
            onClick={() => signOut({ callbackUrl: '/ar/login' })}
            className="text-on-surface-variant hover:text-error transition-colors p-2 rounded-lg hover:bg-error-container/20 flex items-center gap-2"
          >
            <LogOut size={20} />
            <span className="hidden md:inline text-sm font-medium">{tAuth('logout')}</span>
          </button>
        </div>
      </header>
    </>
  )
}
