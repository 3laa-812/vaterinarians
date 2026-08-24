'use client'

import { usePathname } from '@/lib/i18n-navigation'
import { GuardianSidebar } from './GuardianSidebar'
import { GuardianTopbar } from './GuardianTopbar'
import { GuardianBottomNav } from '@/app/[locale]/(guardian)/GuardianBottomNav'
import { PageTransition } from '@/components/guardian/PageTransition'

export function GuardianShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname.includes('/guardian/login')

  if (isLogin) {
    return <div className="guardian-portal">{children}</div>
  }

  return (
    <div className="guardian-portal">
      <div className="app">
        <GuardianSidebar />
        <div className="main">
          <GuardianTopbar />
          <div className="content">
            <PageTransition>{children}</PageTransition>
          </div>
        </div>
      </div>
      <GuardianBottomNav />
    </div>
  )
}
