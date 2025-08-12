import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const secretKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const salt = process.env.ENCRYPTION_SALT || 'ai-cost-guardian-salt';

// Derive a key from the secret
function deriveKey(secret: string): Buffer {
  return crypto.pbkdf2Sync(secret, salt, 100000, 32, 'sha256');
}

export async function encrypt(text: string): Promise<string> {
  try {
    const key = deriveKey(secretKey);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Combine iv, authTag, and encrypted data
    const combined = Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, 'hex')
    ]);
    
    return combined.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

export async function decrypt(encryptedText: string): Promise<string> {
  try {
    const key = deriveKey(secretKey);
    const combined = Buffer.from(encryptedText, 'base64');
    
    // Extract iv, authTag, and encrypted data
    const iv = combined.slice(0, 16);
    const authTag = combined.slice(16, 32);
    const encrypted = combined.slice(32);
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

// Hash function for sensitive data comparison
export function hashData(data: string): string {
  return crypto
    .createHash('sha256')
    .update(data + salt)
    .digest('hex');
}

// Verify hashed data
export function verifyHash(data: string, hash: string): boolean {
  return hashData(data) === hash;
}