'use client'

import { useSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n-navigation'
import { LogOut, LineChart, Users, Settings, Building2, Globe } from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { LangToggle } from '@/components/shared/LangToggle'

export default function ProfilePage() {
  const { data: session } = useSession()
  const t = useTranslations('profile')
  const tRoles = useTranslations('roles')

  if (!session?.user) return null

  const roleKey = session.user.role as 'SUPER_ADMIN' | 'CLINIC_ADMIN' | 'DOCTOR'
  const isAdmin = roleKey === 'SUPER_ADMIN' || roleKey === 'CLINIC_ADMIN'
  const isSuperAdmin = roleKey === 'SUPER_ADMIN'

  // Get first letter of name for avatar
  const initial = session.user.name ? session.user.name.charAt(0).toUpperCase() : 'U'

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-20 pt-4 px-4">
      <h1 className="text-xl font-bold text-on-surface mb-6">{t('pageTitle')}</h1>

      {/* Identity block */}
      <Card className="flex items-center gap-4 p-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold border border-primary/20">
          {initial}
        </div>
        <div>
          <h2 className="text-lg font-bold text-on-surface leading-tight">
            {session.user.name}
          </h2>
          <p className="text-sm font-medium text-primary mt-0.5">
            {tRoles(roleKey)}
          </p>
        </div>
      </Card>

      {/* Preferences section */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-2">
          {t('preferences')}
        </h3>
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 text-on-surface">
              <Globe size={20} className="text-on-surface-variant" />
              <span className="font-medium">{t('language')}</span>
            </div>
            <LangToggle />
          </div>
        </Card>
      </div>

      {/* Admin section */}
      {isAdmin && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-2 mt-6">
            {t('adminSection')}
          </h3>
          <Card className="p-0 overflow-hidden divide-y divide-outline-variant">
            <Link href="/reports" className="flex items-center gap-3 p-4 hover:bg-surface-container-high transition-colors">
              <LineChart size={20} className="text-primary" />
              <span className="font-medium text-on-surface">{t('reports')}</span>
            </Link>
            <Link href="/owners" className="flex items-center gap-3 p-4 hover:bg-surface-container-high transition-colors">
              <Users size={20} className="text-primary" />
              <span className="font-medium text-on-surface">{t('owners')}</span>
            </Link>
            {isSuperAdmin && (
              <Link href="/admin/clinics" className="flex items-center gap-3 p-4 hover:bg-surface-container-high transition-colors">
                <Building2 size={20} className="text-primary" />
                <span className="font-medium text-on-surface">{t('manageClinics')}</span>
              </Link>
            )}
            <Link href="/admin/doctors" className="flex items-center gap-3 p-4 hover:bg-surface-container-high transition-colors">
              <Settings size={20} className="text-primary" />
              <span className="font-medium text-on-surface">{t('manageDoctors')}</span>
            </Link>
          </Card>
        </div>
      )}

      {/* Logout */}
      <div className="pt-6">
        <button
          onClick={() => signOut({ callbackUrl: '/ar/login' })}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-error/30 text-error font-semibold hover:bg-error-container/20 transition-colors"
        >
          <LogOut size={20} />
          {t('logout')}
        </button>
      </div>
    </div>
  )
}
