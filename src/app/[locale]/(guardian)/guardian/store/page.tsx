'use client'

import { useMemo, useState } from 'react'
import { useGuardianStoreProducts } from '@/hooks/useGuardian'
import { useGuardianCartStore } from '@/store/useGuardianCartStore'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useRouter } from '@/lib/i18n-navigation'
import { Search, Store } from 'lucide-react'
import { GuardianProductCard } from '@/components/guardian/ProductCard'

const CATEGORY_KEYS = ['all', 'food', 'medicine', 'movement_calm', 'nutritional_supplements', 'toys', 'care'] as const

const CATEGORY_MATCH: Record<(typeof CATEGORY_KEYS)[number], string[]> = {
  all: [],
  food: ['food', 'غذاء'],
  medicine: ['medicine', 'دواء'],
  movement_calm: ['movement', 'calm'],
  nutritional_supplements: ['supplement', 'مكم'],
  toys: ['toy', 'لعب'],
  care: ['care', 'عناية'],
}

export default function GuardianStorePage() {
  const t = useTranslations('guardian')
  const { data, isLoading, isError } = useGuardianStoreProducts()
  const router = useRouter()
  const { items, addItem, updateQuantity } = useGuardianCartStore()
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORY_KEYS)[number]>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const products = data?.products || []

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)

      if (activeCategory === 'all') return matchesSearch

      const needles = CATEGORY_MATCH[activeCategory]
      const hay = `${p.category} ${p.name}`.toLowerCase()
      const matchesCategory = needles.some((n) => hay.includes(n.toLowerCase()))
      return matchesSearch && matchesCategory
    })
  }, [products, activeCategory, searchQuery])

  if (isLoading) {
    return (
      <div className="grid4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card prod-card animate-pulse">
            <div className="prod-thumb bg-[var(--sage-soft)]" />
            <div className="prod-body space-y-2">
              <div className="h-4 rounded bg-[var(--line)]" />
              <div className="h-3 w-2/3 rounded bg-[var(--line)]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="empty">
        <div className="empty-icon">
          <Store strokeWidth={1.5} />
        </div>
        <h3>{t('noProductsFound')}</h3>
      </div>
    )
  }

  return (
    <div>
      <div className="row between gap12" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="input row gap8" style={{ maxWidth: 320, flex: 1 }}>
          <Search width={16} height={16} stroke="var(--ink-soft)" strokeWidth={2} />
          <input
            type="search"
            placeholder={t('searchProductsPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontFamily: 'inherit' }}
          />
        </div>
      </div>

      <div className="row gap8" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
        {CATEGORY_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={`chip${activeCategory === key ? ' active' : ''}`}
            onClick={() => setActiveCategory(key)}
          >
            {t(key)}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            <Store strokeWidth={1.5} />
          </div>
          <h3>{t('noProductsFound')}</h3>
        </div>
      ) : (
        <div className="grid4">
          {filteredProducts.map((product) => {
            const cartItem = items.find((i) => i.productId === product.id)
            return (
              <GuardianProductCard
                key={product.id}
                product={product}
                cartQuantity={cartItem?.quantity ?? 0}
                onOpen={() => router.push(`/guardian/store/${product.id}`)}
                onAdd={() => {
                  addItem({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    maxStock: product.stock,
                  })
                  toast.success(t('addToCart'))
                }}
                onIncrement={() => updateQuantity(product.id, (cartItem?.quantity ?? 0) + 1)}
                onDecrement={() => updateQuantity(product.id, (cartItem?.quantity ?? 1) - 1)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
