import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { OwnerInput } from '@/lib/validations/owner.schema'

export type OwnerListItem = {
  id: string
  name: string
  phone: string
  email: string | null
  address: string | null
  notes: string | null
  animals: { id: string; name: string; species: string }[]
}

export function useOwners(search: string = '') {
  return useQuery<OwnerListItem[]>({
    queryKey: ['owners', search],
    queryFn: async () => {
      const url = search ? `/api/owners?search=${encodeURIComponent(search)}` : '/api/owners'
      const res = await fetch(url)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.en ?? 'Failed to fetch owners')
      return json.data.owners as OwnerListItem[]
    },
  })
}

export function useOwnerDetails(id: string) {
  return useQuery<OwnerListItem>({
    queryKey: ['owners', id],
    queryFn: async () => {
      const res = await fetch(`/api/owners/${id}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.en ?? 'Failed to fetch owner details')
      return json.data.owner as OwnerListItem
    },
    enabled: !!id,
  })
}

export function useCreateOwner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: OwnerInput) => {
      const res = await fetch('/api/owners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.en ?? 'Failed to create owner')
      return json.data?.owner ?? json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] })
    },
  })
}

export function useUpdateOwner(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: OwnerInput) => {
      const res = await fetch(`/api/owners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.en ?? 'Failed to update owner')
      return json.data?.owner ?? json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] })
      queryClient.invalidateQueries({ queryKey: ['owners', id] })
    },
  })
}

export function useDeleteOwner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ownerId: string) => {
      const res = await fetch(`/api/owners/${ownerId}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.en ?? 'Failed to delete owner')
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] })
    },
  })
}
