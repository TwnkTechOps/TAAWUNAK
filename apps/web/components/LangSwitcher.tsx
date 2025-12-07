"use client";

import {usePathname} from "next/navigation";
import Link from "next/link";

export function LangSwitcher({locale}: {locale: string}) {
  const pathname = usePathname();
  const other = locale === "ar" ? "en" : "ar";
  // Swap the first path segment (locale)
  const segments = (pathname || "/").split("/").filter(Boolean);
  if (segments.length === 0) segments.push(locale);
  else segments[0] = other;
  const href = "/" + segments.join("/");
  return (
    <Link
      href={href}
      className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
      aria-label="Switch language"
    >
      {other.toUpperCase()}
    </Link>
  );
}

