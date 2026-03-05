'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { cn } from '@/app/components/ui/utils';
import { useChat } from '../context/ChatContext';
import type { ChatMessage } from '../types';

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex w-full',
        isUser ? 'justify-end' : 'justify-start',
      )}
    >
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
          isUser
            ? 'rounded-br-sm bg-primary text-primary-foreground'
            : 'rounded-bl-sm bg-muted text-foreground',
        )}
      >
        {message.content}
      </div>
    </div>
  );
}

export function ChatPanel() {
  const { open, setOpen, messages, sendMessage, isLoading } = useChat();
  const [input, setInput] = React.useState('');
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    sendMessage(trimmed);
  }

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close chat"
        className="fixed inset-0 z-40 bg-overlay"
        onClick={() => setOpen(false)}
      />
      <div
        className="fixed bottom-20 right-6 z-50 flex h-[min(560px,80vh)] w-[380px] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-xl"
        role="dialog"
        aria-label="Chat"
      >
        <header className="flex flex-shrink-0 items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
          <h2 className="text-foreground font-semibold">AI Assistant</h2>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <X className="size-4" />
          </Button>
        </header>

        <ScrollArea className="flex-1 min-h-0">
          <div className="flex flex-col gap-3 px-4 py-4">
            {messages.length === 0 && (
              <p className="text-muted-foreground text-sm">
                Send a message to start. I'm a demo assistant with canned replies.
              </p>
            )}
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-bl-sm rounded-2xl bg-muted px-3 py-2 text-sm text-foreground">
                  ...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <form
          onSubmit={handleSubmit}
          className="flex flex-shrink-0 gap-2 border-t border-border bg-background p-3"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={isLoading || !input.trim()}>
            Send
          </Button>
        </form>
      </div>
    </>
  );
}
