export default function TasksLoading() {
  return (
    <div>
      <div className="mb-8">
        <div className="h-4 w-20 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-4 h-12 w-72 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-4 h-5 w-96 max-w-full animate-pulse rounded-full bg-slate-100" />
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {[1, 2, 3, 4].map((column) => (
          <div key={column} className="rounded-3xl bg-white p-4">
            <div className="h-6 w-28 animate-pulse rounded-full bg-slate-200" />
            <div className="mt-5 space-y-3">
              {[1, 2, 3].map((card) => (
                <div
                  key={card}
                  className="h-32 animate-pulse rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}