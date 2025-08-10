import { PrismaClient, Organization, User, SubscriptionTier, UserRole, Prisma } from '@prisma/client'
import { hash } from 'bcryptjs'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10)
const prisma = new PrismaClient()

export interface CreateOrganizationInput {
  name: string
  domain: string
  adminEmail: string
  adminName: string
  subscription?: SubscriptionTier
  spendLimit?: number
}

export interface UpdateOrganizationInput {
  name?: string
  domain?: string
  subscription?: SubscriptionTier
  spendLimit?: number
  settings?: any
}

export interface InviteUserInput {
  email: string
  name: string
  role: UserRole
  organizationId: string
  invitedBy: string
}

export interface OrganizationWithStats extends Organization {
  users: User[]
  monthlySpend: number
  userCount: number
  activeAlerts: number
  apiKeyCount: number
}

export class OrganizationService {
  async createOrganization(input: CreateOrganizationInput): Promise<Organization> {
    const { name, domain, adminEmail, adminName, subscription = 'FREE', spendLimit } = input
    
    try {
      // Check if organization with domain already exists
      const existingOrg = await prisma.organization.findUnique({
        where: { domain }
      })
      
      if (existingOrg) {
        throw new Error('Organization with this domain already exists')
      }
      
      // Create organization and admin user in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create organization
        const org = await tx.organization.create({
          data: {
            name,
            domain,
            subscription,
            spendLimit,
            monthlySpend: 0
          }
        })
        
        // Create admin user
        const adminUser = await tx.user.create({
          data: {
            email: adminEmail,
            name: adminName,
            role: 'ADMIN',
            organizationId: org.id
          }
        })
        
        // Create default notification preferences
        await tx.notificationPreferences.create({
          data: {
            userId: adminUser.id,
            emailEnabled: true,
            pushEnabled: true,
            inAppEnabled: true,
            costAlerts: true,
            usageAlerts: true,
            systemAlerts: true,
            teamAlerts: true,
            reports: true,
            recommendations: true
          }
        })
        
        return org
      })
      
