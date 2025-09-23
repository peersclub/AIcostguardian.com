import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'

interface Draft {
  id: string
  content: string
  threadId?: string
  selectedModel?: string
  selectedProvider?: string
  reminderAt?: string
  isReminded: boolean
  createdAt: string
  updatedAt: string
  thread?: {
    id: string
    title: string
  }
}

interface DraftManagerHook {
  drafts: Draft[]
  currentDraft: string
  isAutoSaving: boolean
  loadDrafts: () => Promise<void>
  saveDraft: (content: string, threadId?: string, options?: SaveDraftOptions) => Promise<void>
  deleteDraft: (draftId: string) => Promise<void>
  setCurrentDraft: (content: string) => void
  clearCurrentDraft: () => void
  restoreDraft: (draftId: string) => void
  setDraftReminder: (draftId: string, reminderAt: Date) => Promise<void>
}

interface SaveDraftOptions {
  selectedModel?: string
  selectedProvider?: string
  reminderAt?: Date
  immediate?: boolean
}

export function useDraftManager(threadId?: string): DraftManagerHook {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [currentDraft, setCurrentDraftState] = useState('')
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()
  const lastSavedContentRef = useRef('')

  // Load drafts on mount
  const loadDrafts = useCallback(async () => {
    try {
      const response = await fetch('/api/aioptimise/drafts')
      if (response.ok) {
        const data = await response.json()
        setDrafts(data.drafts)
      }
    } catch (error) {
      console.error('Error loading drafts:', error)
    }
  }, [])

  // Save draft to database
  const saveDraft = useCallback(async (
    content: string,
    draftThreadId?: string,
    options: SaveDraftOptions = {}
  ) => {
    if (!content.trim()) return

    try {
      setIsAutoSaving(true)
      const response = await fetch('/api/aioptimise/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          threadId: draftThreadId || threadId,
          selectedModel: options.selectedModel,
          selectedProvider: options.selectedProvider,
          reminderAt: options.reminderAt?.toISOString()
        })
      })

      if (response.ok) {
        const data = await response.json()

        // Update drafts list
        setDrafts(prev => {
          const existingIndex = prev.findIndex(d => d.id === data.draft.id)
          if (existingIndex >= 0) {
            const updated = [...prev]
            updated[existingIndex] = data.draft
            return updated
          } else {
            return [data.draft, ...prev]
          }
        })

        lastSavedContentRef.current = content

        if (options.immediate) {
          toast.success('Draft saved successfully')
        }
      } else {
        throw new Error('Failed to save draft')
      }
    } catch (error) {
      console.error('Error saving draft:', error)
      if (options.immediate) {
        toast.error('Failed to save draft')
      }
    } finally {
      setIsAutoSaving(false)
    }
  }, [threadId])

  // Delete draft
  const deleteDraft = useCallback(async (draftId: string) => {
    try {
      const response = await fetch(`/api/aioptimise/drafts?id=${draftId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setDrafts(prev => prev.filter(d => d.id !== draftId))
        toast.success('Draft deleted')
      } else {
        throw new Error('Failed to delete draft')
      }
    } catch (error) {
      console.error('Error deleting draft:', error)
      toast.error('Failed to delete draft')
    }
  }, [])

  // Set current draft with auto-save
  const setCurrentDraft = useCallback((content: string) => {
    setCurrentDraftState(content)

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // Only auto-save if content has changed and is not empty
    if (content.trim() && content !== lastSavedContentRef.current) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveDraft(content)
      }, 3000) // Auto-save after 3 seconds of inactivity
    }
  }, [saveDraft])

  // Clear current draft
  const clearCurrentDraft = useCallback(() => {
    setCurrentDraftState('')
    lastSavedContentRef.current = ''

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }
  }, [])

  // Restore draft to current input
  const restoreDraft = useCallback((draftId: string) => {
    const draft = drafts.find(d => d.id === draftId)
    if (draft) {
      setCurrentDraftState(draft.content)
      lastSavedContentRef.current = draft.content
      toast.success('Draft restored')
    }
  }, [drafts])

  // Set reminder for draft
  const setDraftReminder = useCallback(async (draftId: string, reminderAt: Date) => {
    try {
      const draft = drafts.find(d => d.id === draftId)
      if (!draft) return

      await saveDraft(draft.content, draft.threadId, {
        selectedModel: draft.selectedModel,
        selectedProvider: draft.selectedProvider,
        reminderAt,
        immediate: true
      })

      toast.success('Reminder set for draft')
    } catch (error) {
      console.error('Error setting draft reminder:', error)
      toast.error('Failed to set reminder')
    }
  }, [drafts, saveDraft])

  // Load drafts on mount
  useEffect(() => {
    loadDrafts()
  }, [loadDrafts])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [])

  // Auto-save current draft when component unmounts or threadId changes
  useEffect(() => {
    return () => {
      if (currentDraft.trim() && currentDraft !== lastSavedContentRef.current) {
        // Save immediately when unmounting
        saveDraft(currentDraft, threadId, { immediate: false })
      }
    }
  }, [currentDraft, threadId, saveDraft])

  return {
    drafts,
    currentDraft,
    isAutoSaving,
    loadDrafts,
    saveDraft,
    deleteDraft,
    setCurrentDraft,
    clearCurrentDraft,
    restoreDraft,
    setDraftReminder
  }
}