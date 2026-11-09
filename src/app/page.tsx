import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, BriefcaseBusiness, Check, CheckCircle2, CheckSquare2, Database, Download, Layers3, LockKeyhole, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import PublicFooter from "@/components/public-footer";

export const metadata: Metadata = {
  title: "FlowPilot CRM — Clients, projects and delivery in one workspace",
  description: "A self-hosted CRM and project management starter for freelancers and small agencies, with client pipelines, linked projects, Kanban tasks and analytics.",
  alternates: { canonical: "/" },
};

const features = [
  { title: "Client pipeline", description: "Move opportunities from lead to won, record exact deal value and keep follow-ups visible.", icon: UsersRound, tone: "from-cyan-300/20 to-blue-500/10" },
  { title: "Linked project delivery", description: "Turn a won deal into a linked project once, then keep scope, progress and ownership together.", icon: BriefcaseBusiness, tone: "from-violet-300/20 to-indigo-500/10" },
  { title: "Kanban task control", description: "Prioritize work across Todo, In Progress, Review and Done with due-date filtering.", icon: CheckSquare2, tone: "from-emerald-300/20 to-cyan-500/10" },
  { title: "Workspace analytics", description: "See open pipeline, won value, delivery progress and workload from live workspace data.", icon: BarChart3, tone: "from-amber-300/20 to-orange-500/10" },
];

