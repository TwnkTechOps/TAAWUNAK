"use client";

import {useTranslations} from "next-intl";
import {Megaphone} from "lucide-react";
import {useEffect, useRef} from "react";

export function NewsTicker() {
  const t = useTranslations("home");
  const items = [t("news0"), t("news1"), t("news2")];
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let anim: number;
    let x = 0;
    function tick() {
      x -= 0.6;
      el.style.transform = `translateX(${x}px)`;
      if (Math.abs(x) > el.scrollWidth / 2) x = 0;
      anim = requestAnimationFrame(tick);
    }
    anim = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(anim);
  }, []);
  return (
    <div className="mx-auto max-w-(--breakpoint-xl) px-5">
      <div className="relative flex items-center gap-3 overflow-hidden rounded-xl border bg-white/80 px-4 py-2 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Megaphone size={16} className="text-emerald-700 dark:text-emerald-300" />
          <span className="text-gray-700 dark:text-gray-300 font-medium">{t("newsTitle")}:</span>
        </div>
        <div className="relative w-full overflow-hidden">
          <div ref={ref} className="flex gap-10 whitespace-nowrap">
            {[...items, ...items].map((n, i) => (
              <span key={i} className="text-gray-700 dark:text-gray-300">{n}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


