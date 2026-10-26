import type { Metadata } from "next";
import Link from "next/link";
import ResetPasswordForm from "./reset-password-form";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const value = (await searchParams).token; const token = typeof value === "string" ? value : "";
  return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-12 text-white"><div className="w-full max-w-md"><Link href="/" className="mb-8 block text-center text-3xl font-black">FlowPilot</Link><section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl sm:p-8"><h1 className="text-3xl font-black">Choose a new password</h1><p className="mt-2 text-sm text-slate-400">Use 8–72 characters. This link can be used once.</p><ResetPasswordForm token={token} /><p className="mt-6 text-center text-sm"><Link href="/forgot-password" className="font-semibold text-cyan-300">Request another link</Link></p></section></div></main>;
}
