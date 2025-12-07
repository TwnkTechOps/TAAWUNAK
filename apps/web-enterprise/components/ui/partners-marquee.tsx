"use client";

import {useEffect, useRef} from "react";

const items = [
  "SDAIA", "KACST", "KAUST", "KSU", "KFUPM", "STC", "NEOM", "GAMI"
];

export function PartnersMarquee() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let anim: number;
    let x = 0;
    function tick() {
      x -= 0.5;
      el.style.transform = `translateX(${x}px)`;
      if (Math.abs(x) > el.scrollWidth / 2) x = 0;
      anim = requestAnimationFrame(tick);
    }
    anim = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(anim);
  }, []);
  return (
    <div className="relative mx-auto w-full overflow-hidden rounded-full border bg-white/60 py-2 dark:border-gray-800 dark:bg-gray-900/60">
      <div className="flex whitespace-nowrap px-6" ref={ref}>
        {[...items, ...items].map((name, i) => (
          <span key={`${name}-${i}`} className="text-xs font-medium text-gray-700 dark:text-gray-300 mx-4 inline-block">
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}


