"use client";

import {useEffect, useState} from "react";

const THEMES = [
  {id: "emerald", label: "Emerald"},
  {id: "sand", label: "Sand / Gold"},
  {id: "midnight", label: "Midnight"}
];

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<string>("emerald");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tawawunak.theme");
      const t = saved || "emerald";
      setTheme(t);
      document.documentElement.dataset.theme = t;
    } catch {}
  }, []);
  function applyTheme(t: string) {
    setTheme(t);
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("tawawunak.theme", t); } catch {}
  }
  return (
    <div className="relative">
      <select
        aria-label="Theme"
        value={theme}
        onChange={(e) => applyTheme(e.target.value)}
        className="rounded-md border border-white/40 bg-transparent px-2 py-1 text-xs outline-none hover:bg-white/10"
      >
        {THEMES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
      </select>
    </div>
  );
}


