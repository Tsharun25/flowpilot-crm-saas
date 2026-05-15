function SkeletonCard() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-200" />
      <div className="mt-6 h-4 w-24 animate-pulse rounded-full bg-slate-200" />
      <div className="mt-3 h-8 w-20 animate-pulse rounded-full bg-slate-200" />
      <div className="mt-3 h-4 w-32 animate-pulse rounded-full bg-slate-100" />
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div>
      <div className="mb-8">
        <div className="h-4 w-28 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-4 h-12 w-72 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-4 h-5 w-96 max-w-full animate-pulse rounded-full bg-slate-100" />
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="h-6 w-44 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-8 h-72 animate-pulse rounded-3xl bg-slate-100" />
        </div>

        <div className="rounded-[2rem] bg-slate-950 p-6">
          <div className="h-4 w-24 animate-pulse rounded-full bg-white/20" />
          <div className="mt-5 h-10 w-40 animate-pulse rounded-full bg-white/20" />
          <div className="mt-5 h-20 animate-pulse rounded-3xl bg-white/10" />
        </div>
      </section>
    </div>
  );
}