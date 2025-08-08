import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

// Mock data store (in production, use a database)
const teamMembers = new Map<string, any[]>()

// Initialize with sample data
teamMembers.set('default', [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@assetworks.com',
    role: 'admin',
    status: 'active',
    joinedAt: new Date('2025-01-15'),
    lastActive: new Date(),
    usage: { totalCalls: 1250, totalCost: 45.67, thisMonth: 89 },
    company: 'AssetWorks'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@assetworks.com',
    role: 'manager',
    status: 'active',
    joinedAt: new Date('2025-02-01'),
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    usage: { totalCalls: 892, totalCost: 32.14, thisMonth: 67 },
    company: 'AssetWorks'
  }
])

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userCompany = session.user.company || 'default'
    const members = teamMembers.get(userCompany) || []

    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, role, message } = await request.json()

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      )
    }

    // Validate enterprise email domain
    const domain = email.split('@')[1]?.toLowerCase()
    const blockedDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com']
    
    if (blockedDomains.includes(domain)) {
      return NextResponse.json(
        { error: 'Enterprise email required. Personal email domains are not allowed.' },
        { status: 400 }
      )
    }

    const userCompany = session.user.company || 'default'
    const members = teamMembers.get(userCompany) || []

    // Check if user already exists
    if (members.find(member => member.email === email)) {
      return NextResponse.json(
        { error: 'User already exists in the team' },
        { status: 400 }
      )
    }

    // Create new team member
    const newMember = {
      id: Date.now().toString(),
      name: email.split('@')[0].split('.').map((s: string) => 
        s.charAt(0).toUpperCase() + s.slice(1)
      ).join(' '),
      email,
      role,
      status: 'pending',
      joinedAt: new Date(),
      lastActive: new Date(),
      usage: { totalCalls: 0, totalCost: 0, thisMonth: 0 },
      company: domain.charAt(0).toUpperCase() + domain.slice(1).replace('.com', ''),
      invitedBy: session.user.email,
      inviteMessage: message
    }

    members.push(newMember)
    teamMembers.set(userCompany, members)

    // In production, send email invitation here
    console.log(`Invitation sent to ${email} with role ${role}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Team member invited successfully',
      member: newMember
    })
  } catch (error) {
    console.error('Error inviting team member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { memberId, updates } = await request.json()

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    const userCompany = session.user.company || 'default'
    const members = teamMembers.get(userCompany) || []
    
    const memberIndex = members.findIndex(member => member.id === memberId)
    if (memberIndex === -1) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      )
    }

    // Update member
    members[memberIndex] = { ...members[memberIndex], ...updates }
    teamMembers.set(userCompany, members)

    return NextResponse.json({
      success: true,
      message: 'Team member updated successfully',
      member: members[memberIndex]
    })
  } catch (error) {
    console.error('Error updating team member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('id')

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    const userCompany = session.user.company || 'default'
    const members = teamMembers.get(userCompany) || []
    
    const memberIndex = members.findIndex(member => member.id === memberId)
    if (memberIndex === -1) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      )
    }

    // Remove member
    const removedMember = members.splice(memberIndex, 1)[0]
    teamMembers.set(userCompany, members)

    return NextResponse.json({
      success: true,
      message: 'Team member removed successfully',
      removedMember
    })
  } catch (error) {
    console.error('Error removing team member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}