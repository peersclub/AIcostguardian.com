import { PrismaClient, Budget, BudgetPeriod, Prisma } from '@prisma/client'
import { startOfDay, startOfWeek, startOfMonth, startOfQuarter, startOfYear, endOfDay, endOfWeek, endOfMonth, endOfQuarter, endOfYear } from 'date-fns'

const prisma = new PrismaClient()

export interface CreateBudgetInput {
  organizationId: string
  name: string
  amount: number
  period: BudgetPeriod
  startDate?: Date
  endDate?: Date
  alertThreshold?: number
  metadata?: any
}

export interface UpdateBudgetInput {
  name?: string
  amount?: number
  period?: BudgetPeriod
  startDate?: Date
  endDate?: Date
  alertThreshold?: number
  isActive?: boolean
  metadata?: any
}

export interface BudgetWithUsage extends Budget {
  usage: number
  percentage: number
  remaining: number
  isOverBudget: boolean
  alertTriggered: boolean
}

export class BudgetService {
  async createBudget(input: CreateBudgetInput): Promise<Budget> {
    const { startDate = new Date(), endDate, ...rest } = input
    
    // Calculate end date based on period if not provided
    const calculatedEndDate = endDate || this.calculateEndDate(startDate, input.period)
    
    try {
      const budget = await prisma.budget.create({
        data: {
          ...rest,
          startDate,
          endDate: calculatedEndDate,
          spent: 0
        }
      })
      
      return budget
    } catch (error) {
      console.error('Error creating budget:', error)
      throw error
    }
  }
  
  async updateBudget(id: string, input: UpdateBudgetInput): Promise<Budget> {
    try {
      const budget = await prisma.budget.update({
        where: { id },
        data: input
      })
      
      return budget
    } catch (error) {
      console.error('Error updating budget:', error)
      throw error
    }
  }
  
  async getBudget(id: string): Promise<BudgetWithUsage | null> {
    try {
      const budget = await prisma.budget.findUnique({
        where: { id }
      })
      
      if (!budget) return null
      
      // Get usage for the budget period
      const usage = await this.getBudgetUsage(budget)
      
      return this.enrichBudgetWithUsage(budget, usage)
    } catch (error) {
      console.error('Error fetching budget:', error)
      throw error
    }
  }
  
