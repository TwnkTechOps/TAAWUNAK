"use client";

import Link from "next/link"
import { Search, Layers, Landmark, FileText, BookOpen, LayoutDashboard, ChevronRight, Sparkles, Star, MessageCircle, Users, Video, Calendar, Globe, Book, CreditCard, TrendingUp, BarChart3 } from "lucide-react"
import {LangSwitcher} from "components/LangSwitcher"
import {ThemeSwitcher} from "components/ThemeSwitcher"
import {CommandPalette} from "components/CommandPalette"
import {UserMenu} from "components/Nav/UserMenu"
import {NotificationCenter} from "components/Notifications/NotificationCenter"
import {MobileMenu} from "components/Nav/MobileMenu"
import {useAuth} from "lib/auth/useAuth"
import {useTranslations} from "next-intl"
import {useEffect, useMemo, useState} from "react";
import {usePathname} from "next/navigation";

export function Topbar() {
  const t = useTranslations("nav")
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, isAdmin, isInstitutionAdmin, isResearcher } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const segments = useMemo(() => {
    const path = pathname || "/";
    const parts = path.split("?")[0].split("/").filter(Boolean).filter(p => p !== "en" && p !== "ar");
    return parts;
  }, [pathname]);

  return (
    <header 
      className="sticky top-0 z-20 border-b border-accent text-white transition-all" 
      style={{ 
        backgroundColor: '#047857' // brand-700 solid color
      }}
    >
      <div className={`mx-auto flex max-w-(--breakpoint-xl) items-center justify-between gap-3 px-5 ${scrolled ? "py-2" : "py-3"}`}>
        <div className="flex items-center gap-3">
          <MobileMenu />
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Layers size={18} />
            <span className="hidden sm:inline">{t("brand")}</span>
          </Link>
        </div>
        {/* Desktop Navigation - Organized by Groups */}
        <div className="hidden items-center gap-2 text-sm lg:flex flex-1">
          {/* Main Navigation */}
          <div className="flex items-center gap-1 border-r border-white/20 pr-3 mr-2">
            <NavItem href="/" label={t("home")} icon={<LayoutDashboard size={16} />} activePath={pathname}/>
            {isAuthenticated && (
              <NavItem href="/dashboard" label={t("dashboard")} icon={<LayoutDashboard size={16} />} activePath={pathname}/>
            )}
          </div>
          
          {/* Research & Development Group */}
          {isAuthenticated && (isResearcher || isAdmin || isInstitutionAdmin) && (
            <div className="flex items-center gap-1 border-r border-white/20 pr-3 mr-2">
              <NavItem href="/projects" label={t("projects")} icon={<Layers size={16} />} activePath={pathname}/>
              <NavItem href="/funding" label={t("funding")} icon={<Landmark size={16} />} activePath={pathname}/>
              <NavItem href="/proposals" label={t("proposals")} icon={<FileText size={16} />} activePath={pathname}/>
              {(isAdmin || isInstitutionAdmin) && (
                <NavItem href="/proposals/evaluation" label="Evaluation" icon={<TrendingUp size={16} />} activePath={pathname}/>
              )}
              {isAdmin && (
                <NavItem href="/proposals/dashboard" label="Dashboard" icon={<BarChart3 size={16} />} activePath={pathname}/>
              )}
              <NavItem href="/academic-output" label="Academic" icon={<BookOpen size={16} />} activePath={pathname}/>
            </div>
          )}
          
          {/* Communication & Services Group */}
          {isAuthenticated && (
            <div className="flex items-center gap-1 border-r border-white/20 pr-3 mr-2">
              <NavItem href="/communication" label="Communication" icon={<MessageCircle size={16} />} activePath={pathname}/>
              <NavItem href="/payments" label="Payments" icon={<CreditCard size={16} />} activePath={pathname}/>
              {(isAdmin || isInstitutionAdmin) && (
                <NavItem href="/participation" label="Participation" icon={<Users size={16} />} activePath={pathname}/>
              )}
            </div>
          )}
          
          {/* Admin Group */}
          {isAdmin && (
            <div className="flex items-center gap-1">
              <NavItem href="/admin/users" label="Admin" icon={<LayoutDashboard size={16} />} activePath={pathname}/>
            </div>
          )}
          
          {/* Public Links */}
          {!isAuthenticated && (
            <div className="flex items-center gap-1">
              <NavItem href="#features" label="Features" icon={<Sparkles size={16} />} activePath={null}/>
              <NavItem href="#testimonials" label="Testimonials" icon={<Star size={16} />} activePath={null}/>
            </div>
          )}
        </div>
        
        {/* Desktop Hamburger Option (for users who prefer it) */}
        <div className="hidden lg:block xl:hidden">
          <MobileMenu />
        </div>
        <div className="flex items-center gap-2">
          {/* Search button - compact icon only */}
          <button
            onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", {key: "k", metaKey: true}))}
            className="hidden md:flex items-center justify-center rounded-md border border-white/30 bg-white/10 p-2 text-white/80 hover:bg-white/20 transition-colors"
            title={`${t("searchPlaceholder")} (⌘K)`}
          >
            <Search size={18} />
          </button>
          <CommandPalette />
          {isAuthenticated ? (
            <>
              <NotificationCenter />
              <UserMenu />
              <ThemeSwitcher />
              <LangSwitcher />
            </>
          ) : (
            <>
              <Link href="/auth/login" className="rounded-md border border-white/40 px-2 py-1 text-xs hover:bg-white/10">
                {t("login")}
              </Link>
              <Link href="/auth/register" className="rounded-md bg-white/90 px-2 py-1 text-xs text-emerald-800 hover:bg-white">
                {t("register")}
              </Link>
              <ThemeSwitcher />
              <LangSwitcher />
            </>
          )}
        </div>
      </div>
      {/* Breadcrumb row */}
      <div 
        className="mx-auto hidden max-w-(--breakpoint-xl) items-center gap-1 px-5 pb-2 text-xs text-white/80 md:flex"
        style={{ backgroundColor: 'transparent' }}
      >
        <Link href="/">Home</Link>
        {segments.map((seg, i) => {
          const href = "/" + segments.slice(0, i + 1).join("/");
          return (
            <span key={href} className="inline-flex items-center gap-1">
              <ChevronRight size={12} className="opacity-70" />
              <Link href={href} className="hover:text-white">{seg}</Link>
            </span>
          );
        })}
      </div>
    </header>
  )
}

function NavItem({ href, label, icon, activePath }: { href: string; label: string; icon?: React.ReactNode; activePath?: string | null }) {
  const active = activePath === href || (!!activePath && activePath.startsWith(href) && href !== "/");
  return (
    <Link href={href} className={`flex items-center gap-1 rounded-md px-2 py-1 ${active ? "bg-white/20 text-white" : "hover:text-white/90"}`}>
      {icon}
      <span>{label}</span>
    </Link>
  )
}

