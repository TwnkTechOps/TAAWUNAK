"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Building2, ShieldCheck, FileCheck, ClipboardList, Settings, Lock } from "lucide-react";

const adminLinks = [
  { href: "/admin/users", label: "Users", icon: <Users size={16} /> },
  { href: "/admin/institutions", label: "Institutions", icon: <Building2 size={16} /> },
  { href: "/admin/credentials", label: "Credentials", icon: <FileCheck size={16} /> },
  { href: "/admin/audit", label: "Audit", icon: <ClipboardList size={16} /> },
  { href: "/admin/compliance", label: "Compliance", icon: <ShieldCheck size={16} /> },
  { href: "/admin/policy", label: "Policy", icon: <Lock size={16} /> },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="mb-6 border-b pb-4">
      <div className="flex flex-wrap gap-2">
        {adminLinks.map((link) => {
          const active = pathname === link.href || (pathname?.startsWith(link.href) && link.href !== "/admin");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition ${
                active
                  ? "bg-brand text-white border-brand"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

