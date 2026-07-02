import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'

export type DoctorListItem = {
  id: string
  name: string
  email: string
}

export function useDoctors() {
  return useQuery<DoctorListItem[]>({
    queryKey: ['doctors'],
    queryFn: () => apiClient.get<{ doctors: DoctorListItem[] }>('/api/doctors').then(res => res.doctors),
    staleTime: 1000 * 60 * 5,
  })
}
