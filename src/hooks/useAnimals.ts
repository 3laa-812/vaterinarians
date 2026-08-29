import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AnimalListItem, AnimalProfile, AnimalsResponse } from '@/types'
import type { AnimalInput } from '@/lib/validations/animal.schema'
import { apiClient } from '@/lib/api/client'

export function useAnimals(page = 1, limit = 20) {
  return useQuery<AnimalsResponse>({
    queryKey: ['animals', page, limit],
    queryFn: () => apiClient.get<AnimalsResponse>(`/api/animals?page=${page}&limit=${limit}`),
    staleTime: 1000 * 60 * 5,
  })
}

export function useAnimalProfile(id: string) {
  return useQuery<AnimalProfile>({
    queryKey: ['animals', id],
    queryFn: () => apiClient.get<{ animal: AnimalProfile }>(`/api/animals/${id}`).then(res => res.animal),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateAnimal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AnimalInput) => apiClient.post<{ animal: AnimalProfile }>('/api/animals', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] })
    },
  })
}

export function useUpdateAnimal(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AnimalInput) => apiClient.put<{ animal: AnimalProfile }>(`/api/animals/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] })
      queryClient.invalidateQueries({ queryKey: ['animals', id] })
    },
  })
}

export function useDeleteAnimal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (animalId: string) => apiClient.delete<{ success: true }>(`/api/animals/${animalId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] })
    },
  })
}
