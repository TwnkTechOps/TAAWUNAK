"use client";

import {Card, CardContent, CardHeader, CardTitle} from "components/Card/Card";
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell} from "recharts";

type TimelineItem = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "PENDING" | "IN_PROGRESS" | "DONE";
  progress?: number;
};

type TimelineChartProps = {
  title: string;
  items: TimelineItem[];
};

export function TimelineChart({title, items}: TimelineChartProps) {
  // Transform data for Gantt-style chart
  const chartData = items.map((item) => {
    const start = new Date(item.startDate).getTime();
    const end = new Date(item.endDate).getTime();
    const now = Date.now();
    const duration = end - start;
    const elapsed = Math.max(0, Math.min(now - start, duration));
    const progress = item.progress !== undefined ? item.progress : (duration > 0 ? (elapsed / duration) * 100 : 0);

    return {
      name: item.name.length > 20 ? item.name.substring(0, 20) + "..." : item.name,
      fullName: item.name,
      start: start,
      end: end,
      duration: duration,
      progress: progress,
      status: item.status,
    };
  });

  // Sort by start date
  chartData.sort((a, b) => a.start - b.start);

  // Calculate min and max dates for axis
  const minDate = Math.min(...chartData.map((d) => d.start));
  const maxDate = Math.max(...chartData.map((d) => d.end));

  // Format dates for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {month: "short", day: "numeric"});
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DONE":
        return "#10b981";
      case "IN_PROGRESS":
        return "#3b82f6";
      case "PENDING":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  return (
    <Card className="hover-pop glass">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="min-h-[400px] w-full">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{top: 20, right: 30, left: 100, bottom: 20}}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                domain={[minDate, maxDate]}
                tickFormatter={formatDate}
                label={{value: "Timeline", position: "insideBottom", offset: -5}}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tick={{fontSize: 12}}
              />
              <Tooltip
                content={({active, payload}) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
                        <p className="font-semibold">{data.fullName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Start: {formatDate(data.start)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          End: {formatDate(data.end)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Progress: {Math.round(data.progress)}%
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Status: {data.status}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="duration"
                fill="#3b82f6"
                radius={[0, 4, 4, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-500" />
            <span>Pending</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

