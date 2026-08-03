import { GuardianBottomNav } from './GuardianBottomNav'

export default function GuardianLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="guardian-theme relative mx-auto min-h-[100dvh] w-full bg-guardian-bg text-guardian-text">
      <div className="pb-[80px] min-h-[100dvh]">
        {children}
      </div>
      <div className="relative mx-auto w-full">
        <GuardianBottomNav />
      </div>
    </div>
  )
}
