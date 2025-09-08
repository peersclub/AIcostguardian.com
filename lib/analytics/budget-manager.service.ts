import { prisma } from '@/lib/prisma'
import { sendGridEmailService } from '@/lib/email/sendgrid-email.service'
import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth } from 'date-fns'

interface BudgetConfig {
  name: string
  amount: number
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  userId?: string
  organizationId?: string
  alertThresholds?: number[] // percentages: [50, 75, 90, 100]
}

interface BudgetStatus {
  budget: any
  currentSpend: number
  remaining: number
  percentageUsed: number
  isOverBudget: boolean
  daysRemaining: number
  projectedSpend: number // Based on current rate
  alerts: any[]
}

interface BudgetAlert {
  threshold: number
  triggered: boolean
  amount: number
  message: string
}

class BudgetManagerService {
  private static instance: BudgetManagerService
  private alertedBudgets: Map<string, Set<number>> = new Map() // Track which alerts have been sent

  private constructor() {
    // Start periodic budget check
    this.startBudgetMonitoring()
  }

  static getInstance(): BudgetManagerService {
    if (!BudgetManagerService.instance) {
      BudgetManagerService.instance = new BudgetManagerService()
    }
    return BudgetManagerService.instance
  }

  /**
   * Create a new budget
   */
  async createBudget(config: BudgetConfig): Promise<any> {
    const { startDate, endDate } = this.getPeriodDates(config.period)
    
    const budget = await prisma.budget.create({
      data: {
        name: config.name,
        amount: config.amount,
        period: config.period,
        startDate,
        endDate,
        userId: config.userId,
        organizationId: config.organizationId,
        spent: 0,
        isActive: true,
        alertThreshold: 0.8
      }
    })
    
    return budget
  }

