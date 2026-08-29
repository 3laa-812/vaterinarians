'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ShoppingBag, FileText, Plus, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import type { GuardianProduct } from '@/hooks/useGuardian'

type GuardianProductCardProps = {
  product: GuardianProduct
  cartQuantity?: number
  onOpen: () => void
  onAdd: () => void
  onIncrement: () => void
  onDecrement: () => void
}

export function GuardianProductCard({
  product,
  cartQuantity = 0,
  onOpen,
  onAdd,
  onIncrement,
  onDecrement,
}: GuardianProductCardProps) {
  const t = useTranslations('guardian')
  const isRx = product.category.toLowerCase().includes('medicine')

  return (
    <article
      className="card prod-card"
      onClick={onOpen}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
      role="button"
      tabIndex={0}
    >
      <div className="prod-thumb relative"
        style={{ background: isRx ? 'var(--tan-soft)' : 'var(--sage-soft)' }}
      >
        {isRx && (
          <span className="badge badge-sage absolute top-2.5 end-2.5 z-10">
            <FileText strokeWidth={2.4} />
            {t('prescription')}
          </span>
        )}
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain p-4"
          />
        ) : (
          <ShoppingBag strokeWidth={1.5} className="text-[var(--olive)]" />
        )}
      </div>
      <div className="prod-body">
        <div className="prod-name line-clamp-2">{product.name}</div>
        <div className="prod-cat">{product.category}</div>
        <div className="row between gap8">
          <span className="prod-price num">
            {product.price} {t('currency')}
          </span>
          <AnimatePresence mode="popLayout">
            {cartQuantity === 0 ? (
              <motion.button
                key="add"
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="btn btn-soft btn-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onAdd()
                }}
              >
                <Plus strokeWidth={2.4} />
              </motion.button>
            ) : (
              <motion.div
                key="qty"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="qty"
                onClick={(e) => e.stopPropagation()}
              >
                <button type="button" onClick={onDecrement}>
                  <Minus strokeWidth={2.4} />
                </button>
                <span className="num">{cartQuantity}</span>
                <button type="button" onClick={onIncrement}>
                  <Plus strokeWidth={2.4} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </article>
  )
}
