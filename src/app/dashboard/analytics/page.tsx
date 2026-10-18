import AnalyticsChart from "../analytics-chart";
import { getCurrentUserWithWorkspace } from "@/lib/current-user";
import { formatMoney, getWorkspaceCrmMetrics } from "@/lib/analytics";

export default async function AnalyticsPage() {
  const { workspace } = await getCurrentUserWithWorkspace();
  const metrics = await getWorkspaceCrmMetrics(workspace.id);
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-black uppercase tracking-wide text-cyan-600">
          Analytics
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Business Insights
        </h2>
        <p className="mt-2 max-w-2xl text-slate-500">
          Review booked won-deal value and pipeline performance in {metrics.currency}.
        </p>
      </div>

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
          <Metric label="Open Pipeline" value={formatMoney(metrics.openPipeline)} />
          <Metric label="Won Deal Value" value={formatMoney(metrics.wonDealValue)} />
          <Metric label="Lost Deal Value" value={formatMoney(metrics.lostDealValue)} />
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-2 text-xl font-black text-slate-950">{value}</p></div>;
}
