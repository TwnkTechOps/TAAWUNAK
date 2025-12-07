"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useMemo } from "react";
import { EnterpriseCard, EnterpriseCardContent } from "components/Card";
import { Button } from "components/Button/Button";
import { Upload, FileText, Link as LinkIcon, Database, FileSpreadsheet, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const importSources = [
  {
    id: "orcid",
    name: "ORCID",
    description: "Import publications from your ORCID profile",
    icon: LinkIcon,
    color: "from-green-500 to-emerald-500",
    available: true
  },
  {
    id: "scopus",
    name: "Scopus",
    description: "Import from Scopus database",
    icon: Database,
    color: "from-blue-500 to-cyan-500",
    available: false // API key required
  },
  {
    id: "pubmed",
    name: "PubMed",
    description: "Import from PubMed database",
    icon: Database,
    color: "from-purple-500 to-pink-500",
    available: false // API key required
  },
  {
    id: "csv",
    name: "CSV/Excel",
    description: "Bulk import from CSV or Excel file",
    icon: FileSpreadsheet,
    color: "from-orange-500 to-red-500",
    available: true
  },
  {
    id: "manual",
    name: "Manual Entry",
    description: "Enter paper details manually",
    icon: FileText,
    color: "from-gray-500 to-gray-600",
    available: true
  }
];

function ImportPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [orcidId, setOrcidId] = useState("");
  const [importing, setImporting] = useState(false);
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  const handleORCIDImport = async () => {
    if (!orcidId.trim()) {
      alert("Please enter your ORCID ID");
      return;
    }

    setImporting(true);
    try {
      // Simulate ORCID import (in production, call ORCID API)
      alert("ORCID import feature requires API integration. For now, please use manual entry or CSV import.");
      router.push("/academic-output/papers/new");
    } catch (error) {
      console.error("Error importing from ORCID:", error);
      alert("Failed to import from ORCID");
    } finally {
      setImporting(false);
    }
  };

  const handleCSVImport = () => {
    router.push("/academic-output/import/csv");
  };

  const handleManualEntry = () => {
    router.push("/academic-output/papers/new");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/academic-output" className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Academic Output
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Import Research Data
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Import your research papers from various sources
        </p>
      </div>

      {/* Import Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {importSources.map((source) => {
          const Icon = source.icon;
          return (
            <EnterpriseCard
              key={source.id}
              variant="default"
              hover={source.available}
              className={!source.available ? "opacity-60" : ""}
            >
              <EnterpriseCardContent className="p-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${source.color} flex items-center justify-center mb-4`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {source.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {source.description}
                </p>
                {!source.available && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 mb-4">
                    Coming soon - API integration required
                  </p>
                )}
                {source.available && (
                  <Button
                    size="sm"
                    onClick={() => {
                      if (source.id === "orcid") setSelectedSource("orcid");
                      else if (source.id === "csv") handleCSVImport();
                      else if (source.id === "manual") handleManualEntry();
                    }}
                    className="w-full"
                  >
                    Import from {source.name}
                  </Button>
                )}
              </EnterpriseCardContent>
            </EnterpriseCard>
          );
        })}
      </div>

      {/* ORCID Import Form */}
      {selectedSource === "orcid" && (
        <EnterpriseCard variant="default">
          <EnterpriseCardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Import from ORCID
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ORCID ID
                </label>
                <input
                  type="text"
                  value={orcidId}
                  onChange={(e) => setOrcidId(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="0000-0000-0000-0000"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter your ORCID ID (e.g., 0000-0000-0000-0000)
                </p>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleORCIDImport} disabled={importing}>
                  {importing ? "Importing..." : "Import Publications"}
                </Button>
                <Button intent="secondary" onClick={() => setSelectedSource(null)}>
                  Cancel
                </Button>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Note:</strong> ORCID API integration requires API credentials. For now, please use manual entry or CSV import.
                </p>
              </div>
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>
      )}

      {/* Quick Help */}
      <EnterpriseCard variant="glass" className="mt-8">
        <EnterpriseCardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Import Tips
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• CSV/Excel files should include columns: Title, Abstract, Authors, DOI, Journal, Publication Date</li>
            <li>• Manual entry is recommended for the most accurate data</li>
            <li>• External API imports (ORCID, Scopus, PubMed) require API credentials setup</li>
          </ul>
        </EnterpriseCardContent>
      </EnterpriseCard>
    </main>
  );
}

export default function Import() {
  return (
    <ProtectedRoute>
      <ImportPage />
    </ProtectedRoute>
  );
}

