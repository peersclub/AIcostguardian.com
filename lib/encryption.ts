import crypto from 'crypto'

const algorithm = 'aes-256-gcm'

// Get the encryption key with fallback
function getSecretKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    console.warn('ENCRYPTION_KEY not found in environment, using fallback')
    // Use a consistent fallback for development
    return Buffer.from('b298211c4f63a69376c513c26de660b3d2f23a160b3c6d1fb4d9317bdac1a50f', 'hex')
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