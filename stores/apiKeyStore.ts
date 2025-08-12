import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiKeyManager, ApiKey, KeyType, ValidationResult } from '@/lib/api-key-manager'
import { decrypt } from '@/lib/encryption'

interface KeyStatus {
  valid: boolean
  lastChecked: Date
  error?: string
  validKeys?: string[]
}

interface ApiKeyStore {
  // State
  keys: Map<string, ApiKey[]>
  status: Map<string, KeyStatus>
  lastCheck: Date | null
  isChecking: boolean
  
  // Computed
  hasValidKeys: boolean
  availableProviders: string[]
  
  // Actions
  addKey: (provider: string, key: ApiKey) => void
  removeKey: (provider: string, keyId: string) => void
  updateStatus: (provider: string, status: KeyStatus) => void
  getWorkingKey: (provider: string) => ApiKey | null
  hasValidKey: (provider: string) => boolean
  refreshAllKeys: (userId: string) => Promise<void>
  loadUserKeys: (userId: string) => Promise<void>
  clearKeys: () => void
  
  // Validation
  validateKey: (provider: string, key: string) => Promise<ValidationResult>
  validateAllKeys: (userId: string) => Promise<void>
}

export const useApiKeyStore = create<ApiKeyStore>()(
  persist(
    (set, get) => ({
      // Initial state
      keys: new Map(),
      status: new Map(),
      lastCheck: null,
      isChecking: false,
      hasValidKeys: false,
      availableProviders: [],
      
      // Add a new key
      addKey: (provider, key) => {
        set((state) => {
          const providerKeys = state.keys.get(provider) || []
          const newKeys = new Map(state.keys)
          newKeys.set(provider, [...providerKeys, key])
          
          // Update computed values
          const hasValid = Array.from(newKeys.values()).some(keys => 
            keys.some(k => k.isActive)
          )
          
          return { 
            keys: newKeys,
            hasValidKeys: hasValid
          }
        })
      },
      
      // Remove a key
      removeKey: (provider, keyId) => {
        set((state) => {
          const providerKeys = state.keys.get(provider) || []
          const filtered = providerKeys.filter(k => k.id !== keyId)
          const newKeys = new Map(state.keys)
          
          if (filtered.length > 0) {
            newKeys.set(provider, filtered)
          } else {
            newKeys.delete(provider)
          }
          
          // Update computed values
          const hasValid = Array.from(newKeys.values()).some(keys => 
            keys.some(k => k.isActive)
          )
          
          return { 
            keys: newKeys,
            hasValidKeys: hasValid
          }
        })
      },
      
      // Update provider status
      updateStatus: (provider, status) => {
        set((state) => {
          const newStatus = new Map(state.status)
          newStatus.set(provider, status)
          
          // Update available providers
          const available = Array.from(newStatus.entries())
            .filter(([_, s]) => s.valid)
            .map(([p]) => p)
          
          return { 
            status: newStatus,
            availableProviders: available
          }
        })
      },
      
      // Get first working key for a provider
      getWorkingKey: (provider) => {
        const state = get()
        const providerKeys = state.keys.get(provider) || []
        const status = state.status.get(provider)
        
        // Return first active key that's in the valid list
        return providerKeys.find(key => 
          key.isActive && (!status?.validKeys || status.validKeys.includes(key.id))
        ) || null
      },
      
      // Check if provider has valid key
      hasValidKey: (provider) => {
        return get().getWorkingKey(provider) !== null
      },
      
      // Load all keys for a user
      loadUserKeys: async (userId) => {
        set({ isChecking: true })
        
        try {
          const allKeys = await apiKeyManager.getKeys(userId)
          
          // Group keys by provider
          const keysByProvider = new Map<string, ApiKey[]>()
          for (const key of allKeys) {
            const provider = key.provider.toLowerCase()
            const existing = keysByProvider.get(provider) || []
            keysByProvider.set(provider, [...existing, key])
          }
          
          // Check which providers have valid keys
          const hasValid = allKeys.some(k => k.isActive)
          const available = Array.from(keysByProvider.keys()).filter(p => {
            const keys = keysByProvider.get(p)
            return keys?.some(k => k.isActive)
          })
          
          set({ 
            keys: keysByProvider,
            hasValidKeys: hasValid,
            availableProviders: available,
            isChecking: false
          })
        } catch (error) {
          console.error('Failed to load user keys:', error)
          set({ isChecking: false })
        }
      },
      
      // Refresh all key statuses
      refreshAllKeys: async (userId) => {
        set({ isChecking: true })
        
        try {
          // Reload keys from database
          await get().loadUserKeys(userId)
          
          // Validate all keys
          await get().validateAllKeys(userId)
          
          set({ 
            lastCheck: new Date(),
            isChecking: false
          })
        } catch (error) {
          console.error('Failed to refresh keys:', error)
          set({ isChecking: false })
        }
      },
      
      // Validate a single key
      validateKey: async (provider, key) => {
        return apiKeyManager.validateKey(provider, key)
      },
      
      // Validate all keys for a user
      validateAllKeys: async (userId) => {
        const state = get()
        const providers = Array.from(state.keys.keys())
        
        await Promise.all(
          providers.map(async (provider) => {
            try {
              const keys = state.keys.get(provider) || []
              const validKeys: string[] = []
              
              for (const key of keys) {
                const decryptedKey = decrypt(key.encryptedKey)
                const result = await apiKeyManager.validateKey(provider, decryptedKey)
                
                if (result.valid) {
                  validKeys.push(key.id)
                }
                
                // Update key status in database
                await fetch(`/api/api-keys/${key.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    isActive: result.valid,
                    lastTested: new Date()
                  })
                })
              }
              
              get().updateStatus(provider, {
                valid: validKeys.length > 0,
                lastChecked: new Date(),
                validKeys
              })
            } catch (error) {
              get().updateStatus(provider, {
                valid: false,
                lastChecked: new Date(),
                error: error instanceof Error ? error.message : 'Validation failed'
              })
            }
          })
        )
      },
      
      // Clear all keys (for logout)
      clearKeys: () => {
        set({
          keys: new Map(),
          status: new Map(),
          lastCheck: null,
          hasValidKeys: false,
          availableProviders: []
        })
      }
    }),
    {
      name: 'api-key-storage',
      partialize: (state) => ({
        // Only persist non-sensitive data
        status: Array.from(state.status.entries()),
        lastCheck: state.lastCheck,
        availableProviders: state.availableProviders,
        hasValidKeys: state.hasValidKeys
      }),
      onRehydrateStorage: () => (state) => {
        // Convert arrays back to Maps after rehydration
        if (state && state.status) {
          state.status = new Map(state.status as any)
        }
      }
    }
  )
)

// Selector hooks
export const useHasValidKeys = () => useApiKeyStore(state => state.hasValidKeys)
export const useAvailableProviders = () => useApiKeyStore(state => state.availableProviders)
export const useIsCheckingKeys = () => useApiKeyStore(state => state.isChecking)
export const useProviderStatus = (provider: string) => 
  useApiKeyStore(state => state.status.get(provider))
export const useHasProvider = (provider: string) => 
  useApiKeyStore(state => state.hasValidKey(provider))