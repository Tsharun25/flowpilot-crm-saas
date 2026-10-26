import type { Metadata } from "next";
import Link from "next/link";
import ForgotPasswordForm from "./forgot-password-form";

export const metadata: Metadata = { title: "Forgot password", description: "Request a secure FlowPilot password reset.", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default function ForgotPasswordPage() {
  return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-12 text-white"><div className="w-full max-w-md"><Link href="/" className="mb-8 block text-center text-3xl font-black">FlowPilot</Link><section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl sm:p-8"><h1 className="text-3xl font-black">Reset your password</h1><p className="mt-2 text-sm text-slate-400">Enter your account email. Eligible accounts receive a single-use link.</p><ForgotPasswordForm /><p className="mt-6 text-center text-sm"><Link href="/login" className="font-semibold text-cyan-300">Back to login</Link><span className="mx-2 text-slate-600">·</span><Link href="/support" className="font-semibold text-cyan-300">Support</Link></p></section></div></main>;
}
