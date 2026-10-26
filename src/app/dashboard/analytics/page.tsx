import type { Metadata } from "next";

import AnalyticsChart from "../analytics-chart";
import { getCurrentUserWithWorkspace } from "@/lib/current-user";
import { formatMoney, getWorkspaceCrmMetrics } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "CRM analytics",
  description: "Review open pipeline and won and lost deal values for your workspace.",
};

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const { workspace } = await getCurrentUserWithWorkspace();
  const currentYear = new Date().getUTCFullYear();
  const requestedYear = Number.parseInt((await searchParams).year ?? "", 10);
  const selectedYear = Number.isInteger(requestedYear) && requestedYear >= 2000 && requestedYear <= currentYear ? requestedYear : currentYear;
  const wonDates = await prisma.client.findMany({ where: { workspaceId: workspace.id, status: "WON", wonAt: { not: null } }, select: { wonAt: true } });
  const availableYears = Array.from(new Set([currentYear, ...wonDates.flatMap((client) => client.wonAt ? [client.wonAt.getUTCFullYear()] : [])])).sort((a, b) => b - a);
  const metrics = await getWorkspaceCrmMetrics(workspace.id, selectedYear);
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-black uppercase tracking-wide text-cyan-700">
          Analytics
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Business Insights
        </h2>
        <p className="mt-2 max-w-2xl text-slate-500">
          Review booked won-deal value and pipeline performance in {metrics.currency}.
        </p>
      </div>

      <form method="get" className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label htmlFor="analytics-year" className="text-sm font-bold text-slate-700">Reporting year (UTC)</label>
        <select id="analytics-year" name="year" defaultValue={String(selectedYear)} className="rounded-xl border border-slate-200 px-3 py-2">{availableYears.map((year) => <option key={year} value={year}>{year}</option>)}</select>
        <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white">Apply</button>
      </form>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-2xl font-black text-slate-950">
          Won Deal Value by Month · {metrics.year} (UTC)
        </h3>
        {metrics.hasWonData ? (
          <AnalyticsChart data={metrics.monthlyWon} currency={metrics.currency} />
        ) : (
          <div className="grid h-80 place-items-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <div><p className="text-lg font-black text-slate-950">No won deals in {metrics.year}</p><p className="mt-2 text-sm text-slate-500">Mark an opportunity as Won to add its value to this UTC calendar-year chart.</p></div>
          </div>
        )}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Metric label="Open Pipeline · all time" value={formatMoney(metrics.openPipeline)} />
          <Metric label={`Won Deal Value · ${metrics.year} UTC`} value={formatMoney(metrics.periodWonDealValue)} />
          <Metric label="Lost Deal Value · all time" value={formatMoney(metrics.lostDealValue)} />
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 rounded-2xl bg-slate-50 p-4"><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-2 break-words text-lg font-black text-slate-950 lg:text-xl">{value}</p></div>;
}
