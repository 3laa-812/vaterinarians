import ReportsClient from './ReportsClient'
import { OutstandingPaymentsWidget } from '@/components/home/OutstandingPaymentsWidget'

export default function ReportsPage() {
  return (
    <>
      <ReportsClient />
      <div className="max-w-6xl mx-auto px-4 md:px-6 pb-6">
        <OutstandingPaymentsWidget />
      </div>
    </>
  )
}
