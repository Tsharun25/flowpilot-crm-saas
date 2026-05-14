import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          FlowPilot
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full px-5 py-2 text-sm text-slate-300 hover:text-white"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-950"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 lg:grid-cols-2">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm text-cyan-300">
            SaaS CRM & Project Management Platform
          </p>

          <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
            Run clients, projects, and tasks from one beautiful dashboard.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            FlowPilot helps teams manage leads, clients, projects, tasks, and
            revenue pipelines in one modern SaaS workspace.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="rounded-full bg-cyan-400 px-7 py-3 font-bold text-slate-950 shadow-lg shadow-cyan-400/20"
            >
              Start free
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-white/15 px-7 py-3 font-semibold text-white"
            >
              View dashboard
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur">
          <div className="rounded-2xl bg-slate-900 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Revenue Pipeline</p>
                <h2 className="text-3xl font-bold">$48,230</h2>
              </div>
              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">
                +18.4%
              </span>
            </div>

            <div className="grid gap-4">
              {["Website Redesign", "Mobile App CRM", "Marketing Launch"].map(
                (item, index) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex justify-between">
                      <p className="font-semibold">{item}</p>
                      <p className="text-sm text-slate-400">
                        {index + 3} tasks
                      </p>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-800">
                      <div
                        className="h-2 rounded-full bg-cyan-400"
                        style={{ width: `${45 + index * 18}%` }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}