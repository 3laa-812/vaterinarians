import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'

export type ClinicSettings = {
  id: string
  name: string
  defaultSessionFee: number
}

export function useClinicSettings() {
  return useQuery<ClinicSettings>({
    queryKey: ['clinic-settings'],
    queryFn: () => apiClient.get<{ clinic: ClinicSettings }>('/api/clinic/settings').then(res => res.clinic),
    staleTime: 1000 * 60 * 10,
  })
}
