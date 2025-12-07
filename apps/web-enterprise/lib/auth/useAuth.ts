"use client";

import { useEffect, useState, useMemo, useCallback } from "react";

export type UserRole = "ADMIN" | "INSTITUTION_ADMIN" | "RESEARCHER" | "REVIEWER" | "COMPANY_USER" | "STUDENT";

export interface User {
  id: string;
  email: string;
  fullName?: string;
  role: UserRole;
}

// Global auth state that can be cleared
let globalAuthState: { user: User | null; setUser: (user: User | null) => void } | null = null;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  // Register this hook instance globally so we can clear it from anywhere
  useEffect(() => {
    globalAuthState = { user, setUser };
    return () => {
      if (globalAuthState?.user === user) {
        globalAuthState = null;
      }
    };
  }, [user]);

  const refreshAuth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/auth/me`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || data);
      } else {
        // 401 is expected when not logged in - silently set user to null
        setUser(null);
      }
    } catch (error) {
      // Network errors or other issues - silently set user to null
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    refreshAuth();
    
    // Also refresh on focus (in case user logged in another tab)
    const handleFocus = () => {
      refreshAuth();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshAuth]);

  // Listen for logout events
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      setLoading(false);
    };
    
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setLoading(false);
    // Dispatch event for other components
    window.dispatchEvent(new Event('auth:logout'));
  }, []);

  const isAdmin = user?.role === "ADMIN";
  const isInstitutionAdmin = user?.role === "INSTITUTION_ADMIN";
  const isResearcher = user?.role === "RESEARCHER";
  const isReviewer = user?.role === "REVIEWER";
  const isCompanyUser = user?.role === "COMPANY_USER";
  const isStudent = user?.role === "STUDENT";
  const isAuthenticated = !!user;

  return {
    user,
    loading,
    isAdmin,
    isInstitutionAdmin,
    isResearcher,
    isReviewer,
    isCompanyUser,
    isStudent,
    isAuthenticated,
    refreshAuth,
    clearAuth,
  };
}

// Export a global function to clear auth (for use outside hooks)
export function clearGlobalAuth() {
  if (globalAuthState) {
    globalAuthState.setUser(null);
  }
  window.dispatchEvent(new Event('auth:logout'));
}

