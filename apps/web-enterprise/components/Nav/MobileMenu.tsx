"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  X, Menu, LayoutDashboard, Layers, Landmark, FileText, BookOpen,
  MessageCircle, Users, CreditCard, TrendingUp, BarChart3, 
  ChevronRight, Sparkles, Star
} from "lucide-react";
import { useAuth } from "lib/auth/useAuth";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
  badge?: string;
}

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("nav");
  const { isAuthenticated, isAdmin, isInstitutionAdmin, isResearcher, user } = useAuth();

  const menuGroups: MenuGroup[] = [
    {
      title: "Main",
      items: [
        { href: "/", label: t("home"), icon: <LayoutDashboard size={20} /> },
        ...(isAuthenticated ? [
          { href: "/dashboard", label: t("dashboard"), icon: <LayoutDashboard size={20} /> }
        ] : [])
      ]
    },
    ...(isAuthenticated && (isResearcher || isAdmin || isInstitutionAdmin) ? [{
      title: "Research & Development",
      items: [
        { href: "/projects", label: t("projects"), icon: <Layers size={20} /> },
        { href: "/funding", label: t("funding"), icon: <Landmark size={20} /> },
        { href: "/proposals", label: t("proposals"), icon: <FileText size={20} /> },
        ...(isAdmin || isInstitutionAdmin ? [
          { href: "/proposals/evaluation", label: "Evaluation", icon: <TrendingUp size={20} /> }
        ] : []),
        ...(isAdmin ? [
          { href: "/proposals/dashboard", label: "Proposals Dashboard", icon: <BarChart3 size={20} /> }
        ] : []),
        { href: "/academic-output", label: "Academic Output", icon: <BookOpen size={20} /> }
      ]
    }] : []),
    ...(isAuthenticated ? [{
      title: "Communication & Services",
      items: [
        { href: "/communication", label: "Communication", icon: <MessageCircle size={20} /> },
        { href: "/payments", label: "Payments", icon: <CreditCard size={20} /> },
        ...(isAdmin || isInstitutionAdmin ? [
          { href: "/participation", label: "Participation", icon: <Users size={20} /> }
        ] : [])
      ]
    }] : []),
    ...(isAdmin ? [{
      title: "Administration",
      items: [
        { href: "/admin/users", label: "Admin", icon: <LayoutDashboard size={20} /> }
      ]
    }] : []),
    ...(!isAuthenticated ? [{
      title: "Public",
      items: [
        { href: "#features", label: "Features", icon: <Sparkles size={20} /> },
        { href: "#testimonials", label: "Testimonials", icon: <Star size={20} /> }
      ]
    }] : [])
  ];

  const filteredGroups = menuGroups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      if (item.roles) {
        return item.roles.includes(user?.role || "");
      }
      return true;
    })
  })).filter(group => group.items.length > 0);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" || pathname === "/en" || pathname === "/ar";
    return pathname === href || (!!pathname && pathname.startsWith(href) && href !== "/");
  };

  return (
    <>
      {/* Hamburger Button - Mobile and Tablet */}
      <button
        onClick={() => setIsOpen(true)}
        className="xl:hidden flex items-center justify-center rounded-md border border-white/30 bg-white/10 p-2 text-white/80 hover:bg-white/20 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 xl:hidden"
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 z-50 shadow-2xl xl:hidden overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-br from-brand-500 to-brand-600 text-white p-4 flex items-center justify-between border-b border-white/20">
                <div className="flex items-center gap-2 font-semibold">
                  <Layers size={20} />
                  <span>{t("brand")}</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-md hover:bg-white/20 transition-colors"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Menu Content */}
              <div className="p-4 space-y-6">
                {filteredGroups.map((group, groupIndex) => (
                  <div key={groupIndex}>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 px-2">
                      {group.title}
                    </h3>
                    <nav className="space-y-1">
                      {group.items.map((item) => {
                        const active = isActive(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                              active
                                ? "bg-brand-500 text-white shadow-md"
                                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                            }`}
                          >
                            <span className={active ? "text-white" : "text-gray-500 dark:text-gray-400"}>
                              {item.icon}
                            </span>
                            <span className="flex-1">{item.label}</span>
                            {active && (
                              <ChevronRight size={16} className="text-white/80" />
                            )}
                            {item.badge && (
                              <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

