"use client";

import {useEffect, useState} from "react";
import {usePathname} from "next/navigation";

export function RouteProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 400);
    return () => clearTimeout(t);
  }, [pathname]);
  return visible ? (
    <div className="fixed left-0 right-0 top-0 z-40 h-0.5 overflow-hidden">
      <div className="h-full w-full animate-[progress_0.4s_ease-out] bg-emerald-500" />
      <style jsx>{`
        @keyframes progress {
          from { transform: translateX(-60%); }
          to { transform: translateX(0%); }
        }
      `}</style>
    </div>
  ) : null;
}


