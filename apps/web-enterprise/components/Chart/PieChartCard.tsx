"use client";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "components/Card/Card";

type DataPoint = { name: string; value: number; color?: string };

const COLORS = {
  default: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"],
  success: ["#10b981", "#34d399"],
  warning: ["#f59e0b", "#fbbf24"],
  danger: ["#ef4444", "#f87171"],
};

export function PieChartCard({
  title,
  data,
  colors = COLORS.default,
  showLegend = true,
  innerRadius = 0,
  showCenterLabel = false,
  centerLabel,
}: {
  title: string;
  data: DataPoint[];
  colors?: string[];
  showLegend?: boolean;
  innerRadius?: number;
  showCenterLabel?: boolean;
  centerLabel?: string;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const chartData = data.map((d, i) => ({
    ...d,
    color: d.color || colors[i % colors.length],
  }));

  return (
    <Card className="hover-pop glass">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full min-h-[256px] relative">
          <ResponsiveContainer width="100%" height="100%" minHeight={256}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={innerRadius > 0 ? 80 : 100}
                innerRadius={innerRadius}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  `${value} (${((value / total) * 100).toFixed(1)}%)`,
                  "Count",
                ]}
              />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
          {showCenterLabel && innerRadius > 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {centerLabel || total}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

