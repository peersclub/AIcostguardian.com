/**
 * Unified User & Organization Service
 * Central service for all user and organization operations
 * Replaces multiple scattered user creation and organization management patterns
 */

import { prisma } from '@/lib/prisma'
import { User, Organization, UserRole } from '@prisma/client'

export interface UserWithOrganization extends User {
  organization: Organization | null
}

export interface CreateUserInput {
  email: string
  name?: string | null
  image?: string | null
  provider?: string
}

export interface CreateOrganizationInput {
  name: string
  domain?: string
  ownerId?: string
}

class UserService {
  private static instance: UserService

  private constructor() {}

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService()
    }
    return UserService.instance
  }

  /**
   * Get or create a user with automatic organization setup
   * This is the ONLY method that should be used for user creation
   */
  async ensureUser(input: CreateUserInput): Promise<UserWithOrganization> {
    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: input.email },
      include: { organization: true }
    })

    if (user) {
      // Ensure user has an organization
      if (!user.organization) {
        const org = await this.ensureOrganization(user)
        user = await prisma.user.findUnique({
          where: { id: user.id },
          include: { organization: true }
        }) as UserWithOrganization
      }
      
      // Update last active timestamp
      await prisma.user.update({
        where: { id: user.id },
        data: { lastActiveAt: new Date() }
      }).catch(console.error)

      return user as UserWithOrganization
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        image: input.image,
        role: UserRole.USER,
        lastActiveAt: new Date()
      },
      include: { organization: true }
    })

    // Create organization for new user
    await this.ensureOrganization(newUser)

    // Fetch updated user with organization
    const updatedUser = await prisma.user.findUnique({
      where: { id: newUser.id },
      include: { organization: true }
    })

    return updatedUser as UserWithOrganization
  }

  /**
   * Ensure a user has an organization
   */
  private async ensureOrganization(user: User): Promise<Organization> {
    if (user.organizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: user.organizationId }
      })
      if (org) return org
    }

    // Extract domain from email
    const emailDomain = user.email.split('@')[1] || 'personal'
    
    // Check if organization with this domain exists
    let organization = await prisma.organization.findFirst({
      where: { 
        domain: emailDomain,
        isActive: true 
      }
    })

    if (!organization) {
      // Create new organization
      organization = await prisma.organization.create({
        data: {
          name: `${user.name || user.email.split('@')[0]}'s Organization`,
          domain: emailDomain,
          subscription: 'FREE',
          isActive: true,
          // Set default limits
          maxUsers: 5,
          maxApiKeys: 10,
          spendingLimit: 100,
          alertThreshold: 80,
          allowInvites: true,
          defaultRole: 'viewer',
          requireApproval: true,
          maxMembers: 10,
          apiRateLimit: 1000
        }
      })
    }

    // Check if this is the first user in the organization
    const orgUserCount = await prisma.user.count({
      where: { organizationId: organization.id }
    })
    
    // Update user with organization
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        organizationId: organization.id,
        // Promote first user to admin
        role: orgUserCount === 0 ? UserRole.ADMIN : UserRole.USER
      }
    })

    return organization
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<UserWithOrganization | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { organization: true }
    })

    return user as UserWithOrganization | null
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<UserWithOrganization | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true }
    })

    return user as UserWithOrganization | null
  }

  /**
   * Update user profile
   */
  async updateUser(
    userId: string, 
    data: Partial<Pick<User, 'name' | 'image' | 'company' | 'department' | 'jobTitle'>>
  ): Promise<User> {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(
    userId: string, 
    newRole: UserRole, 
    adminUserId: string
  ): Promise<User> {
    // Check if admin has permission
    const adminUser = await prisma.user.findUnique({
      where: { id: adminUserId }
    })

    if (!adminUser || (adminUser.role !== UserRole.ADMIN && adminUser.role !== UserRole.SUPER_ADMIN)) {
      throw new Error('Insufficient permissions to update user role')
    }

    return await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    })
  }

  /**
   * Get organization members
   */
  async getOrganizationMembers(organizationId: string): Promise<User[]> {
    return await prisma.user.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' }
    })
  }

  /**
   * Check if user can perform action
   */
  async canUserPerform(
    userId: string, 
    action: 'manage_team' | 'manage_billing' | 'manage_api_keys' | 'view_analytics'
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) return false

    switch (action) {
      case 'manage_team':
        return user.role === UserRole.ADMIN || 
               user.role === UserRole.SUPER_ADMIN || 
               user.role === UserRole.MANAGER
      case 'manage_billing':
        return user.role === UserRole.ADMIN || 
               user.role === UserRole.SUPER_ADMIN
      case 'manage_api_keys':
        return user.role !== UserRole.VIEWER
      case 'view_analytics':
        return true // All users can view analytics
      default:
        return false
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<{
    totalApiCalls: number
    totalCost: number
    activeApiKeys: number
    lastActive: Date | null
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        usage: true,
        apiKeys: {
          where: { isActive: true }
        }
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const totalCost = user.usage.reduce((sum, u) => sum + u.cost, 0)
    const totalApiCalls = user.usage.length

    return {
      totalApiCalls,
      totalCost,
      activeApiKeys: user.apiKeys.length,
      lastActive: user.lastActiveAt
    }
  }
}

// Export singleton instance
export const userService = UserService.getInstance()