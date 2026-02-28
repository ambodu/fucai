'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage, Conversation, ConversationMeta } from '@/types/ai';

const INDEX_KEY = 'cst-conversations-index';
const CONV_PREFIX = 'cst-conversation-';
const ACTIVE_KEY = 'cst-active-conversation';
const OLD_KEY = 'cst-chat-history';
const MAX_CONVERSATIONS = 50;

const WELCOME_MESSAGE: ChatMessage = {
  id: '0',
  role: 'assistant',
  content: `您好！我是福彩3D智能分析助手。我可以帮您：

- **查询数据**：号码频率、遗漏统计、和值分布等
- **分析走势**：冷热号码、形态趋势、跨度规律等
- **参考建议**：基于历史数据统计给出下期号码参考

请问有什么想了解的？`,
  timestamp: Date.now(),
};

function loadIndex(): ConversationMeta[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveIndex(index: ConversationMeta[]) {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
  } catch { /* ignore */ }
}

function loadConversation(id: string): Conversation | null {
  try {
    const raw = localStorage.getItem(CONV_PREFIX + id);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function saveConversation(conv: Conversation) {
  try {
    localStorage.setItem(CONV_PREFIX + conv.id, JSON.stringify(conv));
  } catch { /* ignore */ }
}

function deleteConversationData(id: string) {
  try {
    localStorage.removeItem(CONV_PREFIX + id);
  } catch { /* ignore */ }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function migrateOldData(): { index: ConversationMeta[]; activeId: string } | null {
  try {
    const old = localStorage.getItem(OLD_KEY);
    if (!old) return null;
    const messages = JSON.parse(old) as ChatMessage[];
    if (!Array.isArray(messages) || messages.length === 0) {
      localStorage.removeItem(OLD_KEY);
      return null;
    }

    const id = generateId();
    const now = Date.now();
    const firstUser = messages.find(m => m.role === 'user');
    const title = firstUser ? firstUser.content.slice(0, 20) : '历史对话';
    const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');

    const conv: Conversation = {
      id,
      title,
      createdAt: messages[0]?.timestamp || now,
      updatedAt: messages[messages.length - 1]?.timestamp || now,
      messages,
    };

    const meta: ConversationMeta = {
      id,
      title,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      messageCount: messages.length,
      preview: lastAssistant ? lastAssistant.content.slice(0, 50) : '',
    };

    saveConversation(conv);
    const index = [meta];
    saveIndex(index);
    localStorage.setItem(ACTIVE_KEY, id);
    localStorage.removeItem(OLD_KEY);

    return { index, activeId: id };
  } catch {
    return null;
  }
}

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationMeta[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [initialized, setInitialized] = useState(false);

  // Initialize
  useEffect(() => {
    // Try migration first
    const migrated = migrateOldData();
    if (migrated) {
      setConversations(migrated.index);
      setActiveConversationId(migrated.activeId);
      const conv = loadConversation(migrated.activeId);
      if (conv && conv.messages.length > 0) {
        setActiveMessages(conv.messages);
      }
      setInitialized(true);
      return;
    }

    // Load existing
    const index = loadIndex();
    setConversations(index.sort((a, b) => b.updatedAt - a.updatedAt));

    const savedActive = localStorage.getItem(ACTIVE_KEY);
    if (savedActive && index.some(c => c.id === savedActive)) {
      setActiveConversationId(savedActive);
      const conv = loadConversation(savedActive);
      if (conv && conv.messages.length > 0) {
        setActiveMessages(conv.messages);
      }
    } else if (index.length > 0) {
      const first = index[0];
      setActiveConversationId(first.id);
      localStorage.setItem(ACTIVE_KEY, first.id);
      const conv = loadConversation(first.id);
      if (conv && conv.messages.length > 0) {
        setActiveMessages(conv.messages);
      }
    }

    setInitialized(true);
  }, []);

  const createConversation = useCallback((): string => {
    const id = generateId();
    const now = Date.now();
    const conv: Conversation = {
      id,
      title: '新对话',
      createdAt: now,
      updatedAt: now,
      messages: [],
    };
    const meta: ConversationMeta = {
      id,
      title: '新对话',
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
      preview: '',
    };

    saveConversation(conv);

    setConversations(prev => {
      let updated = [meta, ...prev];
      // Enforce max
      if (updated.length > MAX_CONVERSATIONS) {
        const removed = updated.slice(MAX_CONVERSATIONS);
        removed.forEach(c => deleteConversationData(c.id));
        updated = updated.slice(0, MAX_CONVERSATIONS);
      }
      saveIndex(updated);
      return updated;
    });

    setActiveConversationId(id);
    setActiveMessages([WELCOME_MESSAGE]);
    localStorage.setItem(ACTIVE_KEY, id);

    return id;
  }, []);

  const switchConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    localStorage.setItem(ACTIVE_KEY, id);
    const conv = loadConversation(id);
    if (conv && conv.messages.length > 0) {
      setActiveMessages(conv.messages);
    } else {
      setActiveMessages([WELCOME_MESSAGE]);
    }
  }, []);

  const deleteConversation = useCallback((id: string) => {
    deleteConversationData(id);
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveIndex(updated);

      // If deleting active, switch to first remaining or create new
      if (id === activeConversationId) {
        if (updated.length > 0) {
          const next = updated[0];
          setActiveConversationId(next.id);
          localStorage.setItem(ACTIVE_KEY, next.id);
          const conv = loadConversation(next.id);
          if (conv && conv.messages.length > 0) {
            setActiveMessages(conv.messages);
          } else {
            setActiveMessages([WELCOME_MESSAGE]);
          }
        } else {
          setActiveConversationId(null);
          setActiveMessages([WELCOME_MESSAGE]);
          localStorage.removeItem(ACTIVE_KEY);
        }
      }

      return updated;
    });
  }, [activeConversationId]);

  const addMessage = useCallback((msg: ChatMessage) => {
    if (!activeConversationId) return;

    const conv = loadConversation(activeConversationId);
    if (!conv) return;

    conv.messages.push(msg);
    conv.updatedAt = Date.now();

    // Auto-title: first user message
    if (msg.role === 'user' && conv.title === '新对话') {
      conv.title = msg.content.slice(0, 20);
    }

    saveConversation(conv);
    setActiveMessages([...conv.messages]);

    // Update index
    setConversations(prev => {
      const lastAssistant = [...conv.messages].reverse().find(m => m.role === 'assistant');
      const updated = prev.map(c =>
        c.id === activeConversationId
          ? {
              ...c,
              title: conv.title,
              updatedAt: conv.updatedAt,
              messageCount: conv.messages.length,
              preview: lastAssistant ? lastAssistant.content.slice(0, 50) : c.preview,
            }
          : c
      ).sort((a, b) => b.updatedAt - a.updatedAt);
      saveIndex(updated);
      return updated;
    });
  }, [activeConversationId]);

  // Debounced save for streaming updates
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateMessage = useCallback((msgId: string, updates: Partial<ChatMessage>, flush = false) => {
    if (!activeConversationId) return;

    setActiveMessages(prev => {
      const idx = prev.findIndex(m => m.id === msgId);
      if (idx === -1) return prev;
      const updated = [...prev];
      updated[idx] = { ...updated[idx], ...updates };
      return updated;
    });

    // Debounced localStorage write — every 500ms during streaming, immediate on flush
    const doSave = () => {
      const conv = loadConversation(activeConversationId);
      if (!conv) return;
      const idx = conv.messages.findIndex((m: ChatMessage) => m.id === msgId);
      if (idx === -1) {
        // Message not in storage yet — find it from current state and push
        // This uses the functional form to read latest state
        setActiveMessages(current => {
          const msg = current.find(m => m.id === msgId);
          if (msg) {
            const c = loadConversation(activeConversationId);
            if (c && !c.messages.some((m: ChatMessage) => m.id === msgId)) {
              c.messages.push(msg);
              c.updatedAt = Date.now();
              saveConversation(c);
            }
          }
          return current; // no change to state
        });
      } else {
        setActiveMessages(current => {
          const msg = current.find(m => m.id === msgId);
          if (msg) {
            const c = loadConversation(activeConversationId);
            if (c) {
              const i = c.messages.findIndex((m: ChatMessage) => m.id === msgId);
              if (i !== -1) {
                c.messages[i] = msg;
                c.updatedAt = Date.now();
                saveConversation(c);
              }
            }
          }
          return current;
        });
      }

      // Update index
      setConversations(prev => {
        const conv2 = loadConversation(activeConversationId);
        if (!conv2) return prev;
        const lastAssistant = [...conv2.messages].reverse().find(m => m.role === 'assistant');
        return prev.map(c =>
          c.id === activeConversationId
            ? {
                ...c,
                updatedAt: conv2.updatedAt,
                messageCount: conv2.messages.length,
                preview: lastAssistant ? lastAssistant.content.slice(0, 50) : c.preview,
              }
            : c
        ).sort((a, b) => b.updatedAt - a.updatedAt);
      });
    };

    if (flush) {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      doSave();
    } else {
      if (!saveTimerRef.current) {
        saveTimerRef.current = setTimeout(() => {
          saveTimerRef.current = null;
          doSave();
        }, 500);
      }
    }
  }, [activeConversationId]);

  const clearActiveConversation = useCallback(() => {
    if (activeConversationId) {
      deleteConversationData(activeConversationId);
      setConversations(prev => {
        const updated = prev.filter(c => c.id !== activeConversationId);
        saveIndex(updated);
        return updated;
      });
    }
    // Create a new one
    const newId = generateId();
    const now = Date.now();
    const conv: Conversation = {
      id: newId,
      title: '新对话',
      createdAt: now,
      updatedAt: now,
      messages: [],
    };
    const meta: ConversationMeta = {
      id: newId,
      title: '新对话',
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
      preview: '',
    };

    saveConversation(conv);
    setConversations(prev => {
      const updated = [meta, ...prev];
      saveIndex(updated);
      return updated;
    });
    setActiveConversationId(newId);
    setActiveMessages([WELCOME_MESSAGE]);
    localStorage.setItem(ACTIVE_KEY, newId);
  }, [activeConversationId]);

  return {
    conversations,
    activeConversationId,
    activeMessages,
    initialized,
    createConversation,
    switchConversation,
    deleteConversation,
    addMessage,
    updateMessage,
    clearActiveConversation,
  };
}
