'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface Thread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage?: string;
  isPinned?: boolean;
  isArchived?: boolean;
  sharedWith?: string[];
  tags?: string[];
  metadata?: any;
}

export interface ThreadManagerReturn {
  threads: Thread[];
  currentThread: Thread | null;
  loading: boolean;
  createThread: (title?: string) => Promise<Thread | null>;
  selectThread: (threadId: string) => void;
  deleteThread: (threadId: string) => Promise<void>;
  pinThread: (threadId: string) => Promise<void>;
  archiveThread: (threadId: string) => Promise<void>;
  renameThread: (threadId: string, newTitle: string) => Promise<void>;
  shareThread: (threadId: string, settings?: any) => Promise<{ shareUrl: string } | null>;
  addCollaborator: (threadId: string, email: string, role?: string) => Promise<void>;
  searchThreads: (query: string) => Thread[];
  loadThreads: () => Promise<void>;
}

export function useThreadManager(): ThreadManagerReturn {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(false);

  const loadThreads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/aioptimise/threads?includeShared=true');
      if (!response.ok) throw new Error('Failed to load threads');

      const data = await response.json();
      setThreads(data.threads || []);
    } catch (error) {
      console.error('Failed to load threads:', error);
      toast.error('Failed to load threads');
    } finally {
      setLoading(false);
    }
  }, []);

  const createThread = useCallback(async (title?: string): Promise<Thread | null> => {
    try {
      const response = await fetch('/api/aioptimise/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'New Conversation',
        }),
      });

      if (!response.ok) throw new Error('Failed to create thread');

      const newThread = await response.json();
      setThreads(prev => [newThread, ...prev]);
      setCurrentThread(newThread);
      toast.success('New conversation created');
      return newThread;
    } catch (error) {
      console.error('Failed to create thread:', error);
      toast.error('Failed to create thread');
      return null;
    }
  }, []);

  const selectThread = useCallback((threadId: string) => {
    const thread = threads.find(t => t.id === threadId);
    if (thread) {
      setCurrentThread(thread);
    }
  }, [threads]);

  const deleteThread = useCallback(async (threadId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/aioptimise/threads/${threadId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete thread');

      setThreads(prev => prev.filter(t => t.id !== threadId));

      if (currentThread?.id === threadId) {
        setCurrentThread(null);
      }

      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Failed to delete thread:', error);
      toast.error('Failed to delete thread');
    } finally {
      setLoading(false);
    }
  }, [currentThread]);

  const pinThread = useCallback(async (threadId: string) => {
    try {
      const thread = threads.find(t => t.id === threadId);
      if (!thread) return;

      const method = thread.isPinned ? 'DELETE' : 'POST';
      const response = await fetch(`/api/aioptimise/threads/${threadId}/pin`, {
        method,
      });

      if (!response.ok) throw new Error('Failed to update pin status');

      const isPinned = !thread.isPinned;
      setThreads(prev => prev.map(t =>
        t.id === threadId ? { ...t, isPinned } : t
      ));

      if (currentThread?.id === threadId) {
        setCurrentThread({ ...currentThread, isPinned });
      }

      toast.success(isPinned ? 'Conversation pinned' : 'Conversation unpinned');
    } catch (error) {
      console.error('Failed to pin thread:', error);
      toast.error('Failed to update pin status');
    }
  }, [threads, currentThread]);

  const archiveThread = useCallback(async (threadId: string) => {
    try {
      const thread = threads.find(t => t.id === threadId);
      if (!thread) return;

      const response = await fetch(`/api/aioptimise/threads/${threadId}/archive`, {
        method: thread.isArchived ? 'DELETE' : 'POST',
      });

      if (!response.ok) throw new Error('Failed to update archive status');

      const isArchived = !thread.isArchived;
      setThreads(prev => prev.map(t =>
        t.id === threadId ? { ...t, isArchived } : t
      ));

      if (currentThread?.id === threadId) {
        setCurrentThread({ ...currentThread, isArchived });
      }

      toast.success(isArchived ? 'Conversation archived' : 'Conversation unarchived');
    } catch (error) {
      console.error('Failed to archive thread:', error);
      toast.error('Failed to update archive status');
    }
  }, [threads, currentThread]);

  const renameThread = useCallback(async (threadId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/aioptimise/threads/${threadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) throw new Error('Failed to rename thread');

      setThreads(prev => prev.map(t =>
        t.id === threadId ? { ...t, title: newTitle } : t
      ));

      if (currentThread?.id === threadId) {
        setCurrentThread({ ...currentThread, title: newTitle });
      }

      toast.success('Conversation renamed');
    } catch (error) {
      console.error('Failed to rename thread:', error);
      toast.error('Failed to rename thread');
    }
  }, [currentThread]);

  const shareThread = useCallback(async (threadId: string, settings?: any): Promise<{ shareUrl: string } | null> => {
    try {
      const response = await fetch(`/api/aioptimise/threads/${threadId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      if (!response.ok) throw new Error('Failed to share thread');

      const result = await response.json();

      setThreads(prev => prev.map(t =>
        t.id === threadId ? { ...t, sharedWith: result.sharedWith || [] } : t
      ));

      if (currentThread?.id === threadId) {
        setCurrentThread({ ...currentThread, sharedWith: result.sharedWith || [] });
      }

      return { shareUrl: result.shareUrl };
    } catch (error) {
      console.error('Failed to share thread:', error);
      toast.error('Failed to share thread');
      return null;
    }
  }, [currentThread]);

  const addCollaborator = useCallback(async (threadId: string, email: string, role: string = 'VIEWER') => {
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
    }
  }, []);

  const searchThreads = useCallback((query: string): Thread[] => {
    if (!query.trim()) return threads;

    const lowercaseQuery = query.toLowerCase();
    return threads.filter(thread =>
      thread.title.toLowerCase().includes(lowercaseQuery) ||
      thread.lastMessage?.toLowerCase().includes(lowercaseQuery) ||
      thread.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }, [threads]);

  return {
    threads,
    currentThread,
    loading,
    createThread,
    selectThread,
    deleteThread,
    pinThread,
    archiveThread,
    renameThread,
    shareThread,
    addCollaborator,
    searchThreads,
    loadThreads,
  };
}