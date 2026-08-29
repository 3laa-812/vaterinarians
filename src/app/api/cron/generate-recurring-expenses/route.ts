import { NextResponse } from 'next/server'
import { financeService } from '@/services/finance.service'

import { env } from '@/lib/env'
import { logger } from '@/lib/logger';

export async function GET(req: Request) {
  // Security for Vercel Cron
  const authHeader = req.headers.get('authorization')
  if (!env.CRON_SECRET || authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const generated = await financeService.generateRecurringExpenses()
    return NextResponse.json({ success: true, count: generated.length })
  } catch (error) {
    logger.error('Error generating recurring expenses:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