  async getOrganizationBudgets(organizationId: string, activeOnly = true): Promise<BudgetWithUsage[]> {
    try {
      const where: Prisma.BudgetWhereInput = {
        organizationId,
        ...(activeOnly && { isActive: true })
      }
      
      const budgets = await prisma.budget.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        }
      })
      
      // Enrich each budget with usage data
      const enrichedBudgets = await Promise.all(
        budgets.map(async (budget) => {
          const usage = await this.getBudgetUsage(budget)
          return this.enrichBudgetWithUsage(budget, usage)
        })
      )
      
      return enrichedBudgets
    } catch (error) {
      console.error('Error fetching organization budgets:', error)
      throw error
    }
  }
  
  async deleteBudget(id: string): Promise<void> {
    try {
      await prisma.budget.delete({
        where: { id }
      })
    } catch (error) {
      console.error('Error deleting budget:', error)
      throw error
    }
  }
  
  async getBudgetUsage(budget: Budget): Promise<number> {
    try {
      const { startDate, endDate } = this.getCurrentPeriodDates(budget)
      
      const usage = await prisma.usageLog.aggregate({
        where: {
          organizationId: budget.organizationId,
          timestamp: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: {
          cost: true
        }
      })
      
      return usage._sum.cost || 0
    } catch (error) {
      console.error('Error calculating budget usage:', error)
      throw error
    }
  }
  
  async checkBudgetAlerts(organizationId: string): Promise<BudgetWithUsage[]> {
    try {
      const budgets = await this.getOrganizationBudgets(organizationId, true)
      const alertBudgets: BudgetWithUsage[] = []
      
      for (const budget of budgets) {
        if (budget.alertTriggered) {
          alertBudgets.push(budget)
          
          // Create notification for budget alert
          await this.createBudgetAlert(budget)
        }
      }
      
      return alertBudgets
    } catch (error) {
      console.error('Error checking budget alerts:', error)
      throw error
    }
  }
  
  async updateBudgetSpent(organizationId: string, amount: number): Promise<void> {
    try {
      // Get all active budgets for the organization
      const budgets = await prisma.budget.findMany({
        where: {
          organizationId,
          isActive: true
        }
      })
      
      // Update spent amount for each relevant budget
      for (const budget of budgets) {
        const { startDate, endDate } = this.getCurrentPeriodDates(budget)
        const now = new Date()
        
        // Only update if current date is within budget period
        if (now >= startDate && now <= endDate) {
          await prisma.budget.update({
            where: { id: budget.id },
            data: {
              spent: {
                increment: amount
              }
            }
          })
        }
      }
    } catch (error) {
      console.error('Error updating budget spent:', error)
      throw error
    }
  }
  
  async resetPeriodBudgets(): Promise<void> {
    try {
      const now = new Date()
      
      // Find budgets that need resetting
      const budgets = await prisma.budget.findMany({
        where: {
          isActive: true,
          endDate: {
            lt: now
          }
        }
      })
      
      for (const budget of budgets) {
        // Calculate new period dates
        const newStartDate = this.getNextPeriodStart(budget.endDate!, budget.period)
        const newEndDate = this.calculateEndDate(newStartDate, budget.period)
        
        // Reset budget for new period
        await prisma.budget.update({
          where: { id: budget.id },
          data: {
            startDate: newStartDate,
            endDate: newEndDate,
            spent: 0
          }
        })
      }
    } catch (error) {
      console.error('Error resetting period budgets:', error)
      throw error
    }
  }
  
  private enrichBudgetWithUsage(budget: Budget, usage: number): BudgetWithUsage {
    const percentage = budget.amount > 0 ? (usage / budget.amount) * 100 : 0
    const remaining = Math.max(0, budget.amount - usage)
    const isOverBudget = usage > budget.amount
    const alertTriggered = percentage >= (budget.alertThreshold * 100)
    
    return {
      ...budget,
      usage,
      percentage,
      remaining,
      isOverBudget,
      alertTriggered
    }
  }
  
  private getCurrentPeriodDates(budget: Budget): { startDate: Date; endDate: Date } {
    const now = new Date()
    
    // If budget has fixed dates and is within range, use them
    if (budget.endDate && now <= budget.endDate) {
      return {
        startDate: budget.startDate,
        endDate: budget.endDate
      }
    }
    
    // Otherwise calculate based on period
    switch (budget.period) {
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
        return {
          startDate: startOfQuarter(now),
          endDate: endOfQuarter(now)
        }
      case 'YEARLY':
        return {
          startDate: startOfYear(now),
          endDate: endOfYear(now)
        }
      default:
        return {
          startDate: budget.startDate,
          endDate: budget.endDate || new Date()
        }
    }
  }
  
  private calculateEndDate(startDate: Date, period: BudgetPeriod): Date {
    switch (period) {
      case 'DAILY':
        return endOfDay(startDate)
      case 'WEEKLY':
        return endOfWeek(startDate)
      case 'MONTHLY':
        return endOfMonth(startDate)
      case 'QUARTERLY':
        return endOfQuarter(startDate)
      case 'YEARLY':
        return endOfYear(startDate)
      default:
        return endOfMonth(startDate)
    }
  }
  
  private getNextPeriodStart(currentEnd: Date, period: BudgetPeriod): Date {
    const nextDay = new Date(currentEnd)
    nextDay.setDate(nextDay.getDate() + 1)
    
    switch (period) {
      case 'DAILY':
        return startOfDay(nextDay)
      case 'WEEKLY':
        return startOfWeek(nextDay)
      case 'MONTHLY':
        return startOfMonth(nextDay)
      case 'QUARTERLY':
        return startOfQuarter(nextDay)
      case 'YEARLY':
        return startOfYear(nextDay)
      default:
        return nextDay
    }
  }
  
  private async createBudgetAlert(budget: BudgetWithUsage): Promise<void> {
    try {
      // Get organization users to notify
      const users = await prisma.user.findMany({
        where: {
          organizationId: budget.organizationId,
          role: {
            in: ['ADMIN', 'MANAGER']
          }
        }
      })
      
      // Create notifications for each user
      for (const user of users) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            organizationId: budget.organizationId,
            type: budget.isOverBudget ? 'COST_THRESHOLD_EXCEEDED' : 'COST_THRESHOLD_WARNING',
            priority: budget.isOverBudget ? 'CRITICAL' : 'HIGH',
            title: budget.isOverBudget 
              ? `Budget "${budget.name}" exceeded`
              : `Budget "${budget.name}" alert`,
            message: budget.isOverBudget
              ? `Your ${budget.name} has exceeded its limit of $${budget.amount}. Current usage: $${budget.usage.toFixed(2)}`
              : `Your ${budget.name} has reached ${budget.percentage.toFixed(0)}% of its $${budget.amount} limit.`,
            status: 'PENDING',
            channels: ['email', 'in-app'],
            data: {
              budgetId: budget.id,
              budgetName: budget.name,
              amount: budget.amount,
              usage: budget.usage,
              percentage: budget.percentage
            }
          }
        })
      }
    } catch (error) {
      console.error('Error creating budget alert:', error)
      // Don't throw to avoid disrupting budget check flow
    }
  }
}

export const budgetService = new BudgetService()