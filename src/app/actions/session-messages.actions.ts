'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth' // Assuming auth is available here
import { sessionMessageService } from '@/services/session-message.service'
import { sendSessionMessageSchema } from '@/lib/validations/session-message.schema'
import { ZodError } from 'zod'
import { logger } from '@/lib/logger';

export async function sendDoctorSessionMessage(formData: FormData) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'DOCTOR' && session.user.role !== 'CLINIC_ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return { error: 'Unauthorized' }
    }

    const payload = {
      sessionId: formData.get('sessionId') as string,
      content: formData.get('content') as string,
      attachmentUrl: formData.get('attachmentUrl') as string || undefined,
    }

    const parsed = sendSessionMessageSchema.parse(payload)

    await sessionMessageService.sendMessage({
      sessionId: parsed.sessionId,
      content: parsed.content || '',
      attachmentUrl: parsed.attachmentUrl,
      fromOwner: false,
      userSession: session,
    })

    revalidatePath(`/dashboard/sessions/${parsed.sessionId}`)
    return { success: true }
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: error.issues[0]?.message || 'Validation error' }
    }
    logger.error(error)
    return { error: 'Failed to send message' }
  }
}

export async function markDoctorMessagesAsReadAction(sessionId: string) {
  try {
    const session = await auth()
    if (!session) return { error: 'Unauthorized' }
    
    // Doctor is reading owner's messages
    await sessionMessageService.markAsRead(sessionId, false)
    revalidatePath(`/dashboard/sessions/${sessionId}`)
    return { success: true }
  } catch (error) {
    logger.error(error)
    return { error: 'Failed to mark as read' }
  }
}
