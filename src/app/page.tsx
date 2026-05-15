import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  CheckSquare,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

const features = [
  {
    title: "Project Management",
    description: "Create projects, track progress, and manage delivery from one dashboard.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Kanban Tasks",
    description: "Organize work across Todo, In Progress, Review, and Done boards.",
    icon: CheckSquare,
  },
  {
    title: "CRM Pipeline",
    description: "Track leads, deal values, and client status with a visual pipeline.",
    icon: Users,
  },
  {
    title: "Live Analytics",
    description: "Monitor projects, tasks, clients, and revenue with real-time insights.",
    icon: BarChart3,
  },
];

const highlights = [
  "Auth protected dashboard",
  "MongoDB powered data",
  "Workspace-based structure",
  "Projects and tasks CRUD",
  "CRM deal pipeline",
  "Premium responsive UI",
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <section className="relative">
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute right-0 top-40 h-[420px] w-[420px] rounded-full bg-blue-500/20 blur-3xl" />

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-cyan-400 text-xl font-black text-slate-950">
              F
            </div>
            <div>
              <p className="text-xl font-black leading-none">FlowPilot</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-cyan-300">
                SaaS CRM
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-full px-5 py-2 text-sm font-bold text-slate-300 transition hover:text-white md:inline-flex"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-white px-5 py-2 text-sm font-black text-slate-950 transition hover:bg-cyan-300"
            >
              Get Started
            </Link>
          </div>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-6 pb-24 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-cyan-300 backdrop-blur">
              <Sparkles size={16} />
              Portfolio-ready SaaS CRM & Project Management App
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
              Manage projects, tasks, clients, and revenue in one beautiful SaaS.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              FlowPilot is a full-stack SaaS portfolio project built with Next.js,
              MongoDB, Auth, CRM pipeline, Kanban tasks, analytics, and a premium
              dashboard experience.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-7 py-4 font-black text-slate-950 shadow-xl shadow-cyan-400/20 transition hover:bg-cyan-300"
              >
                Start Free
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-4 font-black text-white backdrop-blur transition hover:bg-white/10"
              >
                Try Demo Login
              </Link>
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-sm font-black text-cyan-300">
                Demo Credentials
              </p>
              <div className="mt-3 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
                <p>
                  Email:{" "}
                  <span className="font-bold text-white">demo@flowpilot.com</span>
                </p>
                <p>
                  Password: <span className="font-bold text-white">123456</span>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl shadow-cyan-950/40 backdrop-blur">
            <div className="rounded-[1.5rem] bg-slate-900 p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-400">
                    Command Center
                  </p>
                  <h2 className="mt-1 text-3xl font-black">$750,000</h2>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm font-black text-emerald-300">
                  +24.8%
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ["Projects", "12"],
                  ["Active Tasks", "48"],
                  ["Clients", "23"],
                  ["Pipeline", "$84.2k"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-3xl border border-white/10 bg-white/5 p-5"
                  >
                    <p className="text-sm text-slate-400">{label}</p>
                    <p className="mt-2 text-2xl font-black">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-black">CRM Pipeline</p>
                  <Zap className="text-cyan-300" size={18} />
                </div>

                {["Lead", "Contacted", "Won"].map((item, index) => (
                  <div key={item} className="mb-3 last:mb-0">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-slate-300">{item}</span>
                      <span className="font-bold text-white">
                        {35 + index * 22}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800">
                      <div
                        className="h-2 rounded-full bg-cyan-400"
                        style={{ width: `${35 + index * 22}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03] px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {[
            ["Full-stack", "Next.js, MongoDB, Prisma, Auth"],
            ["Business-ready", "Projects, Tasks, CRM, Analytics"],
            ["Portfolio-grade", "Premium UI with real SaaS workflows"],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-3xl bg-white/5 p-6">
              <p className="text-2xl font-black">{title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 max-w-3xl">
          <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
            Features
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
            Everything a modern SaaS dashboard needs.
          </h2>
          <p className="mt-4 leading-7 text-slate-400">
            Built to show real product thinking, database architecture, polished
            UI, and practical business workflows.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-[2rem] border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/10"
              >
                <div className="grid size-12 place-items-center rounded-2xl bg-cyan-400 text-slate-950">
                  <Icon size={22} />
                </div>
                <h3 className="mt-6 text-xl font-black">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-24 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
            Built for portfolio impact
          </p>
          <h2 className="mt-3 text-4xl font-black">
            More than a CRUD app. It feels like a real product.
          </h2>
          <p className="mt-4 leading-7 text-slate-400">
            FlowPilot includes real authentication, protected workspaces, live
            database stats, visual pipelines, Kanban workflows, and premium UX.
          </p>
        </div>

        <div className="grid gap-3">
          {highlights.map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4"
            >
              <CheckCircle2 className="text-cyan-300" size={20} />
              <span className="font-bold text-slate-200">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl rounded-[2.5rem] bg-cyan-400 p-10 text-center text-slate-950 md:p-16">
          <ShieldCheck className="mx-auto" size={42} />
          <h2 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">
            Ready to explore FlowPilot?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-medium leading-7">
            Login with the demo account or create your own workspace to test the
            full SaaS CRM experience.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/login"
              className="rounded-full bg-slate-950 px-7 py-4 font-black text-white"
            >
              Login to Demo
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-white px-7 py-4 font-black text-slate-950"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}