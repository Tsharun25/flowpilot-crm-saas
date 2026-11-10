import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Layers3,
  ShieldCheck,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your FlowPilot CRM workspace.",
};

const benefits = [
  { icon: Layers3, text: "Linked CRM and projects" },
  { icon: BarChart3, text: "Live workspace analytics" },
  { icon: ShieldCheck, text: "Role-aware access" },
  { icon: CheckCircle2, text: "Read-only demo data" },
];

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) redirect("/dashboard");

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050814] px-4 py-5 text-white sm:px-6 sm:py-8 lg:grid lg:grid-cols-[1.08fr_.92fr] lg:items-stretch lg:gap-6 lg:p-6">
      <div className="pointer-events-none absolute left-[-14rem] top-[-14rem] size-[36rem] rounded-full bg-cyan-400/15 blur-[120px]" />

      <section className="relative hidden min-h-[calc(100vh-3rem)] overflow-hidden rounded-[2.5rem] border border-white/10 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,.18),transparent_24rem),radial-gradient(circle_at_90%_80%,rgba(79,70,229,.2),transparent_28rem),linear-gradient(145deg,#0b1125,#080a17)] p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
        <Link href="/" className="flex items-center gap-3" aria-label="FlowPilot home">
          <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 text-lg font-black text-slate-950 shadow-lg shadow-cyan-500/20">F</span>
          <span><span className="block text-xl font-black leading-none">FlowPilot</span><span className="mt-1 block text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">CRM + Projects</span></span>
        </Link>

        <div className="my-12">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Explore the real product</p>
          <h1 className="mt-5 text-5xl font-black leading-[1.02] tracking-[-0.045em] xl:text-6xl">One workspace.<br /><span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">Every client workflow.</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">Choose a role and step directly into a safe, read-only workspace with realistic projects, tasks, clients and analytics.</p>

          <div className="mt-9 grid gap-3 sm:grid-cols-2">
            {benefits.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm font-bold text-slate-200 backdrop-blur">
                <Icon size={18} className="text-cyan-300" />
                {text}
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-slate-500">Self-hosted · Responsive · Built for focused client work</p>
      </section>

      <div className="relative flex min-h-[calc(100vh-2.5rem)] items-center justify-center lg:min-h-0">
        <div className="w-full max-w-lg">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-white lg:hidden"><ArrowLeft size={16} /> Back to FlowPilot</Link>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.065] p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-8">
            <div className="mb-7 text-center">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Secure workspace access</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Welcome to FlowPilot</h2>
              <p className="mt-3 text-sm text-slate-400">Sign in normally or explore every role instantly.</p>
            </div>

            <LoginForm />

            <p className="mt-5 text-center text-sm"><Link href="/forgot-password" className="font-semibold text-cyan-300 transition hover:text-cyan-200">Forgot password?</Link></p>
            <p className="mt-5 text-center text-sm text-slate-400">Don&apos;t have an account? <Link href="/register" className="font-semibold text-cyan-300 transition hover:text-cyan-200">Create one</Link></p>
          </div>
        </div>
      </div>
    </main>
  );
}