  /**
   * Get budget status
   */
  async getBudgetStatus(budgetId: string): Promise<BudgetStatus> {
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId }
    })
    
    if (!budget) {
      throw new Error('Budget not found')
    }
    
    // Calculate current spend
    const currentSpend = await this.calculateCurrentSpend(budget)
    
    // Calculate remaining
    const remaining = Math.max(0, budget.amount - currentSpend)
    const percentageUsed = (currentSpend / budget.amount) * 100
    const isOverBudget = currentSpend > budget.amount
    
    // Calculate days remaining
    const now = new Date()
    const endDate = budget.endDate || this.getPeriodDates(budget.period).endDate
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    // Project spend based on current rate
    const daysPassed = Math.ceil((now.getTime() - budget.startDate.getTime()) / (1000 * 60 * 60 * 24))
    const dailyRate = daysPassed > 0 ? currentSpend / daysPassed : 0
    const totalDays = Math.ceil((endDate.getTime() - budget.startDate.getTime()) / (1000 * 60 * 60 * 24))
    const projectedSpend = dailyRate * totalDays
    
    // Get alerts
    const alerts = await this.checkAlerts(budget, currentSpend)
    
    return {
      budget,
      currentSpend,
      remaining,
      percentageUsed,
      isOverBudget,
      daysRemaining,
      projectedSpend,
      alerts
    }
  }

  /**
   * Update budget spending
   */
  async updateBudgetSpending(
    userId: string,
    organizationId: string | undefined,
    amount: number
  ): Promise<void> {
    // Find active budgets
    const budgets = await prisma.budget.findMany({
      where: {
        OR: [
          { userId, isActive: true },
          { organizationId, isActive: true }
        ]
      }
    })
    
    for (const budget of budgets) {
      // Check if budget is in current period
      if (this.isBudgetInCurrentPeriod(budget)) {
        // Update spend
        await prisma.budget.update({
          where: { id: budget.id },
          data: { spent: { increment: amount } }
        })
        
        // Check for alerts
        await this.checkAndSendAlerts(budget, budget.spent + amount)
      }
    }
  }

  /**
   * Check and send budget alerts
   */
  private async checkAndSendAlerts(budget: any, currentSpend: number): Promise<void> {
    const percentageUsed = (currentSpend / budget.amount) * 100
    const thresholds = [50, 75, 90, 100]
    
    // Get or create alert tracking for this budget
    if (!this.alertedBudgets.has(budget.id)) {
      this.alertedBudgets.set(budget.id, new Set())
    }
    const alertedThresholds = this.alertedBudgets.get(budget.id)!
    
    for (const threshold of thresholds) {
      if (percentageUsed >= threshold && !alertedThresholds.has(threshold)) {
        // Send alert
        await this.sendBudgetAlert(budget, threshold, currentSpend)
        alertedThresholds.add(threshold)
      }
    }
  }

  /**
   * Send budget alert email
   */
  private async sendBudgetAlert(budget: any, threshold: number, currentSpend: number): Promise<void> {
    try {
      // Get user email
      let email: string | null = null
      let name: string | null = null
      
      if (budget.userId) {
        const user = await prisma.user.findUnique({
          where: { id: budget.userId },
          select: { email: true, name: true }
        })
        email = user?.email || null
        name = user?.name || null
      } else if (budget.organizationId) {
        // Send to org admins
        const admins = await prisma.user.findMany({
          where: {
            organizationId: budget.organizationId,
            role: 'ADMIN'
          },
          select: { email: true, name: true }
        })
        
        // Send to first admin for now
        if (admins.length > 0) {
          email = admins[0].email
          name = admins[0].name
        }
      }
      
      if (email) {
        const remaining = budget.amount - currentSpend
        const isOverBudget = threshold >= 100
        
        await sendGridEmailService.sendEmail({
          to: email,
          subject: `Budget Alert: ${budget.name} has reached ${threshold}%`,
          text: `Your budget "${budget.name}" has ${isOverBudget ? 'exceeded' : 'reached'} ${threshold}% of its limit.\n\nCurrent spend: $${currentSpend.toFixed(2)}\nBudget limit: $${budget.amount.toFixed(2)}\n${isOverBudget ? `Over budget by: $${Math.abs(remaining).toFixed(2)}` : `Remaining: $${remaining.toFixed(2)}`}`,
          html: `
            <h2>Budget Alert</h2>
            <p>Your budget <strong>"${budget.name}"</strong> has ${isOverBudget ? 'exceeded' : 'reached'} ${threshold}% of its limit.</p>
            <ul>
              <li>Current spend: <strong>$${currentSpend.toFixed(2)}</strong></li>
              <li>Budget limit: <strong>$${budget.amount.toFixed(2)}</strong></li>
              <li>${isOverBudget ? `Over budget by: <strong style="color: red;">$${Math.abs(remaining).toFixed(2)}</strong>` : `Remaining: <strong>$${remaining.toFixed(2)}</strong>`}</li>
            </ul>
            <p>Consider reviewing your AI usage to stay within budget.</p>
          `
        })
      }
    } catch (error) {
      console.error('Failed to send budget alert:', error)
    }
  }

  /**
   * Calculate current spend for a budget
   */
  private async calculateCurrentSpend(budget: any): Promise<number> {
    const { startDate, endDate } = this.getBudgetPeriod(budget)
    
    const where = budget.userId
      ? {
          userId: budget.userId,
          timestamp: {
            gte: startDate,
            lte: endDate
          }
        }
      : {
          organizationId: budget.organizationId,
          timestamp: {
            gte: startDate,
            lte: endDate
          }
        }
    
    const result = await prisma.usage.aggregate({
      where,
      _sum: { cost: true }
    })
    
    return result._sum.cost || 0
  }

  /**
   * Get budget period dates
   */
  private getBudgetPeriod(budget: any): { startDate: Date, endDate: Date } {
    if (budget.startDate && budget.endDate) {
      return { startDate: budget.startDate, endDate: budget.endDate }
    }
    
    return this.getPeriodDates(budget.period)
  }

  /**
   * Get period dates based on period type
   */
  private getPeriodDates(period: string): { startDate: Date, endDate: Date } {
    const now = new Date()
    
    switch (period) {
      case 'DAILY':
        return {
          startDate: startOfDay(now),
          endDate: endOfDay(now)
        }
      case 'WEEKLY':
        return {
          startDate: startOfWeek(now),
          endDate: endOfWeek(now)
        }
      case 'MONTHLY':
        return {
          startDate: startOfMonth(now),
          endDate: endOfMonth(now)
        }
      case 'QUARTERLY':
        const quarter = Math.floor((now.getMonth() + 3) / 3)
        const startMonth = (quarter - 1) * 3
        return {
          startDate: new Date(now.getFullYear(), startMonth, 1),
          endDate: new Date(now.getFullYear(), startMonth + 3, 0)
        }
      case 'YEARLY':
        return {
          startDate: new Date(now.getFullYear(), 0, 1),
          endDate: new Date(now.getFullYear(), 11, 31)
        }
      default:
        return {
          startDate: startOfMonth(now),
          endDate: endOfMonth(now)
        }
    }
  }

  /**
   * Check if budget is in current period
   */
  private isBudgetInCurrentPeriod(budget: any): boolean {
    const now = new Date()
    const { startDate, endDate } = this.getBudgetPeriod(budget)
    
    return now >= startDate && now <= endDate
  }

  /**
   * Check alerts for a budget
   */
  private async checkAlerts(budget: any, currentSpend: number): Promise<BudgetAlert[]> {
    const percentageUsed = (currentSpend / budget.amount) * 100
    const alerts: BudgetAlert[] = []
    const thresholds = [50, 75, 90, 100]
    
    for (const threshold of thresholds) {
      const triggered = percentageUsed >= threshold
      alerts.push({
        threshold,
        triggered,
        amount: currentSpend,
        message: triggered
          ? `Budget has ${threshold === 100 ? 'exceeded' : 'reached'} ${threshold}% of limit`
          : `${threshold}% threshold not reached`
      })
    }
    
    return alerts
  }

  /**
   * Reset budgets at period end
   */
  async resetBudgets(): Promise<void> {
    const budgets = await prisma.budget.findMany({
      where: { isActive: true }
    })
    
    for (const budget of budgets) {
      const { endDate } = this.getBudgetPeriod(budget)
      
      if (new Date() > endDate) {
        // Reset budget for new period
        const { startDate: newStart, endDate: newEnd } = this.getPeriodDates(budget.period)
        
        await prisma.budget.update({
          where: { id: budget.id },
          data: {
            spent: 0,
            startDate: newStart,
            endDate: newEnd
          }
        })
        
        // Clear alert tracking
        this.alertedBudgets.delete(budget.id)
      }
    }
  }

  /**
   * Start periodic budget monitoring
   */
  private startBudgetMonitoring(): void {
    // Check budgets every hour
    setInterval(async () => {
      try {
        await this.resetBudgets()
        await this.checkAllBudgets()
      } catch (error) {
        console.error('Budget monitoring error:', error)
      }
    }, 60 * 60 * 1000) // 1 hour
  }

  /**
   * Check all active budgets for alerts
   */
  private async checkAllBudgets(): Promise<void> {
    const budgets = await prisma.budget.findMany({
      where: { isActive: true }
    })
    
    for (const budget of budgets) {
      const currentSpend = await this.calculateCurrentSpend(budget)
      await this.checkAndSendAlerts(budget, currentSpend)
    }
  }

  /**
   * Get budget recommendations
   */
  async getBudgetRecommendations(
    userId: string,
    organizationId?: string
  ): Promise<string[]> {
    const recommendations: string[] = []
    
    // Get current budgets
    const budgets = await prisma.budget.findMany({
      where: {
        OR: [
          { userId, isActive: true },
          { organizationId, isActive: true }
        ]
      }
    })
    
    // Get average spend
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const usage = await prisma.usage.aggregate({
      where: {
        userId,
        timestamp: { gte: thirtyDaysAgo }
      },
      _sum: { cost: true },
      _count: true
    })
    
    const avgDailySpend = (usage._sum.cost || 0) / 30
    const avgMonthlySpend = avgDailySpend * 30
    
    // Recommendations based on spend patterns
    if (budgets.length === 0) {
      recommendations.push(`Set up a monthly budget of $${(avgMonthlySpend * 1.2).toFixed(2)} based on your average usage`)
      recommendations.push('Create separate budgets for development and production environments')
    } else {
      // Check if budgets are appropriate
      const monthlyBudget = budgets.find(b => b.period === 'MONTHLY')
      if (monthlyBudget && monthlyBudget.amount < avgMonthlySpend) {
        recommendations.push(`Consider increasing your monthly budget to $${(avgMonthlySpend * 1.1).toFixed(2)}`)
      }
      
      // Check for over-budgeting
      if (monthlyBudget && monthlyBudget.amount > avgMonthlySpend * 2) {
        recommendations.push(`Your budget might be too high. Consider reducing to $${(avgMonthlySpend * 1.3).toFixed(2)}`)
      }
    }
    
    // Add daily budget if high daily variance
    if (avgDailySpend > 10 && !budgets.find(b => b.period === 'DAILY')) {
      recommendations.push(`Add a daily budget cap of $${(avgDailySpend * 1.5).toFixed(2)} to prevent unexpected spikes`)
    }
    
    return recommendations
  }
}

// Export singleton instance
export const budgetManager = BudgetManagerService.getInstance()

// Export types
export type { BudgetConfig, BudgetStatus, BudgetAlert }