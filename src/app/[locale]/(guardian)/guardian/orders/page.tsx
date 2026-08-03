'use client'

import { useGuardianOrders } from '@/hooks/useGuardian'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/lib/i18n-navigation'
import { CheckCircle2, Package, Clock, ChevronRight } from 'lucide-react'

export default function GuardianOrdersPage() {
  const t = useTranslations('guardian')
  const router = useRouter()
  const { data, isLoading } = useGuardianOrders()

  const orders = data?.orders || []

  return (
    <div className="flex flex-col min-h-screen bg-guardian-bg text-guardian-text pb-24">
      <div className="px-6 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-guardian-bg/80 backdrop-blur-md z-10">
        <h1 className="text-2xl font-bold text-guardian-text">My Orders</h1>
      </div>

      <div className="px-6 mt-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4 stagger-children animate-slide-up">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-guardian-surface shadow-[0_4px_20px_rgba(28,25,23,0.05)] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-guardian-surface shadow-[0_4px_20px_rgba(28,25,23,0.05)] rounded-2xl p-10 text-center border border-stone-100 flex flex-col items-center">
            <Package className="text-stone-300 mb-4" size={48} />
            <p className="text-stone-500 font-medium">You have no orders yet.</p>
            <button 
              onClick={() => router.push('/guardian/store')}
              className="mt-6 px-6 py-2 bg-primary text-white rounded-full font-bold shadow-sm"
            >
              Go to Store
            </button>
          </div>
        ) : (
          <div className="space-y-4 stagger-children animate-slide-up">
            {orders.map((order: any) => (
              <div 
                key={order.id} 
                onClick={() => router.push(`/guardian/orders/${order.id}`)}
                className="bg-guardian-surface shadow-[0_4px_20px_rgba(28,25,23,0.05)] rounded-2xl p-5 border border-stone-100 cursor-pointer transition-transform hover:scale-[1.01] active:scale-95"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    order.status === 'DELIVERED' || order.status === 'COMPLETED' || order.status === 'READY'
                      ? 'bg-emerald-100 text-emerald-700 ring-pulse' 
                      : 'bg-guardian-secondary/10 text-guardian-secondary'
                  }`}>
                  {order.status === 'DELIVERED' || order.status === 'COMPLETED' ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <Clock size={14} />
                  )}
                  <span>{order.status}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">#{order.orderNumber}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-end border-t border-stone-100 pt-4">
                <div>
                  <p className="text-xs text-stone-500 mb-1">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="font-bold text-lg text-primary">{order.totalAmount} EGP</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400">
                  <ChevronRight size={18} />
                </div>
              </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
