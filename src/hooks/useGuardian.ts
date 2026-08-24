import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type { GuardianAnimal } from '@/types'

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

export type GuardianDoctor = {
  id: string
  name: string
}

export function useGuardianDoctors() {
  return useQuery<{ doctors: GuardianDoctor[] }>({
    queryKey: ['guardian', 'doctors'],
    queryFn: () => apiClient.get<{ doctors: GuardianDoctor[] }>('/api/guardian/doctors'),
    staleTime: 1000 * 60 * 5,
  })
}

export function useGuardianPets() {
  return useQuery<{ animals: GuardianAnimal[] }>({
    queryKey: ['guardian', 'pets'],
    queryFn: () => apiClient.get<{ animals: GuardianAnimal[] }>('/api/guardian/animals'),
    staleTime: 1000 * 60 * 5,
  })
}

export function useGuardianPet(id: string) {
  return useQuery<{ animal: any }>({
    queryKey: ['guardian', 'pets', id],
    queryFn: () => apiClient.get<{ animal: any }>(`/api/guardian/animals/${id}`),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useGuardianPetVaccinations(id: string) {
  return useQuery<{ vaccinations: any[] }>({
    queryKey: ['guardian', 'pets', id, 'vaccinations'],
    queryFn: () => apiClient.get<{ vaccinations: any[] }>(`/api/guardian/animals/${id}/vaccinations`),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useGuardianStoreProducts() {
  return useQuery<{ products: GuardianProduct[] }>({
    queryKey: ['guardian', 'store', 'products'],
    queryFn: () => apiClient.get<{ products: GuardianProduct[] }>('/api/guardian/store/products'),
    staleTime: 1000 * 60 * 5,
  })
}

export function useGuardianOrders() {
  return useQuery<{ orders: GuardianOrder[] }>({
    queryKey: ['guardian', 'store', 'orders'],
    queryFn: () => apiClient.get<{ orders: GuardianOrder[] }>('/api/guardian/store/orders'),
  })
}

export type GuardianAppointment = {
  id: string
  scheduledAt: string
  notes: string | null
  doctor: GuardianDoctor
}

export function useGuardianCreateAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { animalId: string; scheduledAt: string; doctorId?: string; notes?: string }) =>
      apiClient.post<{ appointment: GuardianAppointment }>('/api/guardian/appointments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardian', 'pets'] })
    },
  })
}

export function useGuardianCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { items: { productId: string; quantity: number }[]; deliveryMethod: 'pickup' | 'delivery'; deliveryFee?: number; notes?: string }) =>
      apiClient.post<{ order: GuardianOrder }>('/api/guardian/store/orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardian', 'store', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['guardian', 'store', 'products'] })
    },
  })
}

export function useGuardianOrder(id: string) {
  return useQuery<{ order: GuardianOrder }>({
    queryKey: ['guardian', 'store', 'orders', id],
    queryFn: () => apiClient.get<{ order: GuardianOrder }>(`/api/guardian/orders/${id}`),
    enabled: !!id,
  })
}

export function useGuardianCreateAnimal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      name: string
      species: string
      breed?: string
      gender?: 'MALE' | 'FEMALE' | null
      birthDate?: string | null
      color?: string
      notes?: string
    }) => apiClient.post<{ animal: GuardianAnimal }>('/api/guardian/animals', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardian', 'pets'] })
    },
  })
}


export type GuardianAccount = {
  name: string
  phone: string
  apptReminder: boolean
  orderUpdate: boolean
  vaccineReminder: boolean
}

export function useGuardianAccount() {
  return useQuery<{ account: GuardianAccount }>({
    queryKey: ['guardian', 'account'],
    queryFn: () => apiClient.get<{ account: GuardianAccount }>('/api/guardian/account'),
  })
}

export function useUpdateGuardianAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<GuardianAccount>) =>
      apiClient.patch<{ account: GuardianAccount }>('/api/guardian/account', data),
    onSuccess: (data) => {
      queryClient.setQueryData(['guardian', 'account'], data)
    },
  })
}
