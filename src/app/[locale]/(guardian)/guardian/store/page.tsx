'use client'

import { useState } from 'react'
import { useGuardianStoreProducts, useGuardianCreateOrder } from '@/hooks/useGuardian'
import { useGuardianCartStore } from '@/store/useGuardianCartStore'
import { useTranslations } from 'next-intl'
import { ShoppingCart, Plus, Minus, X, Loader2, ArrowLeft, Bell, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { useRouter } from '@/lib/i18n-navigation'

export default function GuardianStorePage() {
  const t = useTranslations('guardian')
  const { data, isLoading, isError } = useGuardianStoreProducts()
  const router = useRouter()
  
  const { items, addItem, updateQuantity, clearCart, getTotal } = useGuardianCartStore()
  const [cartOpened, setCartOpened] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')

  const products = data?.products || []
  const cartTotal = getTotal()
  
  const categories = ['All', 'Food', 'Medicine', 'Toys', 'Care']
  
  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category.toLowerCase().includes(activeCategory.toLowerCase()))



  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 min-h-screen bg-guardian-bg">
        <div className="space-y-4 animate-pulse pt-20">
          <div className="h-10 bg-stone-200 rounded-xl w-1/2 mb-8"></div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-10 w-24 bg-stone-200 rounded-full shrink-0"></div>)}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="h-64 bg-stone-200 rounded-2xl"></div>
            <div className="h-64 bg-stone-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 min-h-screen bg-guardian-bg flex items-center justify-center">
        <div className="bg-guardian-surface rounded-3xl p-8 text-center border border-stone-200 shadow-sm">
          <p className="text-guardian-text-muted">Failed to load store products.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-guardian-bg text-guardian-text pb-24">
      {/* Top Navigation */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-guardian-bg/90 backdrop-blur-md z-10">
        <button className="text-guardian-text hover:bg-stone-200/50 p-2 rounded-full transition-colors">
          <ArrowLeft size={24} strokeWidth={1.5} />
        </button>
        <h1 className="text-xl font-bold text-guardian-text">VetCare Guardian</h1>
        <button className="text-guardian-text hover:bg-stone-200/50 p-2 rounded-full transition-colors relative" onClick={() => setCartOpened(true)}>
          <Bell size={24} strokeWidth={1.5} />
        </button>
      </div>

      <div className="px-6 pt-2">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-guardian-text mb-1">Vet Store</h1>
          <p className="text-guardian-text-muted text-sm">Premium care products for your companions.</p>
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${
                activeCategory === cat 
                  ? 'bg-primary border-primary text-white' 
                  : 'bg-guardian-surface border-stone-200 text-guardian-text hover:border-primary/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6 mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Recommended <span className="text-guardian-secondary">🐾</span>
          </h2>
          <button className="text-primary text-sm font-semibold">View all</button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 stagger-children animate-slide-up">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-guardian-surface rounded-2xl border border-stone-100 shadow-[0_4px_20px_rgba(28,25,23,0.03)] overflow-hidden flex flex-col"
            >
              <div className="h-32 bg-stone-100 flex items-center justify-center p-4 relative">
                {product.imageUrl ? (
                  <Image src={product.imageUrl} alt={product.name} fill className="object-cover mix-blend-multiply" />
                ) : (
                  <div className="text-stone-300">
                    <ShoppingBag size={48} strokeWidth={1} />
                  </div>
                )}
                {product.category.includes('Food') && (
                  <span className="absolute top-2 left-2 bg-guardian-secondary text-white text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ring-pulse">
                    ★ Vet-approved
                  </span>
                )}
              </div>
              
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold line-clamp-2 text-sm text-guardian-text mb-2 flex-1 leading-snug">
                  {product.name}
                </h3>

                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-extrabold text-primary">
                      {product.price} EGP
                    </span>
                    <div className="text-[10px] text-guardian-text-muted mt-0.5">/ item</div>
                  </div>
                  
                  <button
                    onClick={() => {
                      addItem({
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        maxStock: product.stock,
                      })
                      toast.success(`${product.name} ${t('addToCart')}`)
                    }}
                    className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-container transition-colors shadow-sm"
                  >
                    <Plus size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Cart Button */}
      {items.length > 0 && !cartOpened && (
        <button 
          onClick={() => setCartOpened(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform z-50 ring-pulse"
        >
          <ShoppingCart size={24} />
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-guardian-bg">
            {items.reduce((acc, item) => acc + item.quantity, 0)}
          </span>
        </button>
      )}

      {/* Cart Drawer */}
      {cartOpened && (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setCartOpened(false)} />
          <div className="bg-guardian-surface w-full max-w-[480px] mx-auto rounded-t-3xl p-6 relative z-10 max-h-[85vh] overflow-y-auto shadow-2xl pb-[env(safe-area-inset-bottom)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-guardian-text">{t('cart')}</h2>
              <button
                onClick={() => setCartOpened(false)}
                className="p-2 text-guardian-text-muted hover:text-guardian-text rounded-full bg-stone-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-5">
              {items.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                    <ShoppingCart size={28} />
                  </div>
                  <p className="text-guardian-text-muted font-medium">{t('cartEmpty')}</p>
                </div>
              ) : (
                <>
                  {items.map((item) => (
                    <div key={item.productId} className="flex justify-between items-center bg-stone-50 p-3 rounded-2xl border border-stone-100">
                      <div className="flex-1 mr-4">
                        <p className="font-semibold text-sm text-guardian-text line-clamp-1 mb-1">{item.name}</p>
                        <p className="text-xs font-bold text-primary">{item.price} EGP</p>
                      </div>
                      <div className="flex items-center gap-3 bg-white p-1 rounded-xl shadow-sm border border-stone-100">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100 hover:bg-stone-200 text-guardian-text transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100 hover:bg-stone-200 text-guardian-text transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="border-t border-stone-200 my-2" />

                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-base text-guardian-text">{t('total')}</span>
                    <span className="font-extrabold text-2xl text-primary">{cartTotal.toFixed(2)} EGP</span>
                  </div>

                  <button
                    onClick={() => {
                      setCartOpened(false)
                      router.push('/guardian/cart')
                    }}
                    className="w-full bg-primary hover:opacity-90 text-white py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20"
                  >
                    {t('checkout')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
