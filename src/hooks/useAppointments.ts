import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AppointmentWithDetails } from '@/types'
import type { AppointmentInput } from '@/lib/validations/appointment.schema'

export function useAppointments(date?: string, doctorId?: string) {
  return useQuery<AppointmentWithDetails[]>({
    queryKey: ['appointments', date, doctorId],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (date) params.append('date', date)
      if (doctorId) params.append('doctorId', doctorId)

      const res = await fetch(`/api/appointments?${params.toString()}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.en ?? 'Failed to fetch appointments')
      return json.data.appointments as AppointmentWithDetails[]
    },
  })
}

export function useAppointment(id: string) {
  return useQuery<AppointmentWithDetails>({
    queryKey: ['appointments', id],
    queryFn: async () => {
      const res = await fetch(`/api/appointments/${id}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.en ?? 'Failed to fetch appointment details')
      return json.data.appointment as AppointmentWithDetails
    },
    enabled: !!id,
  })
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: AppointmentInput) => {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.en ?? 'Failed to create appointment')
      return json.data?.appointment ?? json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

export function useUpdateAppointment(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: AppointmentInput) => {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.en ?? 'Failed to update appointment')
      return json.data?.appointment ?? json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointments', id] })
    },
  })
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.en ?? 'Failed to delete appointment')
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}
