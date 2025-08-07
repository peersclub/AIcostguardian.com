import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: {
    serialize?: (value: T) => string
    deserialize?: (value: string) => T
  }
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const serialize = options?.serialize || JSON.stringify
  const deserialize = options?.deserialize || JSON.parse

  // Get initial value from localStorage or use provided initial value
  const getStoredValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? deserialize(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  }

  const [storedValue, setStoredValue] = useState<T>(getStoredValue)

  // Update localStorage when value changes
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        
        setStoredValue(valueToStore)
        
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, serialize(valueToStore))
          
          // Dispatch storage event for other tabs/windows
          window.dispatchEvent(
            new StorageEvent('storage', {
              key,
              newValue: serialize(valueToStore),
              storageArea: window.localStorage,
            })
          )
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, serialize, storedValue]
  )

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
        
        // Dispatch storage event for other tabs/windows
        window.dispatchEvent(
          new StorageEvent('storage', {
            key,
            newValue: null,
            storageArea: window.localStorage,
          })
        )
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  // Listen for changes in other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(deserialize(e.newValue))
        } catch (error) {
          console.error(`Error parsing localStorage change for key "${key}":`, error)
        }
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(initialValue)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [key, deserialize, initialValue])

  return [storedValue, setValue, removeValue]
}