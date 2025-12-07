"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Settings, LogOut, Shield, Building2, GraduationCap } from "lucide-react";
import { useAuth, clearGlobalAuth } from "lib/auth/useAuth";

export function UserMenu() {
  const { user, isAdmin, isInstitutionAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  async function handleLogout() {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312";
    try {
      // Clear auth state immediately
      clearGlobalAuth();
      // Call logout API to clear cookies
      await fetch(`${apiBase}/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      // Force redirect and clear any cached data
      window.location.href = "/auth/login";
    }
  }

  if (!user) return null;

  const roleIcons: Record<string, React.ReactNode> = {
    ADMIN: <Shield size={14} />,
    INSTITUTION_ADMIN: <Building2 size={14} />,
    RESEARCHER: <GraduationCap size={14} />,
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-2 py-1.5 text-sm text-white hover:bg-white/20"
      >
        <User size={16} />
        <span className="hidden md:inline">{user.fullName || user.email.split("@")[0]}</span>
        <span className="hidden lg:inline text-xs opacity-70">({user.role})</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900 z-50">
          <div className="border-b p-3 dark:border-gray-700">
            <div className="font-semibold text-gray-900 dark:text-white">{user.fullName || "User"}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
              {roleIcons[user.role]}
              {user.email}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user.role}</div>
          </div>
          <div className="p-2">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <User size={16} />
              Profile
            </Link>
            <Link
              href="/settings/security"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Settings size={16} />
              Security
            </Link>
            {isAdmin && (
              <Link
                href="/admin/users"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <Shield size={16} />
                Admin Panel
              </Link>
            )}
            {isInstitutionAdmin && (
              <Link
                href="/admin/institutions"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <Building2 size={16} />
                Institution Management
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

