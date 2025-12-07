"use client";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type SparklineData = { name: string; value: number };

export function SparklineKpi({
  label,
  value,
  hint,
  sparklineData,
  trend,
  trendValue,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  sparklineData?: SparklineData[];
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  icon?: React.ReactNode;
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : trend === "down"
        ? "text-red-600 dark:text-red-400"
        : "text-gray-500 dark:text-gray-400";

  return (
    <div className="group card-2025 shadow-ambient rounded-xl p-5 hover:shadow-lg transition-all animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {icon}
            {label}
          </div>
          <div className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{value}</div>
          {hint && <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">{hint}</div>}
          {trend && trendValue && (
            <div className={`mt-1 flex items-center gap-1 text-xs ${trendColor}`}>
              <TrendIcon size={12} />
              <span>{trendValue}</span>
            </div>
          )}
        </div>
      </div>
      {sparklineData && sparklineData.length > 0 && (
        <div className="h-12 w-full mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                fill={`url(#spark-${label})`}
                dot={false}
              />
              <Tooltip content={() => null} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

