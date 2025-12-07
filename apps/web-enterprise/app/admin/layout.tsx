"use client";

import { AdminSidebar } from "components/Nav/AdminSidebar";
import { useAuth } from "lib/auth/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isInstitutionAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin && !isInstitutionAdmin) {
      router.push("/dashboard");
    }
  }, [loading, isAdmin, isInstitutionAdmin, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAdmin && !isInstitutionAdmin) {
    return null;
  }

  return (
    <>
      <AdminSidebar />
      <div className="ml-64 min-h-[calc(100vh-4rem)]">
        {children}
      </div>
    </>
  );
}

