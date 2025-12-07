"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, Building2, ShieldCheck, FileCheck, ClipboardList, Settings, Lock,
  LayoutDashboard, TrendingUp, AlertCircle
} from "lucide-react";
import { useAuth } from "lib/auth/useAuth";

const adminMenuItems = [
  { href: "/admin/users", label: "Users", icon: <Users size={18} />, roles: ["ADMIN"] },
  { href: "/admin/institutions", label: "Institutions", icon: <Building2 size={18} />, roles: ["ADMIN", "INSTITUTION_ADMIN"] },
  { href: "/admin/credentials", label: "Credentials", icon: <FileCheck size={18} />, roles: ["ADMIN"] },
  { href: "/admin/audit", label: "Audit Log", icon: <ClipboardList size={18} />, roles: ["ADMIN"] },
  { href: "/admin/compliance", label: "Compliance", icon: <ShieldCheck size={18} />, roles: ["ADMIN"] },
  { href: "/admin/policy", label: "Policy Matrix", icon: <Lock size={18} />, roles: ["ADMIN"] },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, isAdmin, isInstitutionAdmin } = useAuth();
  const isAdminArea = pathname?.startsWith("/admin");

  if (!isAdminArea || (!isAdmin && !isInstitutionAdmin)) return null;

  const visibleItems = adminMenuItems.filter(item => 
    item.roles.includes(user?.role || "")
  );

  return (
    <aside className="fixed left-0 top-[4rem] h-[calc(100vh-4rem)] w-64 border-r bg-white dark:border-gray-800 dark:bg-gray-900 overflow-y-auto z-10">
      <div className="p-4">
        <div className="mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
            Administration
          </h2>
          <nav className="space-y-1">
            {visibleItems.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    active
                      ? "bg-brand text-white"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-6 border-t pt-4 dark:border-gray-800">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <LayoutDashboard size={18} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </aside>
  );
}

