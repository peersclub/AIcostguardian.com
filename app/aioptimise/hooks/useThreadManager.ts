'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface ThreadActions {
  pinThread: (threadId: string) => Promise<void>;
  unpinThread: (threadId: string) => Promise<void>;
  deleteThread: (threadId: string) => Promise<void>;
  shareThread: (threadId: string, options?: any) => Promise<{ shareUrl: string }>;
  unshareThread: (threadId: string) => Promise<void>;
  addCollaborator: (threadId: string, email: string, role?: string) => Promise<void>;
  loadThreads: () => Promise<void>;
}

export function useThreadManager(
  threads: any[],
  setThreads: (threads: any[]) => void,
  currentThread: any,
  setCurrentThread: (thread: any) => void
): ThreadActions {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  const pinThread = useCallback(async (threadId: string) => {
    setLoading(prev => ({ ...prev, [threadId]: true }));
    try {
      const response = await fetch(`/api/aioptimise/threads/${threadId}/pin`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to pin thread');

      const updatedThread = await response.json();
      
      // Update local state
      setThreads(threads.map(t => 
        t.id === threadId ? { ...t, isPinned: true } : t
      ));
      
      if (currentThread?.id === threadId) {
        setCurrentThread({ ...currentThread, isPinned: true });
      }

      toast.success('Thread pinned successfully');
    } catch (error) {
      console.error('Failed to pin thread:', error);
      toast.error('Failed to pin thread');
    } finally {
      setLoading(prev => ({ ...prev, [threadId]: false }));
    }
  }, [threads, setThreads, currentThread, setCurrentThread]);

  const unpinThread = useCallback(async (threadId: string) => {
    setLoading(prev => ({ ...prev, [threadId]: true }));
    try {
      const response = await fetch(`/api/aioptimise/threads/${threadId}/pin`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to unpin thread');

      setThreads(threads.map(t => 
        t.id === threadId ? { ...t, isPinned: false } : t
      ));
      
      if (currentThread?.id === threadId) {
        setCurrentThread({ ...currentThread, isPinned: false });
      }

      toast.success('Thread unpinned successfully');
    } catch (error) {
      console.error('Failed to unpin thread:', error);
      toast.error('Failed to unpin thread');
    } finally {
      setLoading(prev => ({ ...prev, [threadId]: false }));
    }
  }, [threads, setThreads, currentThread, setCurrentThread]);

  const deleteThread = useCallback(async (threadId: string) => {
    // Show confirmation dialog
    if (!confirm('Are you sure you want to delete this thread? This action cannot be undone.')) {
      return;
    }

    setLoading(prev => ({ ...prev, [threadId]: true }));
    try {
      const response = await fetch(`/api/aioptimise/threads/${threadId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete thread');

      // Remove from local state
      setThreads(threads.filter(t => t.id !== threadId));
      
      // Clear current thread if it was deleted
      if (currentThread?.id === threadId) {
        setCurrentThread(null);
      }

      toast.success('Thread deleted successfully');
    } catch (error) {
      console.error('Failed to delete thread:', error);
      toast.error('Failed to delete thread');
    } finally {
      setLoading(prev => ({ ...prev, [threadId]: false }));
    }
  }, [threads, setThreads, currentThread, setCurrentThread]);

  const shareThread = useCallback(async (threadId: string, options?: any) => {
    setLoading(prev => ({ ...prev, [threadId]: true }));
    try {
      const response = await fetch(`/api/aioptimise/threads/${threadId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ options }),
      });

      if (!response.ok) throw new Error('Failed to share thread');

      const result = await response.json();
      
      // Update local state
      setThreads(threads.map(t => 
        t.id === threadId ? { ...t, isShared: true, shareId: result.thread.shareId } : t
      ));
      
      if (currentThread?.id === threadId) {
        setCurrentThread({ ...currentThread, isShared: true, shareId: result.thread.shareId });
      }

      // Copy share URL to clipboard
      await navigator.clipboard.writeText(result.shareUrl);
      toast.success('Thread shared! Link copied to clipboard');
      
      return { shareUrl: result.shareUrl };
    } catch (error) {
      console.error('Failed to share thread:', error);
      toast.error('Failed to share thread');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, [threadId]: false }));
    }
  }, [threads, setThreads, currentThread, setCurrentThread]);

  const unshareThread = useCallback(async (threadId: string) => {
    setLoading(prev => ({ ...prev, [threadId]: true }));
    try {
      const response = await fetch(`/api/aioptimise/threads/${threadId}/share`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to unshare thread');

      setThreads(threads.map(t => 
        t.id === threadId ? { ...t, isShared: false, shareId: null } : t
      ));
      
      if (currentThread?.id === threadId) {
        setCurrentThread({ ...currentThread, isShared: false, shareId: null });
      }

      toast.success('Thread sharing disabled');
    } catch (error) {
      console.error('Failed to unshare thread:', error);
      toast.error('Failed to unshare thread');
    } finally {
      setLoading(prev => ({ ...prev, [threadId]: false }));
    }
  }, [threads, setThreads, currentThread, setCurrentThread]);

  const addCollaborator = useCallback(async (threadId: string, email: string, role: string = 'VIEWER') => {
    setLoading(prev => ({ ...prev, [threadId]: true }));
    try {
      const response = await fetch(`/api/aioptimise/threads/${threadId}/collaborators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) throw new Error('Failed to add collaborator');

      toast.success(`Collaborator ${email} added successfully`);
    } catch (error) {
      console.error('Failed to add collaborator:', error);
      toast.error('Failed to add collaborator');
    } finally {
      setLoading(prev => ({ ...prev, [threadId]: false }));
    }
  }, []);

  const loadThreads = useCallback(async () => {
    try {
      const response = await fetch('/api/aioptimise/threads?includeShared=true');
      if (!response.ok) throw new Error('Failed to load threads');
      
      const data = await response.json();
      setThreads(data.threads);
    } catch (error) {
      console.error('Failed to load threads:', error);
      toast.error('Failed to load threads');
    }
  }, [setThreads]);

  return {
    pinThread,
    unpinThread,
    deleteThread,
    shareThread,
    unshareThread,
    addCollaborator,
    loadThreads,
  };
}