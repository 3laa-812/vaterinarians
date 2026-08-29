import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { OwnerInput } from '@/lib/validations/owner.schema'
import type { OwnerListItem, OwnerProfile, OwnersResponse } from '@/types'
import { apiClient } from '@/lib/api/client'

export function useOwners(search: string = '', page = 1, limit = 20) {
  return useQuery<OwnersResponse>({
    queryKey: ['owners', search, page, limit],
    queryFn: () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      params.set('page', String(page))
      params.set('limit', String(limit))

      return apiClient.get<OwnersResponse>(`/api/owners?${params.toString()}`)
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useOwnerDetails(id: string) {
  return useQuery<OwnerProfile>({ // Using OwnerProfile for detailed view
    queryKey: ['owners', id],
    queryFn: () => apiClient.get<{ owner: OwnerProfile }>(`/api/owners/${id}`).then(res => res.owner),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateOwner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: OwnerInput) => apiClient.post<{ owner: OwnerListItem, qrToken: string | null, isExisting?: boolean }>('/api/owners', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] })
    },
  })
}

export function useUpdateOwner(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: OwnerInput) => apiClient.put<{ owner: OwnerListItem }>(`/api/owners/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] })
      queryClient.invalidateQueries({ queryKey: ['owners', id] })
    },
  })
}

export function useDeleteOwner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ownerId: string) => apiClient.delete<{ success: true }>(`/api/owners/${ownerId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] })
    },
  })
}

export function useRegenerateQRToken(id: string) {
  return useMutation({
    mutationFn: () => apiClient.post<{ qrToken: string }>(`/api/owners/${id}/qr`, {}),
  })
}
