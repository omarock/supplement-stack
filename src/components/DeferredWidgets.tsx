"use client";

import dynamic from "next/dynamic";

/**
 * Performance: the chat assistant and cookie banner are mounted on every page
 * but are never above-the-fold or LCP-critical. Loading them via next/dynamic
 * (ssr:false) splits their JS into a separate chunk fetched after hydration,
 * keeping the initial bundle + main thread free for the actual page.
 */
const ChatAssistant = dynamic(() => import("@/components/ChatAssistant"), { ssr: false });
const CookieConsent = dynamic(() => import("@/components/CookieConsent"), { ssr: false });

export default function DeferredWidgets() {
  return (
    <>
      <ChatAssistant />
      <CookieConsent />
    </>
  );
}