      return result
    } catch (error) {
      console.error('Error creating organization:', error)
      throw error
    }
  }
  
  async updateOrganization(id: string, input: UpdateOrganizationInput): Promise<Organization> {
    try {
      const org = await prisma.organization.update({
        where: { id },
        data: input
      })
      
      return org
    } catch (error) {
      console.error('Error updating organization:', error)
      throw error
    }
  }
  
  async getOrganization(id: string): Promise<OrganizationWithStats | null> {
    try {
      const org = await prisma.organization.findUnique({
        where: { id },
        include: {
          users: true,
          apiKeys: true,
          notifications: {
            where: { status: 'PENDING' }
          }
        }
      })
      
      if (!org) return null
      
      // Calculate stats
      const stats = {
        ...org,
        userCount: org.users.length,
        activeAlerts: org.notifications.length,
        apiKeyCount: org.apiKeys.length
      }
      
      return stats
    } catch (error) {
      console.error('Error fetching organization:', error)
      throw error
    }
  }
  
  async getOrganizationByDomain(domain: string): Promise<Organization | null> {
    try {
      return await prisma.organization.findUnique({
        where: { domain }
      })
    } catch (error) {
      console.error('Error fetching organization by domain:', error)
      throw error
    }
  }
  
  async listOrganizations(limit = 10, offset = 0): Promise<Organization[]> {
    try {
      return await prisma.organization.findMany({
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc'
        }
      })
    } catch (error) {
      console.error('Error listing organizations:', error)
      throw error
    }
  }
  
  async deleteOrganization(id: string): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        // Delete all related data
        await tx.notification.deleteMany({ where: { organizationId: id } })
        await tx.notificationRule.deleteMany({ where: { organizationId: id } })
        await tx.usageLog.deleteMany({ where: { organizationId: id } })
        await tx.apiKey.deleteMany({ where: { organizationId: id } })
        
        // Delete users' related data
        const users = await tx.user.findMany({ where: { organizationId: id } })
        for (const user of users) {
          await tx.notificationPreferences.deleteMany({ where: { userId: user.id } })
          await tx.session.deleteMany({ where: { userId: user.id } })
          await tx.account.deleteMany({ where: { userId: user.id } })
          await tx.alert.deleteMany({ where: { userId: user.id } })
          await tx.usage.deleteMany({ where: { userId: user.id } })
        }
        
        // Delete users
        await tx.user.deleteMany({ where: { organizationId: id } })
        
        // Finally delete organization
        await tx.organization.delete({ where: { id } })
      })
    } catch (error) {
      console.error('Error deleting organization:', error)
      throw error
    }
  }
  
  async inviteUserToOrganization(input: InviteUserInput): Promise<User> {
    const { email, name, role, organizationId } = input
    
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      
      if (existingUser) {
        if (existingUser.organizationId === organizationId) {
          throw new Error('User is already a member of this organization')
        }
        throw new Error('User already exists in another organization')
      }
      
      // Create new user
      const user = await prisma.user.create({
        data: {
          email,
          name,
          role,
          organizationId
        }
      })
      
      // Create notification preferences
      await prisma.notificationPreferences.create({
        data: {
          userId: user.id,
          emailEnabled: true,
          pushEnabled: true,
          inAppEnabled: true,
          costAlerts: true,
          usageAlerts: true,
          systemAlerts: true,
          teamAlerts: false,
          reports: false,
          recommendations: true
        }
      })
      
      // TODO: Send invitation email
      
      return user
    } catch (error) {
      console.error('Error inviting user:', error)
      throw error
    }
  }
  
  async removeUserFromOrganization(userId: string, organizationId: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })
      
      if (!user || user.organizationId !== organizationId) {
        throw new Error('User not found in this organization')
      }
      
      // Don't allow removing the last admin
      if (user.role === 'ADMIN') {
        const adminCount = await prisma.user.count({
          where: {
            organizationId,
            role: 'ADMIN'
          }
        })
        
        if (adminCount <= 1) {
          throw new Error('Cannot remove the last admin from organization')
        }
      }
      
      // Remove user from organization
      await prisma.user.update({
        where: { id: userId },
        data: {
          organizationId: null
        }
      })
    } catch (error) {
      console.error('Error removing user from organization:', error)
      throw error
    }
  }
  
  async updateUserRole(userId: string, organizationId: string, newRole: UserRole): Promise<User> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })
      
      if (!user || user.organizationId !== organizationId) {
        throw new Error('User not found in this organization')
      }
      
      // Don't allow removing the last admin
      if (user.role === 'ADMIN' && newRole !== 'ADMIN') {
        const adminCount = await prisma.user.count({
          where: {
            organizationId,
            role: 'ADMIN'
          }
        })
        
        if (adminCount <= 1) {
          throw new Error('Cannot remove admin role from the last admin')
        }
      }
      
      return await prisma.user.update({
        where: { id: userId },
        data: { role: newRole }
      })
    } catch (error) {
      console.error('Error updating user role:', error)
      throw error
    }
  }
  
  async getOrganizationUsers(organizationId: string): Promise<User[]> {
    try {
      return await prisma.user.findMany({
        where: { organizationId },
        orderBy: [
          { role: 'asc' },
          { createdAt: 'desc' }
        ]
      })
    } catch (error) {
      console.error('Error fetching organization users:', error)
      throw error
    }
  }
  
  async getOrganizationStats(organizationId: string): Promise<any> {
    try {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
      
      // Get current month spend
      const currentMonthUsage = await prisma.usageLog.aggregate({
        where: {
          organizationId,
          timestamp: {
            gte: startOfMonth
          }
        },
        _sum: {
          cost: true
        }
      })
      
      // Get last month spend
      const lastMonthUsage = await prisma.usageLog.aggregate({
        where: {
          organizationId,
          timestamp: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        },
        _sum: {
          cost: true
        }
      })
      
      // Get user count
      const userCount = await prisma.user.count({
        where: { organizationId }
      })
      
      // Get active API keys
      const activeApiKeys = await prisma.apiKey.count({
        where: {
          organizationId,
          isActive: true
        }
      })
      
      // Get usage by provider
      const usageByProvider = await prisma.usageLog.groupBy({
        by: ['provider'],
        where: {
          organizationId,
          timestamp: {
            gte: startOfMonth
          }
        },
        _sum: {
          cost: true,
          totalTokens: true
        }
      })
      
      return {
        currentMonthSpend: currentMonthUsage._sum.cost || 0,
        lastMonthSpend: lastMonthUsage._sum.cost || 0,
        userCount,
        activeApiKeys,
        usageByProvider
      }
    } catch (error) {
      console.error('Error fetching organization stats:', error)
      throw error
    }
  }
  
  async checkSpendLimit(organizationId: string): Promise<boolean> {
    try {
      const org = await prisma.organization.findUnique({
        where: { id: organizationId }
      })
      
      if (!org || !org.spendLimit) return true
      
      return org.monthlySpend < org.spendLimit
    } catch (error) {
      console.error('Error checking spend limit:', error)
      throw error
    }
  }
  
  async updateMonthlySpend(organizationId: string, amount: number): Promise<void> {
    try {
      await prisma.organization.update({
        where: { id: organizationId },
        data: {
          monthlySpend: {
            increment: amount
          }
        }
      })
    } catch (error) {
      console.error('Error updating monthly spend:', error)
      throw error
    }
  }
}

export const organizationService = new OrganizationService()