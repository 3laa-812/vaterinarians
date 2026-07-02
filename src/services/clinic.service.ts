import { prisma } from '@/lib/db'
import { AppError, NotFoundError } from '@/lib/api/errors'
import type { Session } from 'next-auth'

export const clinicService = {
  async getSettings(session: Session) {
    if (!session.user.clinicId) {
      throw new AppError('المستخدم غير مرتبط بعيادة', 'User not associated with a clinic', 400, 'NO_CLINIC')
    }

    const clinic = await prisma.clinic.findUnique({
      where: { id: session.user.clinicId },
      select: {
        id: true,
        name: true,
        defaultSessionFee: true,
      },
    })

    if (!clinic) {
      throw new NotFoundError({ ar: 'العيادة', en: 'Clinic' })
    }

    return clinic
  },
}
