"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function AnalyticsChart({
  data,
  currency,
}: {
  data: { month: string; wonValue: number }[];
  currency: string;
}) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis width={64} tickFormatter={(value) => Intl.NumberFormat("en", { notation: "compact" }).format(value)} />
          <Tooltip formatter={(value) => new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(value))} />
          <Area name="Won deal value" type="monotone" dataKey="wonValue" stroke="#0891b2" fill="#67e8f9" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
