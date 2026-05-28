"use client";

import { useEffect, useRef } from "react";
import Message, { type ChatMessage } from "./Message";

interface Props {
  messages: ChatMessage[];
}

export default function Thread({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastLengthRef = useRef(0);

  // Auto-scroll to bottom when new content arrives, BUT only if user hasn't
  // scrolled up to read history. We detect "scrolled up" if they're more than
  // 80px from the bottom.
  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0);
    if (totalChars === lastLengthRef.current) return;
    lastLengthRef.current = totalChars;

    const distanceFromBottom = c.scrollHeight - c.scrollTop - c.clientHeight;
    if (distanceFromBottom < 120) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1, overflowY: "auto",
        padding: "16px 14px 8px",
        display: "flex", flexDirection: "column", gap: 14,
        scrollbarWidth: "thin",
      }}
    >
      {messages.map(m => <Message key={m.id} message={m} />)}
      <div ref={bottomRef} />
    </div>
  );
}
