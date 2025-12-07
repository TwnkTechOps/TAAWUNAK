"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "components/Card/Card";
import { Button } from "components/Button/Button";
import { useAuth, clearGlobalAuth } from "lib/auth/useAuth";
import { User, Mail, Shield, Building2, Calendar, Edit, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  async function handleLogout() {
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

  useEffect(() => {
    if (!user) return;
    fetch(`${apiBase}/users/me`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(() => setProfile(user));
  }, [user, apiBase]);

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl space-y-6 px-5 py-8">
        <div className="text-center py-12">Loading...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl space-y-6 px-5 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">Please log in to view your profile.</p>
            <div className="mt-4">
              <Button href="/auth/login">Login</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  const roleLabels: Record<string, string> = {
    ADMIN: "System Administrator",
    INSTITUTION_ADMIN: "Institution Administrator",
    RESEARCHER: "Researcher",
    REVIEWER: "Reviewer",
    COMPANY_USER: "Company User",
    STUDENT: "Student",
  };

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-5 py-8">
      <div className="flex items-center justify-between">
        <h1 className="title-lg tracking-tight text-gray-900 dark:text-white">My Profile</h1>
        <Button href="/settings/security" intent="secondary">Security Settings</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="hover-pop glass lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Personal Information</CardTitle>
              <Button size="sm" intent="secondary">
                <Edit size={14} className="mr-1" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white">
                <User size={32} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {profile?.fullName || user.fullName || "User"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoField label="Email" value={user.email} icon={<Mail size={16} />} />
              <InfoField label="Role" value={roleLabels[user.role] || user.role} icon={<Shield size={16} />} />
              {profile?.institution && (
                <InfoField 
                  label="Institution" 
                  value={profile.institution.name} 
                  icon={<Building2 size={16} />} 
                />
              )}
              {profile?.createdAt && (
                <InfoField 
                  label="Member Since" 
                  value={new Date(profile.createdAt).toLocaleDateString()} 
                  icon={<Calendar size={16} />} 
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="hover-pop glass">
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Link href="/profile/credentials">
              <Button className="w-full" intent="secondary">Manage Credentials</Button>
            </Link>
            <Link href="/profile/reputation">
              <Button className="w-full" intent="secondary">View Reputation</Button>
            </Link>
            <Link href="/settings/security">
              <Button className="w-full" intent="secondary">Security Settings</Button>
            </Link>
            <div className="pt-2 border-t dark:border-gray-700">
              <Button 
                onClick={handleLogout}
                className="w-full" 
                intent="secondary"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function InfoField({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{value}</div>
    </div>
  );
}

