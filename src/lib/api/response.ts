import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

type LocalizedMessage = { ar: string; en: string; code?: string }

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status })
}

export function apiError(error: LocalizedMessage, status: number) {
  return NextResponse.json({ error }, { status })
}

export function apiUnauthorized() {
  return apiError(
    { ar: 'يجب تسجيل الدخول أولاً', en: 'Please sign in first', code: 'UNAUTHENTICATED' },
    401,
  )
}

export function apiForbidden() {
  return apiError(
    { ar: 'غير مصرح لك بهذا الإجراء', en: 'You are not authorized for this action', code: 'FORBIDDEN' },
    403,
  )
}

export function apiNotFound(resource: { ar: string; en: string }) {
  return apiError(
    { ar: `${resource.ar} غير موجود`, en: `${resource.en} not found`, code: 'NOT_FOUND' },
    404,
  )
}

export function apiValidationError(error: ZodError) {
  const fieldErrors = error.flatten().fieldErrors
  return apiError(
    {
      ar: 'البيانات المدخلة غير صحيحة',
      en: 'Invalid input',
      code: 'VALIDATION_ERROR',
    },
    400,
  )
}

export function apiServerError(context: string) {
  return apiError(
    { ar: 'حدث خطأ، حاول مرة أخرى', en: 'Something went wrong', code: 'SERVER_ERROR' },
    500,
  )
}
