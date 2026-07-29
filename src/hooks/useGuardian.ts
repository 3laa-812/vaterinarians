import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { guardianApiClient } from '@/lib/api/guardian-client'
import type { AnimalListItem } from '@/types'

export type GuardianProduct = {
  id: string
  name: string
  price: number
  stock: number
  category: string
  imageUrl?: string | null
}

export type GuardianOrder = {
  id: string
  orderNumber: string
  totalAmount: number
  status: string
  deliveryMethod: string
  createdAt: string
  items?: any[]
}

export function useGuardianPets() {
  return useQuery<{ animals: AnimalListItem[] }>({
    queryKey: ['guardian', 'pets'],
    queryFn: () => guardianApiClient.get<{ animals: AnimalListItem[] }>('/api/guardian/animals'),
    staleTime: 1000 * 60 * 5,
  })
}

export function useGuardianPet(id: string) {
  return useQuery<{ animal: any }>({
    queryKey: ['guardian', 'pets', id],
    queryFn: () => guardianApiClient.get<{ animal: any }>(`/api/guardian/animals/${id}`),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useGuardianPetVaccinations(id: string) {
  return useQuery<{ vaccinations: any[] }>({
    queryKey: ['guardian', 'pets', id, 'vaccinations'],
    queryFn: () => guardianApiClient.get<{ vaccinations: any[] }>(`/api/guardian/animals/${id}/vaccinations`),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useGuardianStoreProducts() {
  return useQuery<{ products: GuardianProduct[] }>({
    queryKey: ['guardian', 'store', 'products'],
    queryFn: () => guardianApiClient.get<{ products: GuardianProduct[] }>('/api/guardian/store/products'),
    staleTime: 1000 * 60 * 5,
  })
}

export function useGuardianOrders() {
  return useQuery<{ orders: GuardianOrder[] }>({
    queryKey: ['guardian', 'store', 'orders'],
    queryFn: () => guardianApiClient.get<{ orders: GuardianOrder[] }>('/api/guardian/store/orders'),
  })
}

export function useGuardianCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { items: { productId: string; quantity: number }[]; deliveryMethod: 'pickup' | 'delivery'; deliveryFee?: number; notes?: string }) =>
      guardianApiClient.post<{ order: GuardianOrder }>('/api/guardian/store/orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardian', 'store', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['guardian', 'store', 'products'] })
    },
  })
}
