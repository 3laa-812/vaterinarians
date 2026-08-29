import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AppointmentWithDetails } from '@/types'
import type { AppointmentInput } from '@/lib/validations/appointment.schema'
import { apiClient } from '@/lib/api/client'

export function useAppointments(date?: string, doctorId?: string) {
  return useQuery<AppointmentWithDetails[]>({
    queryKey: ['appointments', date, doctorId],
    queryFn: () => {
      const params = new URLSearchParams()
      if (date) params.append('date', date)
      if (doctorId) params.append('doctorId', doctorId)

      return apiClient.get<{ appointments: AppointmentWithDetails[] }>(`/api/appointments?${params.toString()}`).then(res => res.appointments)
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useAppointment(id: string) {
  return useQuery<AppointmentWithDetails>({
    queryKey: ['appointments', id],
    queryFn: () => apiClient.get<{ appointment: AppointmentWithDetails }>(`/api/appointments/${id}`).then(res => res.appointment),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AppointmentInput) => apiClient.post<{ appointment: AppointmentWithDetails }>('/api/appointments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

export function useUpdateAppointment(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AppointmentInput) => apiClient.put<{ appointment: AppointmentWithDetails }>(`/api/appointments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointments', id] })
    },
  })
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (appointmentId: string) => apiClient.delete<{ success: true }>(`/api/appointments/${appointmentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}
