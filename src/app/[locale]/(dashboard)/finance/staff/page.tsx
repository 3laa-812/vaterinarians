import { getTranslations } from 'next-intl/server'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card } from '@/components/shared/Card'

export default async function StaffPayrollPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth()
  if (!session) redirect(`/${locale}/login`)

  const t = await getTranslations('finance')

  return (
    <div className="min-h-screen pb-10">
      <div className="bg-mesh border-b border-outline-variant px-5 py-5 md:px-8">
        <h1 className="text-2xl font-bold text-on-surface">
          {t('payroll', { defaultMessage: 'Staff & Payroll' })}
        </h1>
        <p className="text-sm text-on-surface-variant">
          Manage staff members, base salaries, and advances
        </p>
      </div>

      <div className="p-5 md:p-8">
        <Card>
          <p className="text-on-surface-variant">Staff listing and payroll interface will be implemented here.</p>
        </Card>
      </div>
    </div>
  )
}
