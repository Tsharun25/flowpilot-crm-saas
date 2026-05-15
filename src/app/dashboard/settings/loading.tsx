export default function SettingsLoading() {
  return (
    <div>
      <div className="mb-8">
        <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-4 h-12 w-80 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-4 h-5 w-96 max-w-full animate-pulse rounded-full bg-slate-100" />
      </div>

      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-40 animate-pulse rounded-[2rem] border border-slate-200 bg-white shadow-sm"
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="h-96 animate-pulse rounded-[2rem] border border-slate-200 bg-white shadow-sm" />
        <div className="h-96 animate-pulse rounded-[2rem] border border-slate-200 bg-white shadow-sm" />
      </section>
    </div>
  );
}