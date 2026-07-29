import { apiClient, ApiRequestError } from './client'

function getGuardianToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('guardian_token')
}

async function guardianRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getGuardianToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(url, { ...options, headers })
  const json = await res.json()

  if (!res.ok) {
    throw new ApiRequestError(json.error || { ar: 'خطأ غير متوقع', en: 'Unexpected error' }, res.status)
  }

  return json.data as T
}

export const guardianApiClient = {
  get: <T>(url: string) => guardianRequest<T>(url),
  post: <T>(url: string, body: unknown) =>
    guardianRequest<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(url: string, body: unknown) =>
    guardianRequest<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(url: string) => guardianRequest<T>(url, { method: 'DELETE' }),
}
