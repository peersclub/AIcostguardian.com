import crypto from 'crypto'

const algorithm = 'aes-256-gcm'

// Get the encryption key - required in production
function getSecretKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  
  if (!key) {
    // Only allow missing key in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  ENCRYPTION_KEY not set - using development key. NEVER use in production!')
      // Generate a consistent dev key based on a seed
      const devKey = crypto.createHash('sha256').update('dev-only-key-never-use-in-prod').digest()
      return devKey
    }
    
    // In production, throw an error if key is missing
    throw new Error('ENCRYPTION_KEY environment variable is required in production')
  }
  
  // Validate key format and length
  if (!/^[0-9a-f]{64}$/i.test(key)) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hexadecimal string (32 bytes)')
  }
  
  return Buffer.from(key, 'hex')
}

export function encrypt(text: string): string {
  try {
    if (!text) {
      throw new Error('Text to encrypt cannot be empty')
    }
    
    const secretKey = getSecretKey()
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

export function decrypt(encryptedData: string): string {
  try {
    if (!encryptedData) {
      throw new Error('Encrypted data cannot be empty')
    }
    
    const parts = encryptedData.split(':')
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format')
    }
    
    const secretKey = getSecretKey()
    const iv = Buffer.from(parts[0], 'hex')
    const authTag = Buffer.from(parts[1], 'hex')
    const encrypted = parts[2]
    
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv)
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

// Generate encryption key (run once and save to .env)
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Export aliases for the services that use these
export const encryptApiKey = encrypt
export const decryptApiKey = decrypt

// Hash sensitive data (one-way)
export function hash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}

// Generate secure random token
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

// Mask sensitive data for display
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (!data || data.length <= visibleChars * 2) {
    return '*'.repeat(data?.length || 0)
  }
  
  const start = data.substring(0, visibleChars)
  const end = data.substring(data.length - visibleChars)
  const masked = '*'.repeat(Math.max(8, data.length - visibleChars * 2))
  
  return `${start}${masked}${end}`
}

// Encrypt user tokens with expiration
export function encryptToken(token: string, expiresAt: Date): string {
  const payload = JSON.stringify({
    token,
    expiresAt: expiresAt.toISOString(),
  })
  
  return encrypt(payload)
}

// Decrypt and validate token
export function decryptToken(encryptedToken: string): { token: string; expiresAt: Date } | null {
  try {
    const decrypted = decrypt(encryptedToken)
    const payload = JSON.parse(decrypted)
    
    const expiresAt = new Date(payload.expiresAt)
    
    // Check if token has expired
    if (expiresAt < new Date()) {
      return null
    }
    
    return {
      token: payload.token,
      expiresAt,
    }
  } catch (error) {
    console.error('Token decryption failed:', error)
    return null
  }
}

// Secure comparison to prevent timing attacks
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

// Generate encrypted share link
export function generateShareLink(resourceId: string, expiresInHours: number = 24): string {
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + expiresInHours)
  
  const token = generateSecureToken()
  const payload = {
    resourceId,
    token,
    expiresAt: expiresAt.toISOString(),
  }
  
  const encrypted = encrypt(JSON.stringify(payload))
  return Buffer.from(encrypted).toString('base64url')
}

// Validate share link
export function validateShareLink(shareLink: string): { valid: boolean; resourceId?: string } {
  try {
    const encrypted = Buffer.from(shareLink, 'base64url').toString()
    const decrypted = decrypt(encrypted)
    const payload = JSON.parse(decrypted)
    
    const expiresAt = new Date(payload.expiresAt)
    
    if (expiresAt < new Date()) {
      return { valid: false }
    }
    
    return {
      valid: true,
      resourceId: payload.resourceId,
    }
  } catch (error) {
    console.error('Share link validation failed:', error)
    return { valid: false }
  }
}