export default function DashboardLoading() {
  return (
    <div role="status" aria-live="polite" aria-label="Loading dashboard">
      <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-violet-800"><span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-violet-200 border-t-violet-700" />Loading workspace…</p>
      <div aria-hidden="true" className="animate-pulse space-y-8">
        <div className="space-y-3">
          <div className="h-4 w-24 rounded-full bg-slate-200" />
          <div className="h-10 w-64 max-w-full rounded-2xl bg-slate-200" />
          <div className="h-4 w-96 max-w-full rounded-full bg-slate-100" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-40 rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
        <div className="h-80 rounded-2xl border border-slate-200 bg-white" />
      </div>
    </div>
  );
}
