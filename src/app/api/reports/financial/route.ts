import { withAuth } from '@/lib/api/handler'
import { apiSuccess, apiError } from '@/lib/api/response'
import { prisma } from '@/lib/db'
import { clinicScope } from '@/lib/scope'
import { z } from 'zod'

const querySchema = z.object({
  startDate: z.string().optional(),
  endDate:   z.string().optional(),
})

export const GET = withAuth(async (req, { session }) => {
  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'CLINIC_ADMIN') {
    return apiError({ en: 'Not authorized', ar: 'غير مصرح لك بالوصول', code: 'FORBIDDEN' }, 403)
  }

  const url = new URL(req.url)
  const q   = querySchema.safeParse(Object.fromEntries(url.searchParams))

  if (!q.success) return apiError({ en: 'Invalid date range', ar: 'نطاق تاريخ غير صالح', code: 'INVALID_INPUT' }, 400)

  const { startDate, endDate } = q.data
  
  const whereClause: any = {}
  const scope = clinicScope(session)
  if ('clinicId' in scope) {
    whereClause.appointment = { animal: { clinicId: scope.clinicId } }
  }

  if (startDate && endDate) {
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)
    whereClause.createdAt = {
      gte: new Date(startDate),
      lte: end,
    }
  }

  const payments = await prisma.payment.findMany({
    where: whereClause,
    select: {
      totalAmount: true,
      paidAmount:  true,
      status:      true,
      createdAt:   true,
    },
    orderBy: { createdAt: 'asc' },
  })

  let totalRevenue   = 0
  let totalCollected = 0
  let totalPending   = 0
  
  const dailyData: Record<string, { collected: number; revenue: number }> = {}

  for (const p of payments) {
    totalRevenue   += p.totalAmount
    totalCollected += p.paidAmount
    
    if (p.status !== 'PAID') {
      totalPending += (p.totalAmount - p.paidAmount)
    }

    const day = p.createdAt.toISOString().split('T')[0]
    if (!dailyData[day]) {
      dailyData[day] = { collected: 0, revenue: 0 }
    }
    dailyData[day].collected += p.paidAmount
    dailyData[day].revenue   += p.totalAmount
  }

  const chartData = Object.keys(dailyData).sort().map(date => ({
    date,
    collected: dailyData[date].collected,
    revenue:   dailyData[date].revenue,
  }))

  return apiSuccess({
    summary: {
      totalRevenue,
      totalCollected,
      totalPending,
    },
    chartData,
  })
})
