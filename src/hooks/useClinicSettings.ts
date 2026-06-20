import { useQuery } from '@tanstack/react-query'

export type ClinicSettings = {
  id: string
  name: string
  defaultSessionFee: number
}

export function useClinicSettings() {
  return useQuery<ClinicSettings>({
    queryKey: ['clinic-settings'],
    queryFn: async () => {
      const res = await fetch('/api/clinic/settings')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.en ?? 'Failed to fetch clinic settings')
      return json.data.clinic as ClinicSettings
    },
    staleTime: 1000 * 60 * 10,
  })
}
