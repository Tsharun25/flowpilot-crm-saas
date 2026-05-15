export default function ClientsLoading() {
  return (
    <div>
      <div className="mb-8">
        <div className="h-4 w-20 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-4 h-12 w-72 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-4 h-5 w-96 max-w-full animate-pulse rounded-full bg-slate-100" />
      </div>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-32 animate-pulse rounded-3xl border border-slate-200 bg-white shadow-sm"
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="h-[560px] animate-pulse rounded-3xl border border-slate-200 bg-white shadow-sm" />
        <div className="h-[560px] animate-pulse rounded-3xl border border-slate-200 bg-white shadow-sm" />
      </section>
    </div>
  );
}