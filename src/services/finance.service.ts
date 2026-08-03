import { prisma } from '@/lib/db'
import { calculatePL, calculateBudgetVariance, generateFinancialAlerts, FinancialAlert } from '@/domain/finance'
import { IncomeCategory, ExpenseCategory, ExpenseFrequency } from '@prisma/client'

export const financeService = {
  async getDashboard(clinicId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)

    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    const prevStartDate = new Date(prevYear, prevMonth - 1, 1)
    const prevEndDate = new Date(prevYear, prevMonth, 0, 23, 59, 59, 999)

    // Data for current month
    const [
      sessionPayments,
      otherIncome,
      expenses,
      salaryPayments,
      alertsData
    ] = await Promise.all([
      prisma.payment.findMany({
        where: { appointment: { animal: { clinicId } }, createdAt: { gte: startDate, lte: endDate } },
        select: { paidAmount: true }
      }),
      prisma.income.findMany({
        where: { clinicId, date: { gte: startDate, lte: endDate } },
        select: { amount: true, category: true }
      }),
      prisma.expense.findMany({
        where: { clinicId, date: { gte: startDate, lte: endDate }, isRecurring: false }, // we only sum non-recurring logic directly, but wait - recurring expenses will generate child expenses. We'll sum all expenses.
        select: { amount: true, category: true }
      }),
      prisma.salaryPayment.findMany({
        where: { staff: { clinicId }, month, year },
        select: { amount: true }
      }),
      this.getAlertsData(clinicId)
    ])

    // Prev month data (simplified approach: aggregate DB directly)
    const [prevSessionSum, prevIncomeSum, prevExpenseSum, prevSalarySum] = await Promise.all([
      prisma.payment.aggregate({
        where: { appointment: { animal: { clinicId } }, createdAt: { gte: prevStartDate, lte: prevEndDate } },
        _sum: { paidAmount: true }
      }),
      prisma.income.aggregate({
        where: { clinicId, date: { gte: prevStartDate, lte: prevEndDate } },
        _sum: { amount: true }
      }),
      prisma.expense.aggregate({
        where: { clinicId, date: { gte: prevStartDate, lte: prevEndDate } },
        _sum: { amount: true }
      }),
      prisma.salaryPayment.aggregate({
        where: { staff: { clinicId }, month: prevMonth, year: prevYear },
        _sum: { amount: true }
      })
    ])

    const prevTotalRevenue = (prevSessionSum._sum.paidAmount || 0) + (prevIncomeSum._sum.amount || 0)
    const prevTotalExpense = (prevExpenseSum._sum.amount || 0) + (prevSalarySum._sum.amount || 0)
    const prevNetProfit = prevTotalRevenue - prevTotalExpense

    const storeOrders = otherIncome
      .filter(i => i.category === 'STORE_ORDER')
      .map(i => ({ total: i.amount, paymentStatus: 'PAID' }))

    const nonStoreIncome = otherIncome.filter(i => i.category !== 'STORE_ORDER')

    const pl = calculatePL(
      { from: startDate, to: endDate },
      {
        sessionPayments,
        storeOrders,
        otherIncome: nonStoreIncome,
        expenses,
        salaryPayments
      },
      {
        totalRevenue: prevTotalRevenue,
        totalExpense: prevTotalExpense,
        netProfit: prevNetProfit
      }
    )

    const alerts = generateFinancialAlerts(alertsData)

    return { pl, alerts }
  },

  async getAlertsData(clinicId: string) {
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)

    const [overduePayments, upcomingExpenses, unpaidStaff] = await Promise.all([
      prisma.payment.findMany({
        where: { appointment: { animal: { clinicId } }, status: { in: ['UNPAID', 'PARTIAL'] } },
        select: { totalAmount: true, paidAmount: true }
      }),
      prisma.expense.findMany({
        where: { clinicId, isRecurring: true, recurringDay: { not: null } },
        select: { amount: true, description: true, recurringDay: true }
      }),
      prisma.staff.findMany({
        where: { clinicId, isActive: true, salaries: { none: { month: today.getMonth() + 1, year: today.getFullYear() } } },
        select: { name: true, baseSalary: true }
      })
    ])

    // Format upcoming expenses to calculate their due date correctly in the next week
    const formattedUpcomingExpenses = upcomingExpenses.map(e => {
      const dueDate = new Date()
      if (e.recurringDay) {
        dueDate.setDate(e.recurringDay)
        if (dueDate < today) dueDate.setMonth(dueDate.getMonth() + 1)
      }
      return { amount: e.amount, description: e.description, dueDate }
    }).filter(e => e.dueDate <= nextWeek)

    return {
      overduePayments: overduePayments.map(p => ({ amount: p.totalAmount - p.paidAmount })),
      upcomingExpenses: formattedUpcomingExpenses,
      lowStockProducts: [], // Placeholder for Store module
      unpaidSalaries: unpaidStaff.map(s => ({ staffName: s.name, amount: s.baseSalary }))
    }
  },

  async addExpense(clinicId: string, userId: string, data: { amount: number; category: ExpenseCategory; description: string; date: Date; notes?: string; isRecurring?: boolean; frequency?: ExpenseFrequency; recurringDay?: number; recurringEndDate?: Date }) {
    return prisma.expense.create({
      data: {
        ...data,
        clinicId,
        recordedById: userId
      }
    })
  },

  async updateExpense(clinicId: string, expenseId: string, data: Partial<{ amount: number; category: ExpenseCategory; description: string; date: Date; notes?: string; isRecurring?: boolean; frequency?: ExpenseFrequency; recurringDay?: number; recurringEndDate?: Date }>) {
    return prisma.expense.update({
      where: { id: expenseId, clinicId },
      data
    })
  },

  async deleteExpense(clinicId: string, expenseId: string) {
    return prisma.expense.delete({
      where: { id: expenseId, clinicId }
    })
  },

  async generateRecurringExpenses() {
    const today = new Date()
    const dayOfMonth = today.getDate()

    // Find all monthly recurring expenses globally that trigger today
    const recurringExpenses = await prisma.expense.findMany({
      where: {
        isRecurring: true,
        frequency: 'MONTHLY',
        recurringDay: dayOfMonth,
        OR: [
          { recurringEndDate: null },
          { recurringEndDate: { gte: today } }
        ]
      }
    })

    const createdExpenses = await Promise.all(recurringExpenses.map(parent => 
      prisma.expense.create({
        data: {
          amount: parent.amount,
          category: parent.category,
          description: `${parent.description} (Auto-generated)`,
          date: today,
          notes: parent.notes,
          clinicId: parent.clinicId,
          recordedById: parent.recordedById,
          parentExpenseId: parent.id,
          isRecurring: false
        }
      })
    ))

    return createdExpenses
  },

  async payStaffSalary(clinicId: string, userId: string, staffId: string, data: { amount: number; baseSalary: number; bonus?: number; deductions?: number; month: number; year: number; notes?: string }) {
    return prisma.$transaction(async (tx) => {
      // Create salary payment
      const payment = await tx.salaryPayment.create({
        data: {
          ...data,
          paidAt: new Date(),
          staffId,
          paidById: userId
        }
      })

      // Record as expense
      await tx.expense.create({
        data: {
          amount: data.amount,
          category: 'SALARIES',
          description: `Salary Payment - ${data.month}/${data.year}`,
          date: new Date(),
          clinicId,
          recordedById: userId
        }
      })

      return payment
    })
  }
}
