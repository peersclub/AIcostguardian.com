import { decrypt } from './encryption'

/**
 * Helper function to safely decrypt API keys
 * Handles both encrypted and plain text keys for backward compatibility
 */
export function safeDecrypt(encryptedKey: string): string {
  if (!encryptedKey) {
    throw new Error('No key provided')
  }

  // First try to decrypt as encrypted format
  try {
    // Check if it's in the expected encrypted format (iv:authTag:encrypted)
    if (encryptedKey.includes(':')) {
      const parts = encryptedKey.split(':')
      if (parts.length === 3) {
        // Try to decrypt
        return decrypt(encryptedKey)
      }
    }
  } catch (error) {
    console.warn('Failed to decrypt as encrypted key, checking if plain text:', error)
  }

  // Check if it looks like a valid plain text API key
  if (encryptedKey.startsWith('sk-') ||        // OpenAI, Anthropic
      encryptedKey.startsWith('AIza') ||       // Google
      encryptedKey.startsWith('xai-') ||       // X.AI/Grok
      encryptedKey.startsWith('org-') ||       // OpenAI Org
      encryptedKey.includes('proj-') ||        // OpenAI Project keys
      encryptedKey.length > 20) {              // Likely a valid key
    // Return as-is (plain text key)
    console.warn('Using unencrypted API key - will be encrypted on next save')
    return encryptedKey
  }
  
  // Unknown format
  console.error('Unknown key format:', encryptedKey.substring(0, 10) + '...')
  throw new Error('Invalid API key format')
}