"use client";

import { Button } from "components/Button/Button";
import { HeroGadget } from "components/ui/hero-gadget";
import { AmbientHero } from "components/ui/ambient-hero";
import { ShieldCheck, Languages, Globe2, Sparkles, Accessibility, ArrowRight, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function HeroSection() {
  const t = useTranslations("home");
  const [showVideo, setShowVideo] = useState(false);

  return (
    <section className="relative overflow-hidden border-b bg-aurora bg-grid-mask min-h-[90vh] flex items-center">
      <AmbientHero>
        <HeroGadget />
      </AmbientHero>
      
      <div className="relative mx-auto max-w-(--breakpoint-xl) px-5 py-20 sm:py-32 text-center z-10">
        {/* Eyebrow */}
        <div className="eyebrow animate-fade-in mb-4">
          {t("heroEyebrow")}
        </div>

        {/* Main Headline */}
        <h1 className="mx-auto max-w-5xl display-hero gold-gradient-text animate-fade-in animation-delay-100 mb-6 capitalize">
          {t("heroTitle")}
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-5 max-w-3xl lead dark:text-gray-200 animate-fade-in animation-delay-200 text-lg sm:text-xl">
          {t("heroDesc")}
        </p>

        {/* Value Props - Compact */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-fade-in animation-delay-300">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm card-2025 dark:border-gray-700 dark:text-gray-200 hover-lift glass-strong">
            <ShieldCheck className="h-4 w-4 text-brand animate-pulse-glow" />
            <span className="font-medium">{t("badgeSecure")}</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm card-2025 dark:border-gray-700 dark:text-gray-200 hover-lift glass-strong">
            <Sparkles className="h-4 w-4 text-brand" />
            <span className="font-medium">{t("badgeAi")}</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm card-2025 dark:border-gray-700 dark:text-gray-200 hover-lift glass-strong">
            <Languages className="h-4 w-4 text-brand" />
            <span className="font-medium">{t("badgeBilingual")}</span>
          </div>
        </div>

        {/* Primary CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fade-in animation-delay-400">
          <Button href="/auth/register" size="xl" className="shadow-lg glow-brand group">
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button href="#features" size="xl" intent="secondary" className="group glass-strong">
            <Play className="mr-2 h-5 w-5" />
            Explore Features
          </Button>
          <Button href="/auth/login" size="lg" intent="secondary" className="glass-strong">
            Sign In
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 animate-fade-in animation-delay-500">
          <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-6">
            Trusted by leading institutions across KSA
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {["KSU", "KAUST", "KACST", "SDAIA", "KFUPM", "NEOM"].map((inst, i) => (
              <div
                key={inst}
                className="px-4 py-2 rounded-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:scale-105 transition-transform"
                style={{ animationDelay: `${500 + i * 100}ms` }}
              >
                {inst}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="mt-16 animate-float">
          <a href="#features" className="flex flex-col items-center gap-2 text-gray-400 hover:text-brand transition-colors">
            <span className="text-xs uppercase tracking-wider">Explore Features</span>
            <div className="w-6 h-10 rounded-full border-2 border-gray-300 flex items-start justify-center p-2">
              <div className="w-1 h-3 rounded-full bg-gray-400 animate-float"></div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

