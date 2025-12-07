"use client";

import { useState, useEffect, useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "components/Card/Card";

export function RiskAlerts({ projectId }: { projectId: string }) {
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);
  const [risks, setRisks] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRisks();
  }, [projectId, apiBase]);

  async function loadRisks() {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/ai/projects/${projectId}/risks`, {
        method: "POST",
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setRisks(data);
      }
    } catch (error) {
      console.error("Failed to load risks:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !risks || risks.risks.length === 0) {
    return null;
  }

  const severityColors: Record<string, string> = {
    LOW: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    MEDIUM: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    HIGH: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    CRITICAL: "bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100",
  };

  return (
    <Card className="hover-pop glass border-amber-200 dark:border-amber-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          Risk Alerts ({risks.risks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {risks.risks.map((risk: any, idx: number) => (
            <div key={idx} className="rounded-lg border p-3 dark:border-gray-700">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs rounded font-medium ${severityColors[risk.severity] || ""}`}>
                    {risk.severity}
                  </span>
                  <span className="text-xs text-gray-500">{risk.type}</span>
                </div>
                <span className="text-xs text-gray-500">{risk.detectedBy}</span>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">{risk.description}</div>
              {risk.suggestedAction && (
                <div className="text-xs text-gray-600 dark:text-gray-400 italic">
                  💡 {risk.suggestedAction}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

