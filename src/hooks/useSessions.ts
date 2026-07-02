import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { SessionInput } from '@/lib/validations/session.schema'
import type { Appointment } from '@prisma/client'
import { apiClient } from '@/lib/api/client'

type SaveSessionResult = {
  session: unknown
  payment: unknown
  nextAppointment: Appointment | null
}

export function useSession(appointmentId: string) {
  return useQuery({
    queryKey: ['sessions', appointmentId],
    queryFn: () => apiClient.get<{ appointment: any }>(`/api/appointments/${appointmentId}/session`).then(res => res.appointment),
    enabled: !!appointmentId,
  })
}

export function useSaveSession(appointmentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SessionInput) => apiClient.post<SaveSessionResult>(`/api/appointments/${appointmentId}/session`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', appointmentId] })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['animals'] })
    },
  })
}
