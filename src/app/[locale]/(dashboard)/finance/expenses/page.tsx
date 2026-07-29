import { getTranslations } from 'next-intl/server'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function ExpensesPage({
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
      <div className="bg-mesh border-b border-outline-variant px-5 py-5 md:px-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">
            {t('expenses', { defaultMessage: 'Expenses' })}
          </h1>
          <p className="text-sm text-on-surface-variant">
            Manage your clinic expenses
          </p>
        </div>
        <Link href={`/${locale}/finance/expenses/new`}>
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            Add Expense
          </Button>
        </Link>
      </div>

      <div className="p-5 md:p-8">
        <Card>
          <p className="text-on-surface-variant">Expense list will be implemented here.</p>
        </Card>
      </div>
    </div>
  )
}
