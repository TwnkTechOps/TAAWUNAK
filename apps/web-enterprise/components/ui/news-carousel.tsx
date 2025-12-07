"use client";

import {useEffect, useRef, useState} from "react";
import {useTranslations} from "next-intl";
import Link from "next/link";
import {ChevronLeft, ChevronRight, Megaphone} from "lucide-react";

export function NewsCarousel() {
  const t = useTranslations("home");
  const items = [
    {text: t("news0"), href: "/settings/security"},
    {text: t("news1"), href: "/admin/institutions"},
    {text: t("news2"), href: "/dashboard"},
  ];
  const [idx, setIdx] = useState(0);
  const timer = useRef<number | null>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer.current = window.setInterval(() => setIdx(i => (i + 1) % items.length), 4000);
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [items.length]);
  return (
    <section aria-label="News" className="mx-auto max-w-(--breakpoint-xl) px-5">
      <div className="relative flex items-center gap-3 overflow-hidden rounded-xl border bg-white/80 px-4 py-2 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
        <div className="flex items-center gap-2">
          <Megaphone size={16} className="text-emerald-700 dark:text-emerald-300" />
          <span className="sr-only">News</span>
        </div>
        <div className="relative w-full" aria-live="polite">
          {items.map((n, i) => (
            <div key={i} className={`transition-opacity ${i === idx ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0"}`}>
              <Link href={n.href} className="hover:underline">{n.text}</Link>
            </div>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button aria-label="Previous" onClick={() => setIdx(i => (i - 1 + items.length) % items.length)} className="rounded border px-1 py-0.5 text-xs hover:bg-gray-50 dark:border-gray-700"> <ChevronLeft size={14}/> </button>
          <button aria-label="Next" onClick={() => setIdx(i => (i + 1) % items.length)} className="rounded border px-1 py-0.5 text-xs hover:bg-gray-50 dark:border-gray-700"> <ChevronRight size={14}/> </button>
        </div>
      </div>
    </section>
  );
}


