"use client";

import Image from "next/image";
import React from "react";

const logos = [
  { alt: "KSU", src: "/logos/ksu.svg" },
  { alt: "KAUST", src: "/logos/kaust.svg" },
  { alt: "SDAIA", src: "/logos/sdaia.svg" },
  { alt: "KACST", src: "/logos/kacst.svg" },
  { alt: "NEOM", src: "/logos/neom.svg" },
];

export function TrustStrip() {
  return (
    <section className="mx-auto max-w-(--breakpoint-xl) px-5 py-8">
      <div className="grid items-center gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-gray-500">Trusted by</p>
          <div className="flex flex-wrap items-center gap-4 opacity-80">
            {logos.map((l) => (
              <div key={l.alt} className="h-7 w-20 rounded bg-gray-100/60 dark:bg-gray-800/60" aria-label={l.alt} />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <Counter label="Researchers onboarded" value={3240} />
          <Counter label="AI matches" value={186} />
          <Counter label="Avg. review days" value={6.5} decimals={1} />
        </div>
      </div>
    </section>
  );
}

function Counter({ label, value, decimals = 0 }: { label: string; value: number; decimals?: number }) {
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    let n = 0;
    const steps = 24;
    const inc = value / steps;
    const id = window.setInterval(() => {
      n += inc;
      setDisplay(n);
      if (n >= value) window.clearInterval(id);
    }, 30);
    return () => window.clearInterval(id);
  }, [value]);
  return (
    <div className="card-2025 elevated-2025 rounded-xl p-4">
      <div className="text-2xl font-semibold">{display.toFixed(decimals)}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}


