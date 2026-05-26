import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
                <Zap className="h-4 w-4 text-white" fill="white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                VitalStack
              </span>
            </Link>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
              Evidence-based supplement recommendations personalized to your unique goals and lifestyle.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Product
            </p>
            <Link href="/quiz" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Start Free Analysis
            </Link>
            <Link href="#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors">
              How It Works
            </Link>
            <Link href="#benefits" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Benefits
            </Link>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Legal
            </p>
            <Link href="/privacy" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/disclaimer" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Medical Disclaimer
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 pt-8 border-t border-white/10">
          <p className="text-xs text-zinc-600 leading-relaxed">
            <span className="text-zinc-500 font-medium">Medical Disclaimer:</span> The information provided by VitalStack is for informational and educational purposes only. It is not intended as medical advice and should not be used to diagnose, treat, cure, or prevent any health condition. Always consult a qualified healthcare professional before starting any supplement regimen. Individual results may vary.
          </p>
          <p className="mt-4 text-xs text-zinc-600">
            © {new Date().getFullYear()} VitalStack. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
