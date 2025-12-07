"use client";

import Link from "next/link";
import {useTranslations} from "next-intl";
import {Plus, UserPlus, ShieldCheck, BadgeCheck} from "lucide-react";

export function QuickActions() {
  const t = useTranslations("home");
  const actions = [
    {href: "/projects", label: t("qaNewProject"), icon: <Plus size={14}/>},
    {href: "/admin/institutions", label: t("qaVerifyInstitution"), icon: <BadgeCheck size={14}/>},
    {href: "/admin/institutions", label: t("qaInviteMember"), icon: <UserPlus size={14}/>},
    {href: "/settings/security", label: t("qaEnableMfa"), icon: <ShieldCheck size={14}/>},
  ];
  return (
    <div className="mx-auto mt-6 flex max-w-(--breakpoint-xl) flex-wrap items-center justify-center gap-2 px-5">
      {actions.map((a, i) => (
        <Link key={i} href={a.href} className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900">
          <span className="text-emerald-700 dark:text-emerald-300">{a.icon}</span>
          <span>{a.label}</span>
        </Link>
      ))}
    </div>
  );
}


