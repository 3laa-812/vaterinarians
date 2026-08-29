import { auth } from '@/lib/auth'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import type { Session } from 'next-auth'
import { apiUnauthorized, apiForbidden, apiValidationError, apiServerError } from './response'
import { AppError } from './errors'
import { logger } from '@/lib/logger'

type RouteContext<TParams = Record<string, string>> = {
  session: Session
  params: TParams
}

type RouteHandler<TParams> = (req: Request, ctx: RouteContext<TParams>) => Promise<Response>

export function withAuth<TParams = Record<string, string>>(
  handler: RouteHandler<TParams>,
  options?: { roles?: string[] },
) {
  return async (req: Request, routeParams?: { params: Promise<TParams> }) => {
    const session = await auth()
    if (!session?.user) return apiUnauthorized()

    if (options?.roles && !options.roles.includes(session.user.role)) {
      return apiForbidden()
    }

    const params = routeParams ? await routeParams.params : ({} as TParams)

    try {
      return await handler(req, { session, params })
    } catch (error) {
      if (error instanceof ZodError) return apiValidationError(error)
      if (error instanceof AppError) return error.toResponse()
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          return new AppError(
            'لا يمكن الحذف بسبب وجود بيانات مرتبطة. يرجى أرشفة السجل بدلاً من ذلك.',
            'Cannot delete due to related records. Please archive instead.',
            400,
            'FOREIGN_KEY_VIOLATION'
          ).toResponse()
        }
      }

      logger.error('[API Error]', error)
      return apiServerError('unhandled')
    }
  }
}

