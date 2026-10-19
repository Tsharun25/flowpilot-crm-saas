export default function DashboardLoading() {
  return (
    <div role="status" aria-live="polite" aria-label="Loading dashboard">
      <p className="sr-only">Loading dashboard...</p>
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
              className="h-40 rounded-[2rem] border border-slate-200 bg-white"
            />
          ))}
        </div>
        <div className="h-80 rounded-[2rem] border border-slate-200 bg-white" />
      </div>
    </div>
  );
}
