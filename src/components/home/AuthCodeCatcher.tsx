"use client";

/**
 * Tiny client island: if Supabase auth routes back to "/?code=...", forward to
 * /auth/callback. Renders nothing. Lets the homepage itself stay a server
 * component instead of shipping the whole page as client just for this effect.
 */
import { useEffect } from "react";

export default function AuthCodeCatcher() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) window.location.replace(`/auth/callback?code=${encodeURIComponent(code)}`);
  }, []);
  return null;
}
