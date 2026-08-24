'use client'

import { useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { useGuardianStoreProducts } from '@/hooks/useGuardian'
import { useGuardianCartStore } from '@/store/useGuardianCartStore'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/lib/i18n-navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import { ArrowRight, ShoppingCart, ShoppingBag } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'

export default function GuardianProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  const t = useTranslations('guardian')
  const router = useRouter()
  const { data, isLoading } = useGuardianStoreProducts()
  const { items, addItem } = useGuardianCartStore()
  const [qty, setQty] = useState(1)

  const product = useMemo(
    () => data?.products?.find((p) => p.id === productId),
    [data?.products, productId]
  )

  const cartItem = items.find((i) => i.productId === productId)

  if (isLoading) {
    return <div className="card pad animate-pulse" style={{ minHeight: 320 }} />
  }

  if (!product) {
    return (
      <EmptyState
        variant="guardian"
        icon={ShoppingBag}
        title={t('noProductsFound')}
        message={t('emptyCartDesc')}
        actionLabel={t('backToStore')}
        onAction={() => router.push('/guardian/store')}
      />
    )
  }

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      maxStock: product.stock,
      quantity: qty,
    })
    toast.success(t('addToCart'))
  }

  return (
    <div>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 14 }}
        onClick={() => router.push('/guardian/store')}
      >
        <ArrowRight strokeWidth={2.4} />
        {t('backToStore')}
      </button>

      <div className="grid gap-6 md:grid-cols-2">
        <div
          className="card"
          style={{
            minHeight: 320,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--sage-soft)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} fill className="object-contain p-8" />
          ) : (
            <ShoppingBag width={72} height={72} stroke="var(--olive)" strokeWidth={1.5} style={{ opacity: 0.5 }} />
          )}
        </div>

        <div>
          <span className="badge badge-sage" style={{ marginBottom: 10 }}>
            {product.category}
          </span>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--olive)', marginBottom: 8 }}>
            {product.name}
          </h2>
          <p className="num" style={{ fontSize: 22, fontWeight: 700, color: 'var(--vitality)', marginBottom: 16 }}>
            {product.price} {t('currency')}
          </p>
          <p className="muted" style={{ fontSize: 13.5, lineHeight: 2, marginBottom: 20 }}>
            {t('productDescriptionHint', { stock: product.stock })}
          </p>

          <div className="row gap12" style={{ marginBottom: 20 }}>
            <div className="qty">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                −
              </button>
              <span className="num">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
              >
                +
              </button>
            </div>
            <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={handleAdd}>
              <ShoppingCart strokeWidth={2.4} />
              {t('addToCart')}
            </button>
          </div>

          {cartItem && (
            <div className="card pad" style={{ background: 'var(--vitality-soft)', border: 'none' }}>
              <p style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--vitality)' }}>
                {t('inCartCount', { count: cartItem.quantity })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
