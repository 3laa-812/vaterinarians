import { NextResponse } from 'next/server'
import { financeService } from '@/services/finance.service'

export async function GET(req: Request) {
  // Security for Vercel Cron
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const generated = await financeService.generateRecurringExpenses()
    return NextResponse.json({ success: true, count: generated.length })
  } catch (error) {
    console.error('Error generating recurring expenses:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
