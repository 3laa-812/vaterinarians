import { getTranslations } from 'next-intl/server'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'

export default async function NewExpensePage({
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
          {t('add_expense', { defaultMessage: 'Add Expense' })}
        </h1>
        <p className="text-sm text-on-surface-variant">
          Record a new clinic expense
        </p>
      </div>

      <div className="p-5 md:p-8 max-w-2xl">
        <Card>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Title</label>
              <input type="text" className="w-full bg-surface-container rounded-xl border-none p-3 text-on-surface" placeholder="e.g. Electricity Bill" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Amount (EGP)</label>
                <input type="number" className="w-full bg-surface-container rounded-xl border-none p-3 text-on-surface" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Date</label>
                <input type="date" className="w-full bg-surface-container rounded-xl border-none p-3 text-on-surface" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Category</label>
              <select className="w-full bg-surface-container rounded-xl border-none p-3 text-on-surface">
                <option value="UTILITIES">Utilities</option>
                <option value="SUPPLIES">Medical Supplies</option>
                <option value="RENT">Rent</option>
                <option value="MARKETING">Marketing</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="button">Save Expense</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
