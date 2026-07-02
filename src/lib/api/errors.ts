import { apiError, apiNotFound } from './response'

export class AppError extends Error {
  constructor(
    public ar: string,
    public en: string,
    public status: number,
    public code?: string,
  ) {
    super(en)
  }

  toResponse() {
    return apiError({ ar: this.ar, en: this.en, code: this.code }, this.status)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: { ar: string; en: string }) {
    super(`${resource.ar} غير موجود`, `${resource.en} not found`, 404, 'NOT_FOUND')
  }
}

export class ClinicMismatchError extends AppError {
  constructor() {
    super(
      'هذا العنصر لا ينتمي لعيادتك',
      'This resource does not belong to your clinic',
      403,
      'CLINIC_MISMATCH',
    )
  }
}
