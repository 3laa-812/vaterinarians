'use client'

import { useGuardianOrders } from '@/hooks/useGuardian'
import { useParams } from 'next/navigation'
import { useRouter } from '@/lib/i18n-navigation'
import { ArrowLeft, Package, Clock, CheckCircle2, ShoppingBag, MapPin } from 'lucide-react'
import Image from 'next/image'

export default function OrderTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  // Note: we can use a specific order fetch hook in the future, 
  // but for now filtering from the main list is fine if it's cached.
  const { data, isLoading, isError } = useGuardianOrders()
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-guardian-bg p-6 flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-stone-200 rounded-full mb-4" />
          <div className="w-32 h-6 bg-stone-200 rounded mb-2" />
        </div>
      </div>
    )
  }

  const order = data?.orders?.find(o => o.id === id)

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-guardian-bg p-6 flex flex-col items-center justify-center">
        <p className="text-guardian-text-muted mb-4">Order not found.</p>
        <button onClick={() => router.back()} className="text-primary font-bold">Go Back</button>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'text-amber-500 bg-amber-50 border-amber-200'
      case 'PROCESSING': return 'text-blue-500 bg-blue-50 border-blue-200'
      case 'READY': return 'text-indigo-500 bg-indigo-50 border-indigo-200'
      case 'COMPLETED': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
      case 'CANCELLED': return 'text-red-500 bg-red-50 border-red-200'
      default: return 'text-stone-500 bg-stone-50 border-stone-200'
    }
  }

  return (
    <div className="min-h-screen bg-guardian-bg text-guardian-text pb-24">
      {/* Top Navigation */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-guardian-bg/90 backdrop-blur-md z-10">
        <button onClick={() => router.back()} className="text-guardian-text hover:bg-stone-200/50 p-2 rounded-full transition-colors">
          <ArrowLeft size={24} strokeWidth={1.5} />
        </button>
        <h1 className="text-xl font-bold text-guardian-text">Order Tracking</h1>
        <div className="w-10" />
      </div>

      <div className="px-6 mt-4 space-y-6">
        {/* Order Header */}
        <div className="bg-guardian-surface rounded-3xl p-6 shadow-[0_4px_20px_rgba(28,25,23,0.03)] border border-stone-100 flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border ${getStatusColor(order.status)}`}>
            {order.status === 'COMPLETED' ? <CheckCircle2 size={32} /> : <Package size={32} />}
          </div>
          <h2 className="text-2xl font-bold mb-1">#{order.orderNumber}</h2>
          <p className="text-guardian-text-muted text-sm mb-4">
            Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>

        {/* Delivery Info */}
        <div className="bg-guardian-surface rounded-2xl p-5 shadow-[0_4px_20px_rgba(28,25,23,0.03)] border border-stone-100">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            {order.deliveryMethod === 'delivery' ? <MapPin size={18} className="text-primary" /> : <Clock size={18} className="text-primary" />}
            {order.deliveryMethod === 'delivery' ? 'Delivery Details' : 'Pickup Details'}
          </h3>
          <p className="text-sm text-guardian-text-muted">
            {order.deliveryMethod === 'delivery' ? 'Your order will be delivered to the address provided.' : 'Your order is ready to be picked up from our clinic.'}
          </p>
        </div>

        {/* Order Items */}
        <div className="bg-guardian-surface rounded-2xl p-5 shadow-[0_4px_20px_rgba(28,25,23,0.03)] border border-stone-100">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <ShoppingBag size={18} className="text-primary" />
            Order Items
          </h3>
          
          <div className="space-y-4">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between pb-4 border-b border-stone-100 last:border-0 last:pb-0">
                <div className="flex-1">
                  <p className="font-semibold text-sm text-guardian-text mb-1">{item.product.name}</p>
                  <p className="text-xs text-guardian-text-muted">Qty: {item.quantity} × {item.unitPrice} EGP</p>
                </div>
                <div className="font-bold text-sm text-primary">
                  {(item.quantity * item.unitPrice).toFixed(2)} EGP
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-100 mt-4 pt-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-guardian-text">Total</span>
              <span className="font-extrabold text-xl text-primary">{order.totalAmount} EGP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
