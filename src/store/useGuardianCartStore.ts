import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  productId: string
  name: string
  nameAr?: string | null
  price: number
  imageUrl?: string | null
  quantity: number
  maxStock: number
}

interface GuardianCartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useGuardianCartStore = create<GuardianCartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const currentItems = get().items
        const existingIndex = currentItems.findIndex((i) => i.productId === newItem.productId)
        const qtyToAdd = newItem.quantity ?? 1

        if (existingIndex > -1) {
          const existing = currentItems[existingIndex]
          const updatedQty = Math.min(existing.quantity + qtyToAdd, newItem.maxStock)
          const updatedItems = [...currentItems]
          updatedItems[existingIndex] = { ...existing, quantity: updatedQty }
          set({ items: updatedItems })
        } else {
          set({
            items: [
              ...currentItems,
              {
                ...newItem,
                quantity: Math.min(qtyToAdd, newItem.maxStock),
              },
            ],
          })
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) })
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity: Math.min(quantity, i.maxStock) } : i,
          ),
        })
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'guardian_cart_storage',
    },
  ),
)
