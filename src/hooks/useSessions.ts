import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { SessionInput } from '@/lib/validations/session.schema'

export function useSession(appointmentId: string) {
  return useQuery({
    queryKey: ['sessions', appointmentId],
    queryFn: async () => {
      const res = await fetch(`/api/appointments/${appointmentId}/session`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.en ?? 'Failed to fetch session details')
      return json.data.appointment
    },
    enabled: !!appointmentId,
  })
}

export function useSaveSession(appointmentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: SessionInput) => {
      const res = await fetch(`/api/appointments/${appointmentId}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.en ?? 'Failed to save session')
      return json.data?.session ?? json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', appointmentId] })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['animals'] })
    },
  })
}
