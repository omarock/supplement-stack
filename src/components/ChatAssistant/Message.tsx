"use client";

import { TH, FONTS } from "@/lib/theme";
import Markdown from "./Markdown";

export type MessageRole = "user" | "assistant";
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  /** True while this assistant message is still streaming. */
  streaming?: boolean;
  /** True if this message errored out. */
  errored?: boolean;
}

interface Props {
  message: ChatMessage;
}

const MM = { fontFamily: FONTS.mono } as const;

export default function Message({ message }: Props) {
  if (message.role === "user") return <UserBubble content={message.content} />;
  return <AssistantBubble message={message} />;
}

function UserBubble({ content }: { content: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", paddingLeft: 36 }}>
      <div style={{
        background: TH.inkBg, color: "#fff",
        padding: "11px 15px", borderRadius: 18,
        borderBottomRightRadius: 6,
        maxWidth: "100%",
        fontSize: 14.5, lineHeight: 1.5,
        whiteSpace: "pre-wrap", wordBreak: "break-word",
        boxShadow: "0 1px 2px rgba(10,37,64,0.1)",
        animation: "sd-fade-in .25s ease-out",
      }}>
        {content}
      </div>
    </div>
  );
}

function AssistantBubble({ message }: { message: ChatMessage }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      animation: "sd-fade-in .25s ease-out",
    }}>
      <Avatar />
      <div style={{
        flex: 1, minWidth: 0,
        background: TH.surface, color: TH.ink,
        padding: "12px 14px", borderRadius: 18,
        borderTopLeftRadius: 6,
        border: `1px solid ${TH.edge}`,
        fontSize: 14.5, lineHeight: 1.55,
        wordBreak: "break-word",
        boxShadow: "0 1px 2px rgba(10,37,64,0.04)",
      }}>
        {message.content === "" && message.streaming ? (
          <TypingDots />
        ) : (
          <>
            <Markdown text={message.content} compact />
            {message.streaming && <Cursor />}
            {message.errored && (
              <div style={{
                marginTop: 8, padding: "6px 10px", background: "color-mix(in srgb, var(--c-destructive) 12%, transparent)",
                borderRadius: 8, color: "var(--c-destructive)", fontSize: 12.5,
              }}>
                Something went wrong. Try again in a moment.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <div aria-hidden style={{
      width: 30, height: 30, flexShrink: 0,
      borderRadius: 999,
      background: `linear-gradient(135deg, ${TH.sage} 0%, ${TH.sageDeep} 100%)`,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: 13, fontWeight: 700,
      letterSpacing: "-0.02em",
      boxShadow: "0 2px 6px rgba(63,122,82,0.3)",
      ...MM,
    }}>sd</div>
  );
}

function TypingDots() {
  return (
    <div aria-label="Assistant is thinking" style={{
      display: "inline-flex", gap: 4, alignItems: "center", padding: "4px 2px",
    }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: 999, background: TH.mutedDim,
          animation: `sd-typing 1.2s ease-in-out infinite ${i * 0.2}s`,
        }} />
      ))}
      <style>{`
        @keyframes sd-typing {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-2px); }
        }
      `}</style>
    </div>
  );
}

function Cursor() {
  return (
    <span aria-hidden style={{
      display: "inline-block", width: 6, height: 14,
      background: TH.sageDeep, marginLeft: 2, verticalAlign: "text-bottom",
      animation: "sd-cursor 1s steps(2, start) infinite",
      borderRadius: 1,
    }}>
      <style>{`
        @keyframes sd-cursor {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </span>
  );
}
