import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { getApiKeys, saveApiKey, deleteApiKey, getUserByEmail } from '@/lib/services/database'
import { withRateLimit, rateLimitConfigs } from '@/lib/middleware/rate-limit'
import { withCSRFProtection } from '@/lib/middleware/csrf'
import { withSecurityHeaders } from '@/lib/middleware/security-headers'
import { validateRequest, apiKeySchema } from '@/lib/validations/api'
import { 
  createAuditLog, 
  AuditAction, 
  AuditSeverity,
  logSecurityEvent 
} from '@/lib/services/audit-log'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET - Retrieve all API keys for the user (masked for security)
 * Security measures:
 * - Authentication required
 * - Rate limiting
 * - Security headers
 * - Audit logging
 */
export const GET = withSecurityHeaders(
  withRateLimit(
    async (request: NextRequest) => {
      try {
        // Authentication check
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
          await logSecurityEvent(
            AuditAction.INVALID_ACCESS_ATTEMPT,
            AuditSeverity.MEDIUM,
            { endpoint: '/api/settings/api-keys', method: 'GET' },
            request
          )
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user from database
        const user = await getUserByEmail(session.user.email)
        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Audit log for sensitive data access
        await createAuditLog({
          action: AuditAction.SENSITIVE_DATA_ACCESSED,
          severity: AuditSeverity.LOW,
          userId: user.id,
          targetType: 'ApiKeys',
          metadata: { action: 'list_api_keys' },
          success: true,
        })

        // Get all API keys for the user
        const apiKeys = await getApiKeys(user.id)

        // Format response as array for the frontend
        const formattedKeys = apiKeys.map((key: any) => ({
          id: key.id,
          name: `${key.provider} API Key`,
          provider: key.provider.toLowerCase(),
          key: '****************', // Fully masked for security
          masked: `${key.provider.slice(0, 4)}...****`,
          status: key.isActive ? 'active' : 'inactive',
          createdAt: key.createdAt.toISOString(),
          lastUsed: key.lastUsed ? key.lastUsed.toISOString() : null,
          usage: 0
        }))

        return NextResponse.json({ 
          success: true,
          keys: formattedKeys
        })
      } catch (error) {
        // Don't expose internal error details
        return NextResponse.json(
          { error: 'Failed to retrieve API keys' }, 
          { status: 500 }
        )
      }
    },
    rateLimitConfigs.apiKeys
  )
)

/**
 * POST - Save a new API key
 * Security measures:
 * - Authentication required
 * - CSRF protection
 * - Input validation
 * - Rate limiting
 * - Audit logging
 * - Security headers
 */
export const POST = withSecurityHeaders(
  withCSRFProtection(
    withRateLimit(
      async (request: NextRequest) => {
        try {
          // Authentication check
          const session = await getServerSession(authOptions)
          if (!session?.user?.email) {
            await logSecurityEvent(
              AuditAction.INVALID_ACCESS_ATTEMPT,
              AuditSeverity.HIGH,
              { endpoint: '/api/settings/api-keys', method: 'POST' },
              request
            )
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
          }

          // Get user from database
          const user = await getUserByEmail(session.user.email)
          if (!user || !user.organizationId) {
            return NextResponse.json({ error: 'User or organization not found' }, { status: 404 })
          }

          // Validate and sanitize input
          const { data, error } = await validateRequest(request, apiKeySchema)
          if (error || !data) {
            await createAuditLog({
              action: AuditAction.API_KEY_CREATED,
              severity: AuditSeverity.MEDIUM,
              userId: user.id,
              metadata: { error: error || 'Invalid input' },
              success: false,
              errorMessage: error,
            })
            return NextResponse.json({ error: error || 'Invalid input' }, { status: 400 })
          }

          const { provider, apiKey } = data

          // Save the API key
          await saveApiKey(user.id, provider, apiKey, user.organizationId)
          
          // Audit log successful creation
          await createAuditLog({
            action: AuditAction.API_KEY_CREATED,
            severity: AuditSeverity.MEDIUM,
            userId: user.id,
            targetType: 'ApiKey',
            metadata: { provider },
            success: true,
          })
          
          return NextResponse.json({ 
            success: true,
            message: `${provider} API key saved successfully`
          })
        } catch (error) {
          // Log the error but don't expose details
          await logSecurityEvent(
            AuditAction.SECURITY_ALERT,
            AuditSeverity.HIGH,
            { 
              endpoint: '/api/settings/api-keys',
              method: 'POST',
              error: error instanceof Error ? error.message : 'Unknown error'
            },
            request
          )
          
          return NextResponse.json(
            { error: 'Failed to save API key' }, 
            { status: 500 }
          )
        }
      },
      rateLimitConfigs.apiKeys
    )
  )
)

/**
 * DELETE - Delete an API key
 * Security measures:
 * - Authentication required
 * - CSRF protection
 * - Permission validation
 * - Rate limiting
 * - Audit logging
 * - Security headers
 */
export const DELETE = withSecurityHeaders(
  withCSRFProtection(
    withRateLimit(
      async (request: NextRequest) => {
        try {
          // Authentication check
          const session = await getServerSession(authOptions)
          if (!session?.user?.email) {
            await logSecurityEvent(
              AuditAction.INVALID_ACCESS_ATTEMPT,
              AuditSeverity.HIGH,
              { endpoint: '/api/settings/api-keys', method: 'DELETE' },
              request
            )
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
          }

          // Get user from database
          const user = await getUserByEmail(session.user.email)
          if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
          }

          const { searchParams } = new URL(request.url)
          const keyId = searchParams.get('id')
          const provider = searchParams.get('provider')

          if (!keyId && !provider) {
            return NextResponse.json({ error: 'Key ID or provider is required' }, { status: 400 })
          }

          // Verify ownership before deletion
          const apiKeys = await getApiKeys(user.id)
          const keyToDelete = apiKeys.find((k: any) => 
            k.id === keyId || k.provider.toLowerCase() === provider?.toLowerCase()
          )

          if (!keyToDelete) {
            await createAuditLog({
              action: AuditAction.API_KEY_DELETED,
              severity: AuditSeverity.HIGH,
              userId: user.id,
              targetId: keyId || provider || 'unknown',
              metadata: { error: 'Key not found or unauthorized' },
              success: false,
              errorMessage: 'Unauthorized deletion attempt',
            })
            return NextResponse.json({ error: 'API key not found' }, { status: 404 })
          }

          // Delete the key
          if (provider) {
            await deleteApiKey(user.id, provider)
          }

          // Audit log successful deletion
          await createAuditLog({
            action: AuditAction.API_KEY_DELETED,
            severity: AuditSeverity.MEDIUM,
            userId: user.id,
            targetId: keyToDelete.id,
            targetType: 'ApiKey',
            metadata: { provider: keyToDelete.provider },
            success: true,
          })

          return NextResponse.json({ 
            success: true,
            message: 'API key deleted successfully'
          })
        } catch (error) {
          // Log the error but don't expose details
          await logSecurityEvent(
            AuditAction.SECURITY_ALERT,
            AuditSeverity.HIGH,
            { 
              endpoint: '/api/settings/api-keys',
              method: 'DELETE',
              error: error instanceof Error ? error.message : 'Unknown error'
            },
            request
          )
          
          return NextResponse.json(
            { error: 'Failed to delete API key' }, 
            { status: 500 }
          )
        }
      },
      rateLimitConfigs.apiKeys
    )
  )
)