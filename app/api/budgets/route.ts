import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { budgetService } from '@/lib/services/budget.service'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

const createBudgetSchema = z.object({
  organizationId: z.string(),
  name: z.string().min(1).max(100),
  amount: z.number().positive(),
  period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  alertThreshold: z.number().min(0).max(1).optional(),
  metadata: z.any().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!user?.organizationId) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 404 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') !== 'false'
    
    const budgets = await budgetService.getOrganizationBudgets(user.organizationId, activeOnly)
    
    return NextResponse.json(budgets)
    
  } catch (error) {
    console.error('Error in GET /api/budgets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const validatedData = createBudgetSchema.parse(body)
    
    // Verify user has permission to create budget for this organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!user || user.organizationId !== validatedData.organizationId) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }
    
    // Only ADMINs and MANAGERs can create budgets
    if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Only administrators and managers can create budgets' },
        { status: 403 }
      )
    }
    
    const budgetInput = {
      ...validatedData,
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined
    }
    
    const budget = await budgetService.createBudget(budgetInput)
    
    return NextResponse.json(budget, { status: 201 })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error in POST /api/budgets:', error)
    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const budgetId = searchParams.get('id')
    
    if (!budgetId) {
      return NextResponse.json(
        { error: 'Budget ID required' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    
    // Verify user has permission
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId }
    })
    
    if (!budget || !user || user.organizationId !== budget.organizationId) {
      return NextResponse.json(
        { error: 'Budget not found or permission denied' },
        { status: 404 }
      )
    }
    
    // Only ADMINs and MANAGERs can update budgets
    if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Only administrators and managers can update budgets' },
        { status: 403 }
      )
    }
    
    const updatedBudget = await budgetService.updateBudget(budgetId, body)
    
    return NextResponse.json(updatedBudget)
    
  } catch (error) {
    console.error('Error in PUT /api/budgets:', error)
    return NextResponse.json(
      { error: 'Failed to update budget' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const budgetId = searchParams.get('id')
    
    if (!budgetId) {
      return NextResponse.json(
        { error: 'Budget ID required' },
        { status: 400 }
      )
    }
    
    // Verify user has permission
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId }
    })
    
    if (!budget || !user || user.organizationId !== budget.organizationId) {
      return NextResponse.json(
        { error: 'Budget not found or permission denied' },
        { status: 404 }
      )
    }
    
    // Only ADMINs can delete budgets
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only administrators can delete budgets' },
        { status: 403 }
      )
    }
    
    await budgetService.deleteBudget(budgetId)
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error in DELETE /api/budgets:', error)
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 }
    )
  }
}