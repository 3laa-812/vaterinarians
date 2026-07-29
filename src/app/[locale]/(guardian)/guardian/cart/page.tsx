'use client'

import { useGuardianCartStore } from '@/store/useGuardianCartStore'
import { useGuardianCreateOrder } from '@/hooks/useGuardian'
import { useTranslations } from 'next-intl'
import { ShoppingCart, Plus, Minus, X, Loader2, ArrowLeft, CreditCard, Clock, MapPin } from 'lucide-react'
import { useRouter } from '@/lib/i18n-navigation'
import { toast } from 'sonner'
import { useState } from 'react'

export default function GuardianCartPage() {
  const t = useTranslations('guardian')
  const router = useRouter()
  const createOrderMutation = useGuardianCreateOrder()
  const { items, updateQuantity, removeItem, clearCart, getTotal } = useGuardianCartStore()
  
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')

  const cartTotal = getTotal()
  const deliveryFee = deliveryMethod === 'delivery' ? 50 : 0
  const finalTotal = cartTotal + deliveryFee

  const handleCheckout = async () => {
    if (items.length === 0) return
    
    if (deliveryMethod === 'delivery' && !address.trim()) {
      toast.error('Please enter a delivery address')
      return
    }

    try {
      await createOrderMutation.mutateAsync({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        deliveryMethod,
        notes: deliveryMethod === 'delivery' ? `Address: ${address}\nNotes: ${notes}` : notes,
      })
      clearCart()
      toast.success(t('orderPlaced'))
      router.push('/guardian')
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.en || err.message || t('orderFailed'))
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-guardian-bg text-guardian-text pb-24">
      <div className="px-6 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-guardian-bg/90 backdrop-blur-md z-10 border-b border-stone-100">
        <button onClick={() => router.back()} className="text-guardian-text hover:bg-stone-200/50 p-2 rounded-full transition-colors">
          <ArrowLeft size={24} strokeWidth={1.5} />
        </button>
        <h1 className="text-xl font-bold text-guardian-text">Checkout</h1>
        <div className="w-10" />
      </div>

      <div className="px-6 mt-4">
        {items.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6 text-stone-400">
              <ShoppingCart size={32} />
            </div>
            <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-guardian-text-muted mb-8">Add items from the store to proceed to checkout.</p>
            <button onClick={() => router.push('/guardian/store')} className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-primary/90 transition-colors">
              Browse Store
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Order Items */}
            <div>
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.productId} className="bg-guardian-surface p-4 rounded-2xl border border-stone-100 shadow-[0_4px_20px_rgba(28,25,23,0.03)] flex justify-between items-center">
                    <div className="flex-1 mr-4">
                      <p className="font-bold text-sm text-guardian-text mb-1">{item.name}</p>
                      <p className="text-sm font-extrabold text-primary">{item.price} EGP</p>
                    </div>
                    <div className="flex items-center gap-3 bg-stone-50 p-1.5 rounded-xl border border-stone-100">
                      <button
                        onClick={() => {
                          if (item.quantity === 1) removeItem(item.productId)
                          else updateQuantity(item.productId, item.quantity - 1)
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white hover:bg-stone-100 text-guardian-text transition-colors shadow-sm"
                      >
                        {item.quantity === 1 ? <X size={16} className="text-red-500" /> : <Minus size={16} />}
                      </button>
                      <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white hover:bg-stone-100 text-guardian-text transition-colors shadow-sm"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Method */}
            <div>
              <h2 className="text-lg font-bold mb-4">Delivery Method</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                    deliveryMethod === 'pickup' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-stone-100 bg-guardian-surface text-guardian-text-muted hover:border-primary/30'
                  }`}
                >
                  <Clock size={24} />
                  <span className="font-bold text-sm">Clinic Pickup</span>
                </button>
                <button
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                    deliveryMethod === 'delivery' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-stone-100 bg-guardian-surface text-guardian-text-muted hover:border-primary/30'
                  }`}
                >
                  <MapPin size={24} />
                  <span className="font-bold text-sm">Home Delivery</span>
                </button>
              </div>
            </div>

            {/* Delivery Details */}
            {deliveryMethod === 'delivery' && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <h2 className="text-lg font-bold mb-4">Delivery Details</h2>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-guardian-text-muted ml-1">Full Address *</label>
                    <textarea 
                      placeholder="Street, Building, Apartment..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="bg-guardian-surface border border-stone-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary min-h-[80px] text-sm resize-none shadow-[0_2px_10px_rgba(28,25,23,0.02)]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-guardian-text-muted ml-1">Additional Notes</label>
                    <input 
                      type="text"
                      placeholder="Special instructions..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="bg-guardian-surface border border-stone-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm shadow-[0_2px_10px_rgba(28,25,23,0.02)]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100">
              <h2 className="font-bold mb-4">Payment Details</h2>
              <div className="space-y-3 mb-4 text-sm">
                <div className="flex justify-between text-guardian-text-muted">
                  <span>Subtotal</span>
                  <span className="font-medium text-guardian-text">{cartTotal.toFixed(2)} EGP</span>
                </div>
                {deliveryMethod === 'delivery' && (
                  <div className="flex justify-between text-guardian-text-muted">
                    <span>Delivery Fee</span>
                    <span className="font-medium text-guardian-text">{deliveryFee.toFixed(2)} EGP</span>
                  </div>
                )}
                <div className="border-t border-stone-200 pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{finalTotal.toFixed(2)} EGP</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-stone-100 text-sm font-medium text-guardian-text-muted">
                <CreditCard size={18} className="text-stone-400" />
                <span>Pay on {deliveryMethod === 'pickup' ? 'pickup' : 'delivery'}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={createOrderMutation.isPending}
              className="w-full bg-primary hover:opacity-90 text-white py-4 rounded-xl font-bold text-base transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-primary/20 sticky bottom-[5.5rem] z-20"
            >
              {createOrderMutation.isPending && <Loader2 className="animate-spin" size={18} />}
              {createOrderMutation.isPending ? t('processing') : 'Confirm Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
