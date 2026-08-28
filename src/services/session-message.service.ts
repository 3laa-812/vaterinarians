import { prisma } from '@/lib/db'
import { clinicScope } from '@/lib/scope'
import { NotFoundError, AppError } from '@/lib/api/errors'
import type { Session } from 'next-auth'

export const sessionMessageService = {
  /**
   * Fetch all messages for a specific session.
   * Can be used by both the doctor and the owner (if they have valid session/token).
   */
  async getMessagesBySessionId(sessionId: string, userSession?: Session, ownerId?: string) {
    // Basic verification that the session exists and belongs to the right context
    const sessionRecord = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        appointment: {
          include: {
            animal: true
          }
        }
      }
    })

    if (!sessionRecord) throw new NotFoundError({ ar: 'الجلسة', en: 'Session' })

    // Validate access
    if (userSession) {
      // Doctor/Admin context
      const scope = clinicScope(userSession)
      if (sessionRecord.appointment.animal.clinicId !== scope.clinicId) {
        throw new AppError('غير مصرح لك', 'Unauthorized', 403, 'UNAUTHORIZED')
      }
    } else if (ownerId) {
      // Owner context
      if (sessionRecord.appointment.animal.ownerId !== ownerId) {
        throw new AppError('غير مصرح لك', 'Unauthorized', 403, 'UNAUTHORIZED')
      }
    } else {
      throw new AppError('غير مصرح لك', 'Unauthorized', 403, 'UNAUTHORIZED')
    }

    return prisma.sessionMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    })
  },

  /**
   * Send a message in a session thread.
   */
  async sendMessage(params: {
    sessionId: string
    content: string
    attachmentUrl?: string | null
    fromOwner: boolean
    userSession?: Session // if sent by doctor
    ownerId?: string      // if sent by owner
  }) {
    const { sessionId, content, attachmentUrl, fromOwner, userSession, ownerId } = params

    // Access control
    const sessionRecord = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        appointment: {
          include: { animal: true }
        }
      }
    })

    if (!sessionRecord) throw new NotFoundError({ ar: 'الجلسة', en: 'Session' })

    if (fromOwner) {
      if (!ownerId || sessionRecord.appointment.animal.ownerId !== ownerId) {
        throw new AppError('غير مصرح لك', 'Unauthorized', 403, 'UNAUTHORIZED')
      }
    } else {
      if (!userSession) throw new AppError('غير مصرح لك', 'Unauthorized', 403, 'UNAUTHORIZED')
      const scope = clinicScope(userSession)
      if (sessionRecord.appointment.animal.clinicId !== scope.clinicId) {
        throw new AppError('غير مصرح لك', 'Unauthorized', 403, 'UNAUTHORIZED')
      }
    }

    return prisma.sessionMessage.create({
      data: {
        sessionId,
        content,
        attachmentUrl: attachmentUrl || null,
        fromOwner,
      }
    })
  },

  /**
   * Mark messages as read.
   */
  async markAsRead(sessionId: string, readingAsOwner: boolean) {
    return prisma.sessionMessage.updateMany({
      where: {
        sessionId,
        fromOwner: !readingAsOwner, // If owner is reading, mark doctor's messages as read. And vice versa.
        readAt: null
      },
      data: {
        readAt: new Date()
      }
    })
  }
}
