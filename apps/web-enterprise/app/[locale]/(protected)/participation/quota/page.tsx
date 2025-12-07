"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { EnterpriseCard, EnterpriseCardContent } from "components/Card";
import { Button } from "components/Button/Button";
import { Award, Save, Users } from "lucide-react";
import { useRouter } from "next/navigation";

function QuotaManagementPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [quota, setQuota] = useState<any>(null);
  const [formData, setFormData] = useState({
    totalQuota: 0,
    maleQuota: 0,
    femaleQuota: 0,
    otherQuota: 0,
    skillAreas: ""
  });
  const [saving, setSaving] = useState(false);
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (user && user.institutionId) {
      fetch(`${apiBase}/participation/quota/${user.institutionId}`, {
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => {
          setQuota(data);
          setFormData({
            totalQuota: data.totalQuota || 0,
            maleQuota: data.genderQuota?.maleQuota || 0,
            femaleQuota: data.genderQuota?.femaleQuota || 0,
            otherQuota: data.genderQuota?.otherQuota || 0,
            skillAreas: data.skillAreas?.join(", ") || ""
          });
        })
        .catch(err => console.error("Failed to fetch quota:", err));
    }
  }, [user, apiBase]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${apiBase}/participation/quota/${user?.institutionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          totalQuota: formData.totalQuota,
          maleQuota: formData.maleQuota,
          femaleQuota: formData.femaleQuota,
          otherQuota: formData.otherQuota,
          skillAreas: formData.skillAreas.split(",").map(s => s.trim()).filter(s => s)
        })
      });

      if (response.ok) {
        router.push("/participation");
      } else {
        alert("Failed to update quota");
      }
    } catch (error) {
      console.error("Error updating quota:", error);
      alert("Failed to update quota");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Manage Participation Quota
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Allocate quotas for your institution with gender equality tracking
        </p>
      </div>

      <EnterpriseCard variant="default">
        <EnterpriseCardContent className="p-6 space-y-6">
          {/* Total Quota */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Total Participation Quota
            </label>
            <input
              type="number"
              min="0"
              value={formData.totalQuota}
              onChange={(e) => setFormData({ ...formData, totalQuota: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Total number of participants allowed
            </p>
          </div>

          {/* Gender Quotas */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Gender Equality Quotas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Male Quota
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.maleQuota}
                  onChange={(e) => setFormData({ ...formData, maleQuota: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Female Quota
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.femaleQuota}
                  onChange={(e) => setFormData({ ...formData, femaleQuota: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Other Quota
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.otherQuota}
                  onChange={(e) => setFormData({ ...formData, otherQuota: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Gender-specific quotas for equality tracking
            </p>
          </div>

          {/* Skill Areas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Skill Areas (comma-separated)
            </label>
            <input
              type="text"
              value={formData.skillAreas}
              onChange={(e) => setFormData({ ...formData, skillAreas: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="AI, Machine Learning, Data Science"
            />
          </div>

          {/* Current Status */}
          {quota && (
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Current Status</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Used:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{quota.usedQuota}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Available:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{quota.availableQuota}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Tier:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{quota.tier}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Utilization:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {quota.totalQuota > 0 ? Math.round((quota.usedQuota / quota.totalQuota) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              <Save className="mr-2 h-5 w-5" />
              {saving ? "Saving..." : "Save Quota"}
            </Button>
            <Button
              intent="secondary"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </EnterpriseCardContent>
      </EnterpriseCard>
    </main>
  );
}

export default function QuotaManagement() {
  return (
    <ProtectedRoute>
      <QuotaManagementPage />
    </ProtectedRoute>
  );
}

