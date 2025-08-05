// File-based storage using dynamic imports for server-side only
let fs: any = null
let path: any = null

// Initialize fs and path only on server side
if (typeof window === 'undefined') {
  fs = require('fs')
  path = require('path')
}

// File-based storage for API keys (persists through Next.js hot reloads)
interface ApiKeyInfo {
  key: string
  lastUpdated: string
  lastTested?: string
  isAdmin?: boolean
}

interface UserApiKeys {
  userId: string
  apiKeys: {
    openai?: ApiKeyInfo
    claude?: ApiKeyInfo
    'claude-admin'?: ApiKeyInfo
    gemini?: ApiKeyInfo
    perplexity?: ApiKeyInfo
    grok?: ApiKeyInfo
  }
}

// Storage file path (in temp directory to avoid git tracking)
const getStorageFile = () => {
  if (!path) return null
  return path.join(process.cwd(), '.tmp', 'api-keys.json')
}

// Ensure storage directory exists
function ensureStorageDir(): void {
  if (!fs || !path) return
  const STORAGE_FILE = getStorageFile()
  if (!STORAGE_FILE) return
  
  const storageDir = path.dirname(STORAGE_FILE)
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true })
  }
}

// Load API keys from file
function loadApiKeys(): UserApiKeys[] {
  if (!fs) return []
  
  try {
    ensureStorageDir()
    const STORAGE_FILE = getStorageFile()
    if (!STORAGE_FILE) return []
    
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading API keys from file:', error)
  }
  return []
}

// Save API keys to file
function saveApiKeys(userApiKeys: UserApiKeys[]): void {
  if (!fs) return
  
  try {
    ensureStorageDir()
    const STORAGE_FILE = getStorageFile()
    if (!STORAGE_FILE) return
    
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(userApiKeys, null, 2))
  } catch (error) {
    console.error('Error saving API keys to file:', error)
  }
}

export function storeApiKey(userId: string, provider: string, apiKey: string, isAdmin: boolean = false): void {
  const userApiKeys = loadApiKeys()
  
  // Find existing user record
  let userRecord = userApiKeys.find(u => u.userId === userId)
  
  if (!userRecord) {
    // Create new user record
    userRecord = {
      userId,
      apiKeys: {}
    }
    userApiKeys.push(userRecord)
  }
  
  // Store the API key with metadata
  userRecord.apiKeys[provider as keyof typeof userRecord.apiKeys] = {
    key: apiKey,
    lastUpdated: new Date().toISOString(),
    lastTested: undefined,
    isAdmin
  }
  
  // Save to file
  saveApiKeys(userApiKeys)
  
  console.log(`Stored ${provider} API key for user: ${userId} (${isAdmin ? 'admin' : 'regular'})`)
}

export function getApiKey(userId: string, provider: string): string | undefined {
  const userApiKeys = loadApiKeys()
  const userRecord = userApiKeys.find(u => u.userId === userId)
  
  if (!userRecord) {
    console.log(`No user record found for userId: ${userId}`)
    return undefined
  }
  
  const apiKeyInfo = userRecord.apiKeys[provider as keyof typeof userRecord.apiKeys]
  
  // Handle both old format (string) and new format (ApiKeyInfo object)
  if (typeof apiKeyInfo === 'string') {
    console.log(`Retrieved ${provider} API key for user ${userId}: Found (legacy format)`)
    return apiKeyInfo
  } else if (apiKeyInfo && typeof apiKeyInfo === 'object' && 'key' in apiKeyInfo) {
    console.log(`Retrieved ${provider} API key for user ${userId}: Found`)
    return apiKeyInfo.key
  }
  
  console.log(`Retrieved ${provider} API key for user ${userId}: Not found`)
  return undefined
}

export function removeApiKey(userId: string, provider: string): void {
  const userApiKeys = loadApiKeys()
  const userRecord = userApiKeys.find(u => u.userId === userId)
  
  if (userRecord) {
    delete userRecord.apiKeys[provider as keyof typeof userRecord.apiKeys]
    saveApiKeys(userApiKeys)
  }
}

export function getAllApiKeys(userId: string): Record<string, string> {
  const userApiKeys = loadApiKeys()
  const userRecord = userApiKeys.find(u => u.userId === userId)
  
  if (!userRecord) {
    return {}
  }
  
  // Convert to simple key-value pairs for backward compatibility
  const result: Record<string, string> = {}
  for (const [provider, apiKeyInfo] of Object.entries(userRecord.apiKeys)) {
    if (apiKeyInfo) {
      if (typeof apiKeyInfo === 'string') {
        result[provider] = apiKeyInfo
      } else if ('key' in apiKeyInfo) {
        result[provider] = apiKeyInfo.key
      }
    }
  }
  
  return result
}

export function getAllApiKeysWithMetadata(userId: string): Record<string, ApiKeyInfo> {
  const userApiKeys = loadApiKeys()
  const userRecord = userApiKeys.find(u => u.userId === userId)
  
  if (!userRecord) {
    return {}
  }
  
  // Convert old format to new format if needed
  const result: Record<string, ApiKeyInfo> = {}
  for (const [provider, apiKeyInfo] of Object.entries(userRecord.apiKeys)) {
    if (apiKeyInfo) {
      if (typeof apiKeyInfo === 'string') {
        // Convert legacy format
        result[provider] = {
          key: apiKeyInfo,
          lastUpdated: new Date().toISOString(),
          isAdmin: false
        }
      } else {
        result[provider] = apiKeyInfo
      }
    }
  }
  
  return result
}

export function updateApiKeyLastTested(userId: string, provider: string): void {
  const userApiKeys = loadApiKeys()
  const userRecord = userApiKeys.find(u => u.userId === userId)
  
  if (userRecord && userRecord.apiKeys[provider as keyof typeof userRecord.apiKeys]) {
    const apiKeyInfo = userRecord.apiKeys[provider as keyof typeof userRecord.apiKeys]
    
    if (typeof apiKeyInfo === 'string') {
      // Convert legacy format
      userRecord.apiKeys[provider as keyof typeof userRecord.apiKeys] = {
        key: apiKeyInfo,
        lastUpdated: new Date().toISOString(),
        lastTested: new Date().toISOString(),
        isAdmin: false
      }
    } else if (apiKeyInfo && 'key' in apiKeyInfo) {
      apiKeyInfo.lastTested = new Date().toISOString()
    }
    
    saveApiKeys(userApiKeys)
    console.log(`Updated lastTested for ${provider} API key for user: ${userId}`)
  }
}