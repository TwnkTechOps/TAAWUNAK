"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";

export function Breadcrumbs({locale}: {locale: string}) {
  const pathname = usePathname() || "/";
  const parts = pathname.split("/").filter(Boolean);
  // Ensure locale is the first segment
  const segments = parts[0] === locale ? parts.slice(1) : parts;
  const crumbs = segments.map((seg, idx) => {
    const href = "/" + [locale, ...segments.slice(0, idx + 1)].join("/");
    const label = seg.replace(/-/g, " ");
    return {href, label};
  });
  return (
    <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        <li>
          <Link href={`/${locale}`} className="hover:text-gray-700">Home</Link>
        </li>
        {crumbs.map((c, i) => (
          <li key={c.href} className="flex items-center gap-2">
            <span>/</span>
            {i < crumbs.length - 1 ? (
              <Link href={c.href} className="hover:text-gray-700">
                {c.label}
              </Link>
            ) : (
              <span className="text-gray-700">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

