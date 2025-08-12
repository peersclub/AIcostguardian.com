import crypto from 'crypto'

// Ensure we have a valid 32-byte key for AES-256
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  
  if (!key) {
    // Only allow missing key in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  ENCRYPTION_KEY not set - using development key. NEVER use in production!')
      return crypto.createHash('sha256').update('dev-only-key-never-use-in-prod').digest()
    }
    
    // In production, throw an error if key is missing
    throw new Error('ENCRYPTION_KEY environment variable is required in production')
  }
  
  // Create a 32-byte key using SHA-256
  return crypto.createHash('sha256').update(key).digest()
}

const ENCRYPTION_KEY = getEncryptionKey()
const IV_LENGTH = 16
const ALGORITHM = 'aes-256-cbc'

export function encryptApiKey(text: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv)
    
    let encrypted = cipher.update(text, 'utf8')
    encrypted = Buffer.concat([encrypted, cipher.final()])
    
    return iv.toString('hex') + ':' + encrypted.toString('hex')
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt API key')
  }
}

export function decryptApiKey(text: string): string {
  try {
    const textParts = text.split(':')
    const iv = Buffer.from(textParts.shift()!, 'hex')
    const encryptedText = Buffer.from(textParts.join(':'), 'hex')
    
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv)
    
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    
    return decrypted.toString('utf8')
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt API key')
  }
}

// Keep the old names for backward compatibility
export const encrypt = encryptApiKey
export const decrypt = decryptApiKey