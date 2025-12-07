"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "components/Card/Card";
import { Button } from "components/Button/Button";
import { ArrowLeft, Download, FileText, Calendar, Users, CheckCircle2, Clock, AlertCircle, BarChart3 } from "lucide-react";
import { useAuth } from "lib/auth/useAuth";
import { AlertDialog } from "components/ui/alert-dialog";
import { TimelineChart } from "components/Chart/TimelineChart";
import { PieChartCard } from "components/Chart/PieChartCard";
import { BarChartCard } from "components/Chart/BarChartCard";

export default function ProjectReportPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error" | "warning" | "info">("info");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (projectId) {
      loadReport();
    }
  }, [projectId, apiBase]);

  async function loadReport() {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/projects/${projectId}/report`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      } else {
        setAlertType("error");
        setAlertTitle("Error");
        setAlertMessage("Failed to load report. You may not have access.");
        setAlertOpen(true);
      }
    } catch (error) {
      console.error("Failed to load report:", error);
      setAlertType("error");
      setAlertTitle("Network Error");
      setAlertMessage("Failed to load report. Please check your connection.");
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleExport(format: 'txt' | 'pdf' | 'xlsx' = 'txt') {
    if (!report) return;

    try {
      const res = await fetch(`${apiBase}/projects/${projectId}/export?format=${format}`, {
        credentials: "include"
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const extension = format === 'pdf' ? 'pdf' : format === 'xlsx' ? 'xlsx' : 'txt';
        a.download = `project-report-${projectId}-${new Date().toISOString().split('T')[0]}.${extension}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setAlertType("error");
        setAlertTitle("Error");
        setAlertMessage("Failed to export report");
        setAlertOpen(true);
      }
    } catch (error) {
      console.error("Export failed:", error);
      setAlertType("error");
      setAlertTitle("Network Error");
      setAlertMessage("Failed to export report. Please try again.");
      setAlertOpen(true);
    }
  }

  function handleExportLegacy() {
    if (!report) return;

    const reportText = `
PROJECT REPORT
==============

Project: ${report.project.title}
Status: ${report.project.status}
Generated: ${new Date(report.generatedAt).toLocaleString()}

STATISTICS
----------

Milestones:
  Total: ${report.statistics.milestones.total}
  Completed: ${report.statistics.milestones.completed}
  Pending: ${report.statistics.milestones.breakdown.PENDING}
  In Progress: ${report.statistics.milestones.breakdown.IN_PROGRESS}

Tasks:
  Total: ${report.statistics.tasks.total}
  Completed: ${report.statistics.tasks.completed}
  Completion Rate: ${report.statistics.tasks.completionRate}%
  Pending: ${report.statistics.tasks.breakdown.PENDING}
  In Progress: ${report.statistics.tasks.breakdown.IN_PROGRESS}
  Blocked: ${report.statistics.tasks.breakdown.BLOCKED}

Documents:
  Total: ${report.statistics.documents.total}
  Total Versions: ${report.statistics.documents.totalVersions}

Participants:
  Total: ${report.statistics.participants.total}
  Owners: ${report.statistics.participants.breakdown.OWNER}
  Collaborators: ${report.statistics.participants.breakdown.COLLABORATOR}
  Reviewers: ${report.statistics.participants.breakdown.REVIEWER}
  Viewers: ${report.statistics.participants.breakdown.VIEWER}
`;

    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `project-report-${report.project.title.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-(--breakpoint-xl) space-y-6 px-5 py-8">
        <div className="text-center py-12">Loading report...</div>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="mx-auto max-w-(--breakpoint-xl) space-y-6 px-5 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Report not available.</p>
          <Link href={`/projects/${projectId}`}>
            <Button className="mt-4" intent="secondary">
              <ArrowLeft size={16} className="mr-2" />
              Back to Project
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const taskStatusData = [
    { name: "Completed", value: report.statistics.tasks.breakdown.COMPLETED, color: "#10b981" },
    { name: "In Progress", value: report.statistics.tasks.breakdown.IN_PROGRESS, color: "#3b82f6" },
    { name: "Pending", value: report.statistics.tasks.breakdown.PENDING, color: "#6b7280" },
    { name: "Blocked", value: report.statistics.tasks.breakdown.BLOCKED, color: "#ef4444" },
  ].filter(item => item.value > 0);

  const milestoneStatusData = [
    { name: "Done", value: report.statistics.milestones.breakdown.DONE, color: "#10b981" },
    { name: "In Progress", value: report.statistics.milestones.breakdown.IN_PROGRESS, color: "#3b82f6" },
    { name: "Pending", value: report.statistics.milestones.breakdown.PENDING, color: "#6b7280" },
  ].filter(item => item.value > 0);

  const participantRoleData = [
    { name: "Owners", value: report.statistics.participants.breakdown.OWNER },
    { name: "Collaborators", value: report.statistics.participants.breakdown.COLLABORATOR },
    { name: "Reviewers", value: report.statistics.participants.breakdown.REVIEWER },
    { name: "Viewers", value: report.statistics.participants.breakdown.VIEWER },
  ].filter(item => item.value > 0);

  return (
    <main className="mx-auto max-w-(--breakpoint-xl) space-y-6 px-5 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/projects/${projectId}`}>
            <Button size="sm" intent="secondary">
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="title-lg tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Project Report
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {report.project.title} • Generated {new Date(report.generatedAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleExport('txt')} intent="secondary" size="sm">
            <Download size={16} className="mr-2" />
            TXT
          </Button>
          <Button onClick={() => handleExport('pdf')} intent="secondary" size="sm">
            <Download size={16} className="mr-2" />
            PDF
          </Button>
          <Button onClick={() => handleExport('xlsx')} intent="primary" size="sm">
            <Download size={16} className="mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Milestones"
          value={`${report.statistics.milestones.completed}/${report.statistics.milestones.total}`}
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatCard
          label="Tasks"
          value={`${report.statistics.tasks.completed}/${report.statistics.tasks.total}`}
          subValue={`${report.statistics.tasks.completionRate}% complete`}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <StatCard
          label="Documents"
          value={String(report.statistics.documents.total)}
          subValue={`${report.statistics.documents.totalVersions} versions`}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          label="Participants"
          value={String(report.statistics.participants.total)}
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {taskStatusData.length > 0 && (
          <PieChartCard
            title="Task Status Breakdown"
            data={taskStatusData}
            showLegend={true}
          />
        )}
        {milestoneStatusData.length > 0 && (
          <PieChartCard
            title="Milestone Status Breakdown"
            data={milestoneStatusData}
            showLegend={true}
          />
        )}
      </div>

      {participantRoleData.length > 0 && (
        <BarChartCard
          title="Participant Role Distribution"
          data={participantRoleData}
          color="#3b82f6"
        />
      )}

      {/* Timeline */}
      {report.timeline && report.timeline.length > 0 && (
        <TimelineChart
          title="Project Timeline"
          items={report.timeline}
        />
      )}

      <AlertDialog
        open={alertOpen}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
    </main>
  );
}

function StatCard({ label, value, subValue, icon }: { label: string; value: string; subValue?: string; icon: React.ReactNode }) {
  return (
    <Card className="hover-pop glass">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
            {subValue && <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">{subValue}</div>}
          </div>
          <div className="text-gray-400 dark:text-gray-500">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

