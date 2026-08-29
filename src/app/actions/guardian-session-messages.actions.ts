'use server'

import { revalidatePath } from 'next/cache'
import { sessionMessageService } from '@/services/session-message.service'
import { sendSessionMessageSchema } from '@/lib/validations/session-message.schema'
import { ZodError } from 'zod'
import { auth } from '@/lib/auth'
import { logger } from '@/lib/logger';

export async function sendGuardianSessionMessage(formData: FormData) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'GUARDIAN') {
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
      fromOwner: true,
      ownerId: session.user.id!,
    })

    revalidatePath(`/guardian/animals`)
    return { success: true }
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: error.issues[0]?.message || 'Validation error' }
    }
    logger.error(error)
    return { error: 'Failed to send message' }
  }
}

export async function markGuardianMessagesAsReadAction(sessionId: string) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'GUARDIAN') return { error: 'Unauthorized' }
    
    // Guardian is reading doctor's messages
    await sessionMessageService.markAsRead(sessionId, true)
    revalidatePath(`/guardian/animals`)
    return { success: true }
  } catch (error) {
    logger.error(error)
    return { error: 'Failed to mark as read' }
  }
}
