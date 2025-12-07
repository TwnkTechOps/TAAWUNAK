"use client";
import { Card, CardContent, CardHeader, CardTitle } from "components/Card/Card";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

export function GaugeCard({
  title,
  value,
  max = 100,
  thresholds = { low: 50, medium: 75 },
  label,
}: {
  title: string;
  value: number;
  max?: number;
  thresholds?: { low: number; medium: number };
  label?: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  const getColor = () => {
    if (percentage >= thresholds.medium) return "text-emerald-600 dark:text-emerald-400";
    if (percentage >= thresholds.low) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getBgColor = () => {
    if (percentage >= thresholds.medium) return "bg-emerald-500";
    if (percentage >= thresholds.low) return "bg-amber-500";
    return "bg-red-500";
  };

  const getIcon = () => {
    if (percentage >= thresholds.medium) return <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />;
    if (percentage >= thresholds.low) return <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />;
    return <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />;
  };

  const getStatus = () => {
    if (percentage >= thresholds.medium) return "Excellent";
    if (percentage >= thresholds.low) return "Good";
    return "Needs Attention";
  };

  // Calculate SVG arc for gauge
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="hover-pop glass">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative">
            <svg width="140" height="140" className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                className="text-gray-200 dark:text-gray-700"
              />
              {/* Progress circle */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={`transition-all duration-1000 ease-out ${getColor()}`}
                style={{ transformOrigin: "70px 70px" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`text-3xl font-bold ${getColor()}`}>{Math.round(percentage)}%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label || "Score"}</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            {getIcon()}
            <span className={`text-sm font-medium ${getColor()}`}>{getStatus()}</span>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Value: {value} / {max}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

