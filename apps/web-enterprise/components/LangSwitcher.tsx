"use client";

import {usePathname, useRouter} from "next/navigation";
import {useLocale} from "next-intl";

export function LangSwitcher() {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const current = useLocale();
  const other = current === "ar" ? "en" : "ar";

  function switchLocale() {
    const segments = pathname.split("/").filter(Boolean);
    const first = segments[0];
    const isLocale = first === "ar" || first === "en";
    if (isLocale) {
      segments[0] = other;
    } else {
      // add prefix for non-default locale only
      if (other !== "en") segments.unshift(other);
    }
    const href = "/" + segments.join("/");
    router.push(href || "/");
  }

  return (
    <button
      onClick={switchLocale}
      className="rounded-md border border-white/40 px-2 py-1 text-xs hover:bg-white/10"
      aria-label="Switch language"
    >
      {other.toUpperCase()}
    </button>
  );
}

