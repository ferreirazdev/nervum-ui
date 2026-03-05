'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useChat } from '../context/ChatContext';

export function ChatTrigger() {
  const { setOpen } = useChat();

  return (
    <Button
      variant="default"
      size="icon"
      className="fixed bottom-4 right-4 z-50 size-12 rounded-full shadow-lg"
      onClick={() => setOpen(true)}
      aria-label="Open chat"
    >
      <MessageCircle className="size-6" />
    </Button>
  );
}
