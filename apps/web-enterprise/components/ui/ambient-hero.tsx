"use client";

import React from "react";

type AmbientHeroProps = {
  children: React.ReactNode;
  className?: string;
};

export function AmbientHero({ children, className }: AmbientHeroProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const glowRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    const glow = glowRef.current;
    if (!el || !glow) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glow.style.setProperty("--mx", `${x - glow.offsetWidth / 2}px`);
      glow.style.setProperty("--my", `${y - glow.offsetHeight / 2}px`);
    };

    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div ref={ref} className={className ?? "relative overflow-hidden"}>
      {/* Effects layer */}
      <div className="spotlight" aria-hidden />
      <div className="noise-overlay" aria-hidden />
      <div ref={glowRef} className="cursor-glow" aria-hidden />

      {/* Content */}
      {children}
    </div>
  );
}


