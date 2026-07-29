import { IncomeCategory, ExpenseCategory } from '@prisma/client'

export interface PLStatement {
  period: { from: Date; to: Date }
  revenues: {
    sessions:     number
    store:        number
    other:        number
    total:        number
    breakdown:    { category: string; amount: number; percent: number }[]
  }
  expenses: {
    total:        number
    byCategory:   { category: string; amount: number; percent: number }[]
  }
  payroll: {
    total:        number
  }
  netProfit:      number
  profitMargin:   number
  revenueGrowth:  number | null   // % vs previous period
  expenseGrowth:  number | null
  profitGrowth:   number | null
}

export function calculatePL(
  period: { from: Date; to: Date },
  data: {
    sessionPayments:  { paidAmount: number }[]
    storeOrders:      { total: number; paymentStatus: string }[]
    otherIncome:      { amount: number; category: IncomeCategory }[]
    expenses:         { amount: number; category: ExpenseCategory }[]
    salaryPayments:   { amount: number }[]
  },
  prevData?: {
    totalRevenue: number
    totalExpense: number
    netProfit: number
  }
): PLStatement {
  const sessionTotal = data.sessionPayments.reduce((s, p) => s + p.paidAmount, 0)
  const storeTotal = data.storeOrders.filter(o => o.paymentStatus !== 'UNPAID').reduce((s, o) => s + o.total, 0)
  const otherTotal = data.otherIncome.reduce((s, i) => s + i.amount, 0)
  
  const totalRevenue = sessionTotal + storeTotal + otherTotal

  const expenseTotal = data.expenses.reduce((s, e) => s + e.amount, 0)
  const payrollTotal = data.salaryPayments.reduce((s, p) => s + p.amount, 0)

  // Calculate revenue breakdown
  const incomeCategoryTotals = data.otherIncome.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount
    return acc
  }, {} as Record<string, number>)

  const revenueBreakdown = []
  if (sessionTotal > 0) revenueBreakdown.push({ category: 'Sessions', amount: sessionTotal, percent: Math.round((sessionTotal/totalRevenue)*100) })
  if (storeTotal > 0) revenueBreakdown.push({ category: 'Store', amount: storeTotal, percent: Math.round((storeTotal/totalRevenue)*100) })
  for (const [cat, amt] of Object.entries(incomeCategoryTotals)) {
    revenueBreakdown.push({ category: cat, amount: amt, percent: Math.round((amt/totalRevenue)*100) })
  }

  // Calculate expense breakdown
  const expenseCategoryTotals = data.expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount
    return acc
  }, {} as Record<string, number>)

  const totalExpenseAndPayroll = expenseTotal + payrollTotal

  const expenseBreakdown = []
  if (payrollTotal > 0) {
    expenseBreakdown.push({ category: 'SALARIES', amount: payrollTotal, percent: totalExpenseAndPayroll > 0 ? Math.round((payrollTotal/totalExpenseAndPayroll)*100) : 0 })
  }
  for (const [cat, amt] of Object.entries(expenseCategoryTotals)) {
    expenseBreakdown.push({ category: cat, amount: amt, percent: totalExpenseAndPayroll > 0 ? Math.round((amt/totalExpenseAndPayroll)*100) : 0 })
  }
  
  const netProfit = totalRevenue - totalExpenseAndPayroll
  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0

  let revenueGrowth = null, expenseGrowth = null, profitGrowth = null
  if (prevData) {
    if (prevData.totalRevenue > 0) revenueGrowth = Math.round(((totalRevenue - prevData.totalRevenue) / prevData.totalRevenue) * 100)
    if (prevData.totalExpense > 0) expenseGrowth = Math.round(((totalExpenseAndPayroll - prevData.totalExpense) / prevData.totalExpense) * 100)
    if (prevData.netProfit > 0) profitGrowth = Math.round(((netProfit - prevData.netProfit) / prevData.netProfit) * 100)
  }

  return {
    period,
    revenues: {
      sessions: sessionTotal,
      store: storeTotal,
      other: otherTotal,
      total: totalRevenue,
      breakdown: revenueBreakdown
    },
    expenses: {
      total: expenseTotal,
      byCategory: expenseBreakdown
    },
    payroll: {
      total: payrollTotal
    },
    netProfit,
    profitMargin,
    revenueGrowth,
    expenseGrowth,
    profitGrowth
  }
}

export function calculateCashFlow(
  months: { revenues: number; expenses: number; month: number; year: number }[]
): { month: number; year: number; net: number; cumulative: number }[] {
  let cumulative = 0
  return months.map(m => {
    const net = m.revenues - m.expenses
    cumulative += net
    return {
      month: m.month,
      year: m.year,
      net,
      cumulative
    }
  })
}

export function calculateBudgetVariance(
  budget: { category: string; planned: number }[],
  actual: { category: string; amount: number }[]
): { category: string; planned: number; actual: number; variance: number; percent: number; status: 'ok' | 'warning' | 'over' }[] {
  const actualMap = actual.reduce((acc, curr) => {
    acc[curr.category] = curr.amount
    return acc
  }, {} as Record<string, number>)

  return budget.map(b => {
    const amt = actualMap[b.category] || 0
    const variance = b.planned - amt
    const percent = b.planned > 0 ? Math.round((amt / b.planned) * 100) : (amt > 0 ? 100 : 0)
    let status: 'ok' | 'warning' | 'over' = 'ok'
    if (percent >= 100) status = 'over'
    else if (percent >= 80) status = 'warning'

    return {
      category: b.category,
      planned: b.planned,
      actual: amt,
      variance,
      percent,
      status
    }
  })
}

export interface FinancialAlert {
  type: 'overdue_payment' | 'upcoming_expense' | 'low_stock' | 'unpaid_salary'
  message: string
  amount?: number
  date?: Date
}

export function generateFinancialAlerts(data: {
  overduePayments:    { amount: number }[]
  upcomingExpenses:   { amount: number; description: string; dueDate: Date }[]
  lowStockProducts:   { name: string; stock: number }[]
  unpaidSalaries:     { staffName: string; amount: number }[]
}): FinancialAlert[] {
  const alerts: FinancialAlert[] = []

  if (data.overduePayments.length > 0) {
    const totalOverdue = data.overduePayments.reduce((s, p) => s + p.amount, 0)
    alerts.push({
      type: 'overdue_payment',
      message: `${data.overduePayments.length} overdue payments`,
      amount: totalOverdue
    })
  }

  for (const exp of data.upcomingExpenses) {
    alerts.push({
      type: 'upcoming_expense',
      message: `Upcoming expense: ${exp.description}`,
      amount: exp.amount,
      date: exp.dueDate
    })
  }

  if (data.lowStockProducts.length > 0) {
    alerts.push({
      type: 'low_stock',
      message: `${data.lowStockProducts.length} products running low on stock`
    })
  }

  for (const salary of data.unpaidSalaries) {
    alerts.push({
      type: 'unpaid_salary',
      message: `Unpaid salary for ${salary.staffName}`,
      amount: salary.amount
    })
  }

  return alerts
}
