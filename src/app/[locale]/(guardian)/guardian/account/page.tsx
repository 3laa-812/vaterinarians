'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from '@/lib/i18n-navigation'
import { signOut, useSession } from 'next-auth/react'
import { User, LogOut, Settings, Bell, CreditCard, ChevronRight } from 'lucide-react'

export default function GuardianAccountPage() {
  const t = useTranslations('guardian')
  const router = useRouter()
  const { data: session } = useSession()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/guardian/login' })
  }

  return (
    <div className="flex flex-col min-h-screen bg-guardian-bg text-guardian-text pb-24">
      <div className="px-6 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-guardian-bg/80 backdrop-blur-md z-10">
        <h1 className="text-2xl font-bold text-guardian-text">My Account</h1>
      </div>

      <div className="px-6 mt-4 space-y-6">
        {/* Profile Info */}
        <div className="bg-guardian-surface shadow-[0_4px_20px_rgba(28,25,23,0.05)] rounded-2xl p-6 border border-stone-100 flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-2xl shrink-0">
            {session?.user?.name?.charAt(0) || <User size={28} />}
          </div>
          <div>
            <h2 className="font-bold text-lg">{session?.user?.name || 'Guardian'}</h2>
            <p className="text-sm text-stone-500">{session?.user?.email || 'No email provided'}</p>
          </div>
        </div>

        {/* Settings Links */}
        <div className="bg-guardian-surface shadow-[0_4px_20px_rgba(28,25,23,0.05)] rounded-2xl border border-stone-100 overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-stone-100 cursor-pointer hover:bg-stone-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center">
                <Settings size={20} />
              </div>
              <span className="font-semibold">Profile Settings</span>
            </div>
            <ChevronRight className="text-stone-400" size={20} />
          </div>
          <div className="p-4 flex items-center justify-between border-b border-stone-100 cursor-pointer hover:bg-stone-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center">
                <Bell size={20} />
              </div>
              <span className="font-semibold">Notifications</span>
            </div>
            <ChevronRight className="text-stone-400" size={20} />
          </div>
          <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center">
                <CreditCard size={20} />
              </div>
              <span className="font-semibold">Payment Methods</span>
            </div>
            <ChevronRight className="text-stone-400" size={20} />
          </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="w-full py-4 bg-red-50 text-red-600 font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors hover:bg-red-100 active:bg-red-200"
        >
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  )
}
