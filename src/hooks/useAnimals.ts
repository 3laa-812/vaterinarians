import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AnimalListItem, AnimalProfile } from '@/types'
import type { AnimalInput } from '@/lib/validations/animal.schema'

export function useAnimals() {
  return useQuery<AnimalListItem[]>({
    queryKey: ['animals'],
    queryFn: async () => {
      const res = await fetch('/api/animals')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.en ?? 'Failed to fetch animals')
      return json.data.animals as AnimalListItem[]
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useAnimalProfile(id: string) {
  return useQuery<AnimalProfile>({
    queryKey: ['animals', id],
    queryFn: async () => {
      const res = await fetch(`/api/animals/${id}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.en ?? 'Failed to fetch animal')
      return json.data.animal as AnimalProfile
    },
    enabled: !!id,
  })
}

export function useCreateAnimal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: AnimalInput) => {
      const res = await fetch('/api/animals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.en ?? 'Failed to create animal')
      return json.data?.animal ?? json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] })
    },
  })
}

export function useUpdateAnimal(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: AnimalInput) => {
      const res = await fetch(`/api/animals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.en ?? 'Failed to update animal')
      return json.data?.animal ?? json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] })
      queryClient.invalidateQueries({ queryKey: ['animals', id] })
    },
  })
}

export function useDeleteAnimal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (animalId: string) => {
      const res = await fetch(`/api/animals/${animalId}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.en ?? 'Failed to delete animal')
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] })
    },
  })
}
