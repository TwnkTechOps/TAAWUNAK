"use client";

import Link from "next/link";
import {LangSwitcher} from "./LangSwitcher";
import {useTranslations} from "next-intl";
import {ReactNode} from "react";
import clsx from "clsx";
import {LayoutDashboard, FolderKanban, Landmark, FileText, BookOpen, Shield, Search, User} from "lucide-react";
import {Input} from "./ui/input";
import {Breadcrumbs} from "./Breadcrumbs";

export function NavigationShell({children, locale}: {children: ReactNode; locale: string}) {
  const t = useTranslations("nav");
  const rtl = locale === "ar";
  return (
    <div className={clsx("min-h-screen bg-gray-50", rtl && "text-right")}>
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 border-e bg-white">
          <div className="flex h-14 items-center justify-between px-4">
            <Link href={`/${locale}`} className="font-semibold text-brand flex items-center gap-2">
              <LayoutDashboard size={18} />
              {t("brand")}
            </Link>
          </div>
          <nav className="px-2 py-3 text-sm">
            <NavItem href={`/${locale}`} icon={<LayoutDashboard size={16} />}>
              Dashboard
            </NavItem>
            <NavItem href={`/${locale}/projects`} icon={<FolderKanban size={16} />}>
              {t("projects")}
            </NavItem>
            <NavItem href={`/${locale}/funding`} icon={<Landmark size={16} />}>
              {t("funding")}
            </NavItem>
            <NavItem href={`/${locale}/proposals`} icon={<FileText size={16} />}>
              {t("proposals")}
            </NavItem>
            <NavItem href={`/${locale}/papers`} icon={<BookOpen size={16} />}>
              {t("papers")}
            </NavItem>
            <NavItem href={`/${locale}/admin`} icon={<Shield size={16} />}>
              {t("admin")}
            </NavItem>
          </nav>
        </aside>
        {/* Main */}
        <div className="flex-1">
          <header className="sticky top-0 z-10 border-b bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 p-3">
              <Link href={`/${locale}`} className="font-semibold text-brand md:hidden">
                {t("brand")}
              </Link>
              <div className="flex w-full items-center gap-3">
                <div className="relative hidden md:block w-80">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input className="pl-9" placeholder="Search projects, funding, papers..." />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <LangSwitcher locale={locale} />
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                  <User size={16} />
                </div>
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-7xl p-4">{children}</main>
          <div className="mx-auto max-w-7xl px-4 pb-4">
            <Breadcrumbs locale={locale} />
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({href, icon, children}: {href: string; icon?: ReactNode; children: ReactNode}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-50"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}

