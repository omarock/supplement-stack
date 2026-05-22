import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Brain,
  Sparkles,
  ShieldCheck,
  Target,
  Wallet,
  Clock,
  FlaskConical,
  Star,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">

        {/* Background glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute top-1/2 left-1/4 h-[400px] w-[400px] rounded-full bg-teal-500/5 blur-[100px]" />
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left — Copy */}
            <div className="flex flex-col gap-8">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 w-fit">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400 tracking-wide">
                  AI-Powered Wellness
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl font-bold leading-tight tracking-tight text-white">
                Your Personalized{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Supplement Stack
                </span>
                , Built by AI
              </h1>

              {/* Subheadline */}
              <p className="text-lg text-zinc-400 leading-relaxed max-w-lg">
                Answer 11 quick questions about your goals, lifestyle, and body. Our AI analyzes your unique profile and recommends the exact supplements you need — with science-backed explanations and a daily routine.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/quiz"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-8 py-4 text-base font-semibold text-white hover:bg-emerald-400 transition-colors duration-200"
                >
                  Start Free Analysis
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-colors duration-200"
                >
                  See How It Works
                </Link>
              </div>

              {/* Trust stats */}
              <div className="flex flex-wrap gap-6 pt-2">
                {[
                  { value: "10,000+", label: "Stacks Generated" },
                  { value: "100%", label: "Free to Use" },
                  { value: "2 min", label: "Quiz Duration" },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col">
                    <span className="text-xl font-bold text-white">{stat.value}</span>
                    <span className="text-xs text-zinc-500">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Preview Card */}
            <div className="hidden lg:flex justify-center">
              <div className="relative w-full max-w-sm">

                {/* Glow behind card */}
                <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 blur-2xl" />

                {/* Main card */}
                <div className="relative rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-widest">Your Results</p>
                      <p className="text-lg font-bold text-white mt-0.5">Wellness Stack</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                      <Sparkles className="h-5 w-5 text-emerald-400" />
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      { label: "Energy", score: 82 },
                      { label: "Sleep", score: 74 },
                      { label: "Focus", score: 78 },
                      { label: "Recovery", score: 88 },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl bg-zinc-800/60 p-3">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs text-zinc-400">{item.label}</span>
                          <span className="text-xs font-bold text-emerald-400">{item.score}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-zinc-700">
                          <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Morning stack */}
                  <div className="rounded-xl bg-zinc-800/60 p-4">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">
                      Morning Stack
                    </p>
                    <div className="flex flex-col gap-2">
                      {[
                        { name: "Vitamin D3", dose: "2000 IU" },
                        { name: "Omega-3", dose: "1000 mg" },
                        { name: "Magnesium", dose: "400 mg" },
                      ].map((sup) => (
                        <div key={sup.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-400" />
                            <span className="text-sm text-white">{sup.name}</span>
                          </div>
                          <span className="text-xs text-zinc-500">{sup.dose}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI badge */}
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                    <Brain className="h-4 w-4 text-emerald-400 shrink-0" />
                    <p className="text-xs text-emerald-300">
                      Personalized by AI based on your quiz answers
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-24 border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">

          {/* Section header */}
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">
              Simple Process
            </p>
            <h2 className="text-4xl font-bold text-white">
              Your stack in 3 simple steps
            </h2>
            <p className="mt-4 text-lg text-zinc-400 max-w-xl mx-auto">
              No doctor visits, no generic advice. Just a quick quiz and a fully personalized plan.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: ClipboardList,
                title: "Take the 2-Minute Quiz",
                description:
                  "Answer 11 questions about your age, goals, sleep, stress, diet, workout habits, and budget. No account required.",
              },
              {
                step: "02",
                icon: Brain,
                title: "AI Analyzes Your Profile",
                description:
                  "Our AI engine processes your answers and identifies the exact supplement gaps in your lifestyle and nutrition.",
              },
              {
                step: "03",
                icon: Sparkles,
                title: "Get Your Personalized Stack",
                description:
                  "Receive a full supplement stack with names, doses, timing, explanations, and a daily morning/evening routine.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative rounded-2xl border border-white/10 bg-zinc-900 p-8 hover:border-emerald-500/30 transition-colors duration-300"
              >
                <span className="text-5xl font-black text-zinc-800 select-none">
                  {item.step}
                </span>
                <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <item.icon className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA below steps */}
          <div className="mt-12 text-center">
            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-4 text-base font-semibold text-white hover:bg-emerald-400 transition-colors duration-200"
            >
              Start Free Analysis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── BENEFITS ─── */}
      <section id="benefits" className="py-24 border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">

          {/* Section header */}
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">
              Why VitalStack
            </p>
            <h2 className="text-4xl font-bold text-white">
              Built for real results
            </h2>
            <p className="mt-4 text-lg text-zinc-400 max-w-xl mx-auto">
              We cut through the noise and give you only what your body actually needs.
            </p>
          </div>

          {/* Benefits grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FlaskConical,
                title: "Science-Backed",
                description:
                  "Every recommendation is grounded in peer-reviewed research. We only suggest supplements with real evidence behind them.",
              },
              {
                icon: Target,
                title: "Fully Personalized",
                description:
                  "Your stack is unique to your goals, lifestyle, and biology. No generic one-size-fits-all recommendations.",
              },
              {
                icon: Wallet,
                title: "Budget-Friendly",
                description:
                  "Tell us your monthly budget and we'll prioritize the supplements that give you the most impact for your money.",
              },
              {
                icon: Clock,
                title: "Daily Routine Included",
                description:
                  "Know exactly when and how to take each supplement — a clear morning, afternoon, and evening schedule.",
              },
              {
                icon: ShieldCheck,
                title: "Safe & Transparent",
                description:
                  "Clear explanations for every recommendation. We explain what each supplement may support and why it's right for you.",
              },
              {
                icon: Star,
                title: "100% Free",
                description:
                  "Full personalized recommendations at no cost. No upsells during the quiz, no credit card required.",
              },
            ].map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl border border-white/10 bg-zinc-900 p-7 hover:border-emerald-500/30 transition-colors duration-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-5">
                  <benefit.icon className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-24 border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative rounded-3xl overflow-hidden">

            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-zinc-900" />
            <div className="absolute inset-0 border border-emerald-500/20 rounded-3xl" />

            <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">
              <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
                Ready to discover your <br />
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  perfect stack?
                </span>
              </h2>
              <p className="mt-6 text-lg text-zinc-400 max-w-xl mx-auto">
                Join thousands of people who've already optimized their wellness routine with AI-powered, personalized supplement recommendations.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/quiz"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-10 py-4 text-base font-semibold text-white hover:bg-emerald-400 transition-colors duration-200"
                >
                  Start Free Analysis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-6 text-xs text-zinc-600">
                Free forever · No account needed · Results in under 2 minutes
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
