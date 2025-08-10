import prisma from '@/lib/prisma'
import { Session } from 'next-auth'

/**
 * Ensures a user exists in the database, creating them if necessary
 * This handles the case where NextAuth creates a session but not a database user
 */
export async function ensureUserExists(session: Session) {
  if (!session?.user?.email) {
    throw new Error('No email in session')
  }

  // Try to find existing user
  let user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { organization: true }
  })

  if (user) {
    // Ensure user has organization
    if (!user.organizationId) {
      const organization = await ensureOrganizationExists(session.user.email)
      user = await prisma.user.update({
        where: { id: user.id },
        data: { organizationId: organization.id },
        include: { organization: true }
      })
    }
    return user
  }

  // Create new user with organization
  const organization = await ensureOrganizationExists(session.user.email)
  const company = session.user.email.split('@')[1]?.split('.')[0] || 'default'

  user = await prisma.user.create({
    data: {
      email: session.user.email,
      name: session.user.name || session.user.email.split('@')[0],
      image: session.user.image,
      company,
      role: 'USER',
      organizationId: organization.id,
    },
    include: { organization: true }
  })

  return user
}

/**
 * Ensures an organization exists for the given email domain
 */
async function ensureOrganizationExists(email: string) {
  const domain = email.split('@')[1]
  const company = domain?.split('.')[0] || 'default'

  // Try to find existing organization
  let organization = await prisma.organization.findFirst({
    where: {
      OR: [
        { domain: domain },
        { name: company }
      ]
    }
  })

  if (organization) {
    return organization
  }

  // Create new organization
  organization = await prisma.organization.create({
    data: {
      name: company,
      domain: domain,
      subscription: 'FREE'
    }
  })

  return organization
}

/**
 * Gets a user by email, optionally creating them if they don't exist
 */
export async function getUserByEmailOrCreate(email: string, session?: Session) {
  let user = await prisma.user.findUnique({
    where: { email },
    include: { organization: true, apiKeys: true }
  })

  if (!user && session) {
    const createdUser = await ensureUserExists(session)
    // Reload with apiKeys included
    user = await prisma.user.findUnique({
      where: { id: createdUser.id },
      include: { organization: true, apiKeys: true }
    })
  }

  return user
}