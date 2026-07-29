'use server'

import { auth } from '@/lib/auth'
import { financeService } from '@/services/finance.service'
import { revalidatePath } from 'next/cache'
import { ExpenseCategory } from '@prisma/client'

export async function addExpenseAction(formData: FormData) {
  const session = await auth()
  if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'CLINIC_ADMIN')) {
    throw new Error('Unauthorized')
  }

  const amount = Number(formData.get('amount'))
  const category = formData.get('category') as ExpenseCategory
  const description = formData.get('description') as string
  const dateStr = formData.get('date') as string
  const notes = formData.get('notes') as string

  if (!amount || !category || !description || !dateStr) {
    throw new Error('Missing required fields')
  }

  const date = new Date(dateStr)

  await financeService.addExpense(session.user.clinicId as string, session.user.id, {
    amount,
    category,
    description,
    date,
    notes
  })

  // Revalidate to update the UI
  revalidatePath('/[locale]/(dashboard)/finance', 'page')
  
  return { success: true }
}
