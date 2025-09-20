import { PrismaClient } from '@prisma/client'
import { UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function seedDepartments() {
  try {
    console.log('🌱 Starting department seeding...')

    // Get the first organization (assuming we're working with an existing one)
    const organization = await prisma.organization.findFirst({
      include: { users: true }
    })

    if (!organization) {
      console.error('❌ No organization found. Please create an organization first.')
      return
    }

    console.log(`✅ Found organization: ${organization.name}`)

    // Create the 3 departments
    const departments = [
      {
        name: 'C-Suite',
        slug: 'c-suite',
        description: 'Executive leadership and strategic decision making',
        color: '#dc2626', // Red
        icon: 'crown',
        monthlyBudget: 5000,
        spendingLimit: 7500
      },
      {
        name: 'Marketing',
        slug: 'marketing',
        description: 'Marketing, content creation, and customer engagement',
        color: '#7c3aed', // Purple
        icon: 'megaphone',
        monthlyBudget: 3000,
        spendingLimit: 4500
      },
      {
        name: 'Tech',
        slug: 'tech',
        description: 'Engineering, development, and technical operations',
        color: '#059669', // Green
        icon: 'code',
        monthlyBudget: 8000,
        spendingLimit: 10000
      }
    ]

    // Create departments
    const createdDepartments = []
    for (const dept of departments) {
      const existingDept = await prisma.department.findFirst({
        where: {
          organizationId: organization.id,
          slug: dept.slug
        }
      })

      if (existingDept) {
        console.log(`⚠️  Department ${dept.name} already exists, skipping...`)
        createdDepartments.push(existingDept)
        continue
      }

      const created = await prisma.department.create({
        data: {
          ...dept,
          organizationId: organization.id
        }
      })

      console.log(`✅ Created department: ${created.name}`)
      createdDepartments.push(created)
    }

    // Create department budgets
    for (const dept of createdDepartments) {
      const existingBudget = await prisma.budget.findFirst({
        where: {
          departmentId: dept.id,
          period: 'MONTHLY',
          isActive: true
        }
      })

      if (existingBudget) {
        console.log(`⚠️  Budget for ${dept.name} already exists, skipping...`)
        continue
      }

      await prisma.budget.create({
        data: {
          name: `${dept.name} Monthly Budget`,
          amount: dept.monthlyBudget || 1000,
          period: 'MONTHLY',
          startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
          organizationId: organization.id,
          departmentId: dept.id,
          alertThreshold: 0.8,
          isActive: true
        }
      })

      console.log(`✅ Created budget for department: ${dept.name}`)
    }

    // Create sample users for each department if there are existing users to assign
    const existingUsers = await prisma.user.findMany({
      where: {
        organizationId: organization.id
      }
    })

    if (existingUsers.length > 0) {
      // Assign existing users to departments
      const assignments = [
        { departmentSlug: 'c-suite', userCount: 1, role: UserRole.ADMIN },
        { departmentSlug: 'marketing', userCount: 2, role: UserRole.EDITOR },
        { departmentSlug: 'tech', userCount: Math.max(1, existingUsers.length - 3), role: UserRole.EDITOR }
      ]

      let userIndex = 0
      for (const assignment of assignments) {
        const department = createdDepartments.find(d => d.slug === assignment.departmentSlug)
        if (!department) continue

        const usersToAssign = existingUsers.slice(userIndex, userIndex + assignment.userCount)

        for (const user of usersToAssign) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              departmentId: department.id,
              role: assignment.role,
              jobTitle: getDemoJobTitle(assignment.departmentSlug)
            }
          })

          console.log(`✅ Assigned ${user.name || user.email} to ${department.name}`)
        }

        // Set first user of C-Suite as department manager
        if (assignment.departmentSlug === 'c-suite' && usersToAssign.length > 0) {
          await prisma.department.update({
            where: { id: department.id },
            data: { managerId: usersToAssign[0].id }
          })
          console.log(`✅ Set ${usersToAssign[0].name || usersToAssign[0].email} as manager of ${department.name}`)
        }

        userIndex += assignment.userCount
      }
    }

    // Create sample usage logs for each department
    const models = ['gpt-4o', 'claude-3-5-sonnet-20241022', 'gemini-pro', 'grok-2-latest']
    const providers = ['openai', 'anthropic', 'google', 'xai']

    const users = await prisma.user.findMany({
      where: {
        organizationId: organization.id,
        departmentId: { not: null }
      },
      include: { department: true }
    })

    if (users.length > 0) {
      console.log('🔥 Creating sample usage logs...')

      // Generate usage logs for the past 30 days
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago

      for (let i = 0; i < 200; i++) { // Create 200 sample logs
        const randomUser = users[Math.floor(Math.random() * users.length)]
        const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()))
        const randomProvider = providers[Math.floor(Math.random() * providers.length)]
        const randomModel = models[Math.floor(Math.random() * models.length)]

        // Generate realistic token counts based on department
        const baseTokens = getDepartmentTokenUsage(randomUser.department?.slug || 'tech')
        const promptTokens = Math.floor(baseTokens * (0.3 + Math.random() * 0.4)) // 30-70% prompt
        const completionTokens = Math.floor(baseTokens * (0.3 + Math.random() * 0.7)) // 30-100% completion
        const totalTokens = promptTokens + completionTokens

        // Calculate cost based on provider and model
        const cost = calculateTokenCost(randomProvider, totalTokens)

        await prisma.usageLog.create({
          data: {
            provider: randomProvider,
            model: randomModel,
            promptTokens,
            completionTokens,
            totalTokens,
            cost,
            timestamp: randomDate,
            userId: randomUser.id,
            organizationId: organization.id,
            departmentId: randomUser.departmentId,
            metadata: {
              operation: getRandomOperation(randomUser.department?.slug),
              responseTime: Math.floor(200 + Math.random() * 2000),
              success: Math.random() > 0.05 // 95% success rate
            }
          }
        })

        if (i % 50 === 0) {
          console.log(`⚡ Created ${i + 1} usage logs...`)
        }
      }

      console.log('✅ Created 200 sample usage logs')
    }

    console.log('🎉 Department seeding completed successfully!')

  } catch (error) {
    console.error('❌ Error seeding departments:', error)
  } finally {
    await prisma.$disconnect()
  }
}

