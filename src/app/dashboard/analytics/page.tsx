import AnalyticsChart from "../analytics-chart";

export default function AnalyticsPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-black uppercase tracking-wide text-cyan-600">
          Analytics
        </p>
        <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
          Business Insights
        </h2>
        <p className="mt-2 max-w-2xl text-slate-500">
          Visualize revenue, CRM performance, and workspace momentum.
        </p>
      </div>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-2xl font-black text-slate-950">
          Revenue Overview
        </h3>
        <AnalyticsChart />
      </section>
    </div>
  );
}