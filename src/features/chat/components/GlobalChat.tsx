'use client';

import { ChatTrigger } from './ChatTrigger';
import { ChatPanel } from './ChatPanel';

export function GlobalChat() {
  return (
    <>
      <ChatTrigger />
      <ChatPanel />
    </>
  );
}
