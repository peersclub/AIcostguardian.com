'use client';

import { useState, useCallback, useEffect } from 'react';
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

export interface ThreadActions {
  threads: Thread[];
  currentThread: Thread | null;
  loading: boolean;
  loadThreads: () => Promise<void>;
  createThread: (title?: string) => Promise<Thread | null>;
  selectThread: (threadId: string) => Promise<void>;
  deleteThread: (threadId: string) => Promise<void>;
  pinThread: (threadId: string) => Promise<void>;
  archiveThread: (threadId: string) => Promise<void>;
  renameThread: (threadId: string, newTitle: string) => Promise<void>;
  shareThread: (threadId: string, options?: any) => Promise<{ shareUrl: string } | null>;
  addCollaborator: (threadId: string, email: string) => Promise<void>;
  removeCollaborator: (threadId: string, email: string) => Promise<void>;
  addTag: (threadId: string, tag: string) => Promise<void>;
  removeTag: (threadId: string, tag: string) => Promise<void>;
  searchThreads: (query: string) => Thread[];
}

export function useThreadManager(): ThreadActions {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load threads on mount
  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/aioptimise/threads?includeShared=true');
      if (!response.ok) throw new Error('Failed to load threads');
      
      const data = await response.json();
      const formattedThreads: Thread[] = data.threads.map((t: any) => ({
        ...t,
        tags: t.tags || [],
        sharedWith: t.sharedWith || [],
      }));
      
      setThreads(formattedThreads);
      
      // Auto-select first thread if none selected
      if (!currentThread && formattedThreads.length > 0) {
        setCurrentThread(formattedThreads[0]);
      }
    } catch (error) {
      console.error('Failed to load threads:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [currentThread]);

  const createThread = useCallback(async (title?: string) => {
    try {
      const response = await fetch('/api/aioptimise/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: title || `New Conversation ${new Date().toLocaleString()}`,
          metadata: { createdFrom: 'aioptimise-v2' }
        }),
      });

      if (!response.ok) throw new Error('Failed to create thread');

      const newThread = await response.json();
      const formattedThread: Thread = {
        ...newThread,
        tags: [],
        sharedWith: [],
      };
      
      setThreads(prev => [formattedThread, ...prev]);
      setCurrentThread(formattedThread);
      
      toast.success('New conversation created');
      return formattedThread;
    } catch (error) {
      console.error('Failed to create thread:', error);
      toast.error('Failed to create conversation');
      return null;
    }
  }, []);

  const selectThread = useCallback(async (threadId: string) => {
    const thread = threads.find(t => t.id === threadId);
    if (thread) {
      setCurrentThread(thread);
      
      // Load messages for this thread
      try {
        const response = await fetch(`/api/aioptimise/threads/${threadId}/messages`);
        if (response.ok) {
          const data = await response.json();
          // Update thread with latest message info
          setThreads(prev => prev.map(t => 
            t.id === threadId 
              ? { ...t, messageCount: data.messages.length, lastMessage: data.messages[data.messages.length - 1]?.content }
              : t
          ));
        }
      } catch (error) {
        console.error('Failed to load thread messages:', error);
      }
    }
  }, [threads]);

  const deleteThread = useCallback(async (threadId: string) => {
    try {
      const response = await fetch(`/api/aioptimise/threads/${threadId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete thread');

      setThreads(prev => prev.filter(t => t.id !== threadId));
      
      if (currentThread?.id === threadId) {
        const remainingThreads = threads.filter(t => t.id !== threadId);
        setCurrentThread(remainingThreads[0] || null);
      }

      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Failed to delete thread:', error);
      toast.error('Failed to delete conversation');
    }
  }, [currentThread, threads]);

  const pinThread = useCallback(async (threadId: string) => {
    try {
      const thread = threads.find(t => t.id === threadId);
      const isPinned = thread?.isPinned;
      
      const response = await fetch(`/api/aioptimise/threads/${threadId}/pin`, {
        method: isPinned ? 'DELETE' : 'POST',
      });

      if (!response.ok) throw new Error(`Failed to ${isPinned ? 'unpin' : 'pin'} thread`);

      setThreads(prev => prev.map(t => 
        t.id === threadId ? { ...t, isPinned: !isPinned } : t
      ));
      
      if (currentThread?.id === threadId) {
        setCurrentThread(prev => prev ? { ...prev, isPinned: !isPinned } : null);
      }

      toast.success(`Conversation ${isPinned ? 'unpinned' : 'pinned'}`);
    } catch (error) {
      console.error('Failed to pin/unpin thread:', error);
      toast.error('Failed to update pin status');
    }
  }, [threads, currentThread]);

  const archiveThread = useCallback(async (threadId: string) => {
    try {
      const thread = threads.find(t => t.id === threadId);
      const isArchived = thread?.isArchived;
      
      // For now, just update local state
      setThreads(prev => prev.map(t => 
        t.id === threadId ? { ...t, isArchived: !isArchived } : t
      ));
      
      toast.success(`Conversation ${isArchived ? 'unarchived' : 'archived'}`);
    } catch (error) {
      console.error('Failed to archive thread:', error);
      toast.error('Failed to archive conversation');
    }
  }, [threads]);

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
        setCurrentThread(prev => prev ? { ...prev, title: newTitle } : null);
      }

      toast.success('Conversation renamed');
    } catch (error) {
      console.error('Failed to rename thread:', error);
      toast.error('Failed to rename conversation');
    }
  }, [currentThread]);

  const shareThread = useCallback(async (threadId: string, options?: any) => {
    try {
      const response = await fetch(`/api/aioptimise/threads/${threadId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options || {}),
      });

      if (!response.ok) throw new Error('Failed to share thread');

      const data = await response.json();
      toast.success('Share link created');
      return data;
    } catch (error) {
      console.error('Failed to share thread:', error);
      toast.error('Failed to create share link');
      return null;
    }
  }, []);

  const addCollaborator = useCallback(async (threadId: string, email: string) => {
    try {
      const response = await fetch(`/api/aioptimise/threads/${threadId}/collaborators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: 'viewer' }),
      });

      if (!response.ok) throw new Error('Failed to add collaborator');

      setThreads(prev => prev.map(t => 
        t.id === threadId 
          ? { ...t, sharedWith: [...(t.sharedWith || []), email] }
          : t
      ));

      toast.success(`Added ${email} as collaborator`);
    } catch (error) {
      console.error('Failed to add collaborator:', error);
      toast.error('Failed to add collaborator');
    }
  }, []);

  const removeCollaborator = useCallback(async (threadId: string, email: string) => {
    try {
      const response = await fetch(`/api/aioptimise/threads/${threadId}/collaborators/${email}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove collaborator');

      setThreads(prev => prev.map(t => 
        t.id === threadId 
          ? { ...t, sharedWith: (t.sharedWith || []).filter(e => e !== email) }
          : t
      ));

      toast.success('Collaborator removed');
    } catch (error) {
      console.error('Failed to remove collaborator:', error);
      toast.error('Failed to remove collaborator');
    }
  }, []);

  const addTag = useCallback(async (threadId: string, tag: string) => {
    setThreads(prev => prev.map(t => 
      t.id === threadId 
        ? { ...t, tags: [...(t.tags || []), tag] }
        : t
    ));
    toast.success(`Tag "${tag}" added`);
  }, []);

  const removeTag = useCallback(async (threadId: string, tag: string) => {
    setThreads(prev => prev.map(t => 
      t.id === threadId 
        ? { ...t, tags: (t.tags || []).filter(tg => tg !== tag) }
        : t
    ));
    toast.success(`Tag "${tag}" removed`);
  }, []);

  const searchThreads = useCallback((query: string) => {
    if (!query) return threads;
    
    const lowerQuery = query.toLowerCase();
    return threads.filter(thread => 
      thread.title.toLowerCase().includes(lowerQuery) ||
      thread.lastMessage?.toLowerCase().includes(lowerQuery) ||
      thread.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }, [threads]);

  return {
    threads,
    currentThread,
    loading,
    loadThreads,
    createThread,
    selectThread,
    deleteThread,
    pinThread,
    archiveThread,
    renameThread,
    shareThread,
    addCollaborator,
    removeCollaborator,
    addTag,
    removeTag,
    searchThreads,
  };
}