import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface VaccineCatalogEntry {
  id: string
  name: string
  species: string
  isCore: boolean
  defaultIntervalDays: number | null
  description: string | null
  isActive: boolean
}

export function useVaccineCatalog() {
  return useQuery({
    queryKey: ['vaccine-catalog'],
    queryFn: async () => {
      const res = await fetch('/api/vaccine-catalog')
      if (!res.ok) throw new Error('Failed to fetch vaccine catalog')
      const json = await res.json()
      return json.data as VaccineCatalogEntry[]
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateVaccine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<VaccineCatalogEntry>) => {
      const res = await fetch('/api/vaccine-catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create vaccine')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccine-catalog'] })
    },
  })
}

export function useUpdateVaccine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<VaccineCatalogEntry> & { id: string }) => {
      const res = await fetch(`/api/vaccine-catalog/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update vaccine')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccine-catalog'] })
    },
  })
}

export function useDeleteVaccine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/vaccine-catalog/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete vaccine')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccine-catalog'] })
    },
  })
}

// Hooks for individual pet vaccinations
export interface PetVaccination {
  id: string
  petId: string
  vaccineId: string
  vaccine: VaccineCatalogEntry
  dateAdministered: string
  nextDueDate: string | null
  administeredBy: string | null
  clinicName: string | null
  manufacturer: string | null
  lotNumber: string | null
  productExpirationDate: string | null
  doseNumber: number | null
  notes: string | null
  certificateFileUrl: string | null
  status: 'overdue' | 'due_soon' | 'upcoming' | 'completed'
}

export function usePetVaccinations(petId: string) {
  return useQuery({
    queryKey: ['pet-vaccinations', petId],
    queryFn: async () => {
      const res = await fetch(`/api/animals/${petId}/vaccinations`)
      if (!res.ok) throw new Error('Failed to fetch vaccinations')
      const json = await res.json()
      return json.data as PetVaccination[]
    },
    enabled: !!petId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreatePetVaccination(petId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<PetVaccination>) => {
      const res = await fetch(`/api/animals/${petId}/vaccinations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error?.en || 'Failed to create vaccination record')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pet-vaccinations', petId] })
    },
  })
}
