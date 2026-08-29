import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ClinicCreateInput, DoctorCreateInput } from '@/lib/validations/admin.schema'
import { apiClient } from '@/lib/api/client'
import type { Clinic, User } from '@prisma/client'

export function useAdminClinics(enabled = false) {
  return useQuery({
    queryKey: ['admin-clinics'],
    queryFn: () => apiClient.get<{ clinics: Clinic[] }>('/api/admin/clinics').then(res => res.clinics),
    enabled,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateClinic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ClinicCreateInput) => apiClient.post<{ clinic: Clinic }>('/api/admin/clinics', data).then(res => res.clinic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clinics'] })
    },
  })
}

export function useAdminDoctors() {
  return useQuery({
    queryKey: ['admin-doctors'],
    queryFn: () => apiClient.get<{ doctors: User[] }>('/api/admin/doctors').then(res => res.doctors),
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateDoctor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DoctorCreateInput) => apiClient.post<{ doctor: User }>('/api/admin/doctors', data).then(res => res.doctor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] })
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
    },
  })
}
