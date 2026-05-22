"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Zap } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
              <Zap className="h-4 w-4 text-white" fill="white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              VitalStack
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#how-it-works"
              className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
            >
              How It Works
            </Link>
            <Link
              href="#benefits"
              className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
            >
              Benefits
            </Link>
            <Link
              href="/quiz"
              className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors duration-200"
            >
              Start Free Analysis
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden rounded-lg p-2 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 py-4 flex flex-col gap-3">
            <Link
              href="#how-it-works"
              className="px-2 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="#benefits"
              className="px-2 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Benefits
            </Link>
            <Link
              href="/quiz"
              className="mt-1 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white text-center hover:bg-emerald-400 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Start Free Analysis
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
