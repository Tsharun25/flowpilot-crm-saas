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
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <figure>
      <div
        className="h-80"
        role="img"
        aria-label={`Area chart showing monthly won deal value in ${currency}`}
        aria-describedby="monthly-won-values"
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={0}
          initialDimension={{ width: 320, height: 320 }}
        >
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis width={64} tickFormatter={(value) => Intl.NumberFormat("en", { notation: "compact" }).format(value)} />
            <Tooltip formatter={(value) => formatter.format(Number(value))} />
            <Area name="Won deal value" type="monotone" dataKey="wonValue" stroke="#0891b2" fill="#67e8f9" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <figcaption id="monthly-won-values" className="sr-only">
        Monthly won deal values: {data.map((item) => `${item.month} ${formatter.format(item.wonValue)}`).join("; ")}.
      </figcaption>
    </figure>
  );
}
