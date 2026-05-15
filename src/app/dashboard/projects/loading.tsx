export default function ProjectsLoading() {
  return (
    <div>
      <div className="mb-8">
        <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-4 h-12 w-72 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-4 h-5 w-96 max-w-full animate-pulse rounded-full bg-slate-100" />
      </div>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-48 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-8 space-y-5">
            <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-12 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-40 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-44 animate-pulse rounded-3xl bg-slate-100"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}