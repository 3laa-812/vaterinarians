import { z } from 'zod'

export const sendSessionMessageSchema = z.object({
  sessionId: z.string().min(1),
  content: z.string().optional().or(z.literal('')),
  attachmentUrl: z.string().url().optional().or(z.literal('')),
})

export type SendSessionMessageInput = z.infer<typeof sendSessionMessageSchema>
