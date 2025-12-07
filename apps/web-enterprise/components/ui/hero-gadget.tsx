"use client";

export function HeroGadget() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Enhanced animated gradient orbs */}
      <div className="absolute left-1/2 top-0 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-emerald-300/30 blur-3xl dark:bg-emerald-900/30 animate-pulse-glow" />
      <div className="absolute right-10 top-10 h-60 w-60 rounded-full bg-cyan-300/30 blur-2xl dark:bg-cyan-900/30 animate-float-slow" />
      <div className="absolute -left-10 bottom-10 h-72 w-72 rounded-full bg-indigo-300/30 blur-2xl dark:bg-indigo-900/30 animate-float-slow animation-delay-200" />
      
      {/* Additional AI-native accent orbs */}
      <div className="absolute left-1/4 top-1/3 h-48 w-48 rounded-full bg-accent-500/20 blur-xl dark:bg-accent-500/15 animate-float animation-delay-300" />
      <div className="absolute right-1/4 bottom-1/4 h-56 w-56 rounded-full bg-brand-300/25 blur-2xl dark:bg-brand-600/20 animate-float animation-delay-400" />
      
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-grid-mask opacity-30" />
    </div>
  );
}


