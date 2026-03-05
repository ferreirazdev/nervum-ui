'use client';

import * as React from 'react';
import type { ChatMessage } from '../types';
import { getMockReply } from '../mockChat';

type ChatContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  messages: ChatMessage[];
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
};

const ChatContext = React.createContext<ChatContextValue | null>(null);

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const sendMessage = React.useCallback(async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: trimmed,
      timestamp: nowIso(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const replyText = await getMockReply(trimmed);
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: replyText,
        timestamp: nowIso(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: ChatContextValue = {
    open,
    setOpen,
    messages,
    sendMessage,
    isLoading,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatContextValue {
  const ctx = React.useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
