"use client";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "components/Card/Card";

type StackedDataPoint = {
  name: string;
  [key: string]: string | number;
};

export function StackedBarCard({
  title,
  data,
  stackId = "stack",
  colors = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6"],
}: {
  title: string;
  data: StackedDataPoint[];
  stackId?: string;
  colors?: string[];
}) {
  // Extract all data keys except 'name'
  const dataKeys = data.length > 0 
    ? Object.keys(data[0]).filter(key => key !== "name")
    : [];

  return (
    <Card className="hover-pop glass">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full min-h-[256px]">
          <ResponsiveContainer width="100%" height="100%" minHeight={256}>
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {dataKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId={stackId}
                  fill={colors[index % colors.length]}
                  radius={index === dataKeys.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