const benefits = [
  "One workspace instead of scattered spreadsheets",
  "Role-aware access for owners, admins and members",
  "Read-only public demo that visitors cannot break",
  "CSV export with spreadsheet-injection protection",
  "Responsive interface for desktop, tablet and mobile",
  "Docker and Node.js deployment documentation",
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050814] text-white">
      <div className="relative border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[8%] top-[-16rem] size-[40rem] rounded-full bg-cyan-400/15 blur-[120px]" />
          <div className="absolute right-[-10rem] top-[8rem] size-[34rem] rounded-full bg-blue-600/20 blur-[120px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        </div>

        <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="FlowPilot home">
            <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 text-lg font-black text-slate-950 shadow-lg shadow-cyan-500/20">F</span>
            <span><span className="block text-xl font-black leading-none">FlowPilot</span><span className="mt-1 block text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">CRM + Projects</span></span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-bold text-slate-300 md:flex" aria-label="Main navigation">
            <a href="#features" className="transition hover:text-white">Features</a><a href="#product" className="transition hover:text-white">Product</a><a href="#benefits" className="transition hover:text-white">Benefits</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="hidden rounded-full px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:text-white sm:inline-flex">Sign in</Link>
            <Link href="/login" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-black text-slate-950 transition hover:bg-cyan-300 sm:px-5">Live demo <ArrowRight size={16} /></Link>
          </div>
        </header>

        <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 sm:pb-28 sm:pt-20 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:pt-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.15em] text-cyan-200"><Sparkles size={15} /> Built for focused client work</div>
            <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-7xl">From first lead to final delivery.<span className="mt-2 block bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300 bg-clip-text text-transparent">One clear workspace.</span></h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">FlowPilot combines CRM, linked projects, Kanban tasks and workspace analytics for freelancers and small agencies that want less admin and better visibility.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-6 py-4 font-black text-slate-950 shadow-xl shadow-cyan-400/20 transition hover:-translate-y-0.5 hover:bg-cyan-200">Explore the live demo <ArrowRight size={18} /></Link>
              <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.06] px-6 py-4 font-black text-white backdrop-blur transition hover:border-white/30 hover:bg-white/10">Create a workspace</Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-400">
              {["One-click role demos", "Read-only sample data", "No card required"].map((item) => <span key={item} className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-300" />{item}</span>)}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-r from-cyan-400/20 via-blue-500/10 to-violet-500/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[#0b1122] p-2 shadow-2xl shadow-black/50 sm:p-3">
              <div className="flex items-center justify-between px-3 py-2 text-[11px] font-bold text-slate-400"><span className="flex gap-1.5"><i className="size-2 rounded-full bg-rose-400" /><i className="size-2 rounded-full bg-amber-300" /><i className="size-2 rounded-full bg-emerald-300" /></span><span>Workspace overview</span><span className="rounded-full bg-emerald-300/10 px-2 py-1 text-emerald-300">Live data</span></div>
              <Image src="/product/dashboard.png" alt="FlowPilot dashboard showing CRM, projects, tasks and workspace metrics" width={1920} height={1080} priority className="rounded-[1.4rem] border border-white/10" />
            </div>
            <div className="absolute -bottom-6 left-4 rounded-2xl border border-white/15 bg-slate-900/90 p-4 shadow-2xl backdrop-blur sm:-left-8 sm:p-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Built-in workflow</p><p className="mt-2 flex items-center gap-2 font-black"><CheckCircle2 size={18} className="text-emerald-300" /> Won deal → linked project</p></div>
          </div>
        </section>
      </div>

      <section id="features" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="max-w-3xl"><p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">Everything stays connected</p><h2 className="mt-4 text-4xl font-black tracking-[-0.035em] sm:text-5xl">A practical operating system for client work.</h2><p className="mt-5 text-lg leading-8 text-slate-400">Keep sales context, project delivery and performance reporting together without turning your workflow into a heavyweight enterprise system.</p></div>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {features.map(({ title, description, icon: Icon, tone }) => <article key={title} className={`group rounded-[1.75rem] border border-white/10 bg-gradient-to-br ${tone} p-7 transition hover:-translate-y-1 hover:border-white/20 sm:p-8`}><span className="grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/10 text-cyan-200"><Icon size={23} /></span><h3 className="mt-7 text-2xl font-black">{title}</h3><p className="mt-3 max-w-xl leading-7 text-slate-300">{description}</p></article>)}
        </div>
      </section>

      <section id="product" className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative"><div className="absolute inset-8 rounded-[3rem] bg-blue-500/20 blur-3xl" /><Image src="/product/crm-pipeline.png" alt="FlowPilot client pipeline with lead, contacted, won and lost stages" width={1920} height={1080} className="relative rounded-[1.75rem] border border-white/15 shadow-2xl shadow-black/40" /></div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-violet-300">See the full story</p><h2 className="mt-4 text-4xl font-black tracking-[-0.035em] sm:text-5xl">Know what is moving, what is due and what was won.</h2><p className="mt-6 text-lg leading-8 text-slate-400">FlowPilot turns everyday activity into a clear workspace: client status, follow-up dates, project progress, task priority and exact USD reporting.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { icon: Layers3, title: "Connected records", text: "Clients, projects and tasks stay linked." },
                { icon: Database, title: "Self-hosted data", text: "Run with your own MongoDB deployment." },
                { icon: ShieldCheck, title: "Workspace isolation", text: "Server-derived scope on reads and writes." },
                { icon: Download, title: "Safe CSV exports", text: "Take reporting data into spreadsheets." },
              ].map(({ icon: Icon, title, text }) => <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><Icon size={19} className="text-cyan-300" /><p className="mt-3 font-black">{title}</p><p className="mt-1 text-sm leading-6 text-slate-400">{text}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      <section id="benefits" className="mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-2 lg:items-center">
        <div><p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-300">Built to be useful</p><h2 className="mt-4 text-4xl font-black tracking-[-0.035em] sm:text-5xl">Start with a polished foundation. Keep control of your stack.</h2><p className="mt-6 text-lg leading-8 text-slate-400">Use the included application as your own operating workspace or as a clear foundation for a client-focused product.</p></div>
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.025] p-6 sm:p-8"><ul className="grid gap-3 sm:grid-cols-2">{benefits.map((benefit) => <li key={benefit} className="flex gap-3 rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm font-semibold leading-6 text-slate-200"><span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-300 text-slate-950"><Check size={13} strokeWidth={3} /></span>{benefit}</li>)}</ul></div>
      </section>

      <section className="px-5 pb-24 sm:px-8 sm:pb-32"><div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] border border-cyan-300/20 bg-gradient-to-br from-cyan-300 to-blue-500 px-6 py-14 text-center text-slate-950 shadow-2xl shadow-cyan-950/40 sm:px-12 sm:py-20"><div className="absolute -right-20 -top-32 size-80 rounded-full border-[50px] border-white/15" /><LockKeyhole className="relative mx-auto" size={32} /><h2 className="relative mx-auto mt-5 max-w-3xl text-4xl font-black tracking-[-0.04em] sm:text-5xl">Explore the real product in seconds.</h2><p className="relative mx-auto mt-5 max-w-2xl text-lg font-semibold leading-8 text-slate-900/75">Choose Owner, Admin or Member on the login screen. Every demo is one click and safely read-only.</p><Link href="/login" className="relative mt-8 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-7 py-4 font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-slate-900">Open live demo <ArrowRight size={18} /></Link></div></section>
      <PublicFooter />
    </main>
  );
}