function getDemoJobTitle(departmentSlug: string): string {
  const titles = {
    'c-suite': ['CEO', 'CTO', 'CFO', 'Chief Strategy Officer'][Math.floor(Math.random() * 4)],
    'marketing': ['Marketing Manager', 'Content Strategist', 'Brand Manager', 'Marketing Analyst'][Math.floor(Math.random() * 4)],
    'tech': ['Senior Developer', 'Full Stack Engineer', 'DevOps Engineer', 'Technical Lead'][Math.floor(Math.random() * 4)]
  }
  return titles[departmentSlug as keyof typeof titles] || 'Team Member'
}

function getDepartmentTokenUsage(departmentSlug: string): number {
  // Different departments have different typical usage patterns
  const baseUsage = {
    'c-suite': 3000, // Longer strategic content
    'marketing': 2500, // Marketing copy and content
    'tech': 4000 // Code generation and technical content
  }
  return baseUsage[departmentSlug as keyof typeof baseUsage] || 2000
}

function getRandomOperation(departmentSlug?: string): string {
  const operations = {
    'c-suite': ['strategy_analysis', 'market_research', 'financial_planning', 'board_presentation'],
    'marketing': ['content_creation', 'ad_copy', 'social_media', 'campaign_planning'],
    'tech': ['code_generation', 'code_review', 'documentation', 'debugging', 'api_design']
  }

  const deptOperations = operations[departmentSlug as keyof typeof operations] || operations.tech
  return deptOperations[Math.floor(Math.random() * deptOperations.length)]
}

function calculateTokenCost(provider: string, totalTokens: number): number {
  // Simplified cost calculation based on provider
  const rates = {
    'openai': 0.00003,    // $0.03 per 1K tokens
    'anthropic': 0.000025, // $0.025 per 1K tokens
    'google': 0.00002,    // $0.02 per 1K tokens
    'xai': 0.000035       // $0.035 per 1K tokens
  }

  const rate = rates[provider as keyof typeof rates] || 0.00003
  return Math.round((totalTokens * rate) * 10000) / 10000 // Round to 4 decimal places
}

// Run the seeding
if (require.main === module) {
  seedDepartments()
}