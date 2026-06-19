// Dashboard layout — main shell with Sidebar (desktop), TopBar, MobileNav, OfflineBanner
// Wraps all /[locale]/(dashboard)/* routes

import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { MobileNav } from '@/components/layout/MobileNav'
import { OfflineBanner } from '@/components/layout/OfflineBanner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main content column */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TopBar (desktop) */}
        <TopBar />

        {/* Offline banner */}
        <OfflineBanner />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  )
}
