import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ClinicCreateInput, DoctorCreateInput } from '@/lib/validations/admin.schema'

export function useAdmin() {
  const queryClient = useQueryClient()

  const useGetClinics = (enabled = false) =>
    useQuery({
      queryKey: ['admin-clinics'],
      queryFn: async () => {
        const res = await fetch('/api/admin/clinics')
        if (!res.ok) throw new Error('Failed to fetch clinics')
        return res.json()
      },
      enabled,
    })

  const useCreateClinic = () =>
    useMutation({
      mutationFn: async (data: ClinicCreateInput) => {
        const res = await fetch('/api/admin/clinics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error?.en || 'Failed to create clinic')
        }
        return res.json()
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-clinics'] })
      },
    })

  const useGetDoctors = () =>
    useQuery({
      queryKey: ['admin-doctors'],
      queryFn: async () => {
        const res = await fetch('/api/admin/doctors')
        if (!res.ok) throw new Error('Failed to fetch doctors')
        return res.json()
      },
    })

  const useCreateDoctor = () =>
    useMutation({
      mutationFn: async (data: DoctorCreateInput) => {
        const res = await fetch('/api/admin/doctors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error?.en || 'Failed to create doctor')
        }
        return res.json()
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-doctors'] })
        queryClient.invalidateQueries({ queryKey: ['doctors'] })
      },
    })

  return {
    useGetClinics,
    useCreateClinic,
    useGetDoctors,
    useCreateDoctor,
  }
}
