"use client";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "components/Card/Card";

type LineDataPoint = {
  name: string;
  [key: string]: string | number;
};

export function LineChartCard({
  title,
  data,
  dataKeys,
  colors = ["#10b981", "#3b82f6", "#f59e0b"],
  showDots = true,
}: {
  title: string;
  data: LineDataPoint[];
  dataKeys: string[];
  colors?: string[];
  showDots?: boolean;
}) {
  return (
    <Card className="hover-pop glass">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full min-h-[256px]">
          <ResponsiveContainer width="100%" height="100%" minHeight={256}>
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {dataKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={showDots ? { r: 4 } : false}
                  activeDot={{ r: 6 }}
                  animationDuration={800}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

