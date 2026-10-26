import type { Metadata } from "next";
import PublicFooter from "@/components/public-footer";
import PublicHeader from "@/components/public-header";
import { getConfiguredSupportUrl } from "@/lib/site";

export const metadata: Metadata = { title: "Support", description: "FlowPilot CRM support and account recovery guidance." };

export default function SupportPage() {
  const supportUrl = getConfiguredSupportUrl();
  return <><PublicHeader /><main className="mx-auto min-h-[80vh] max-w-3xl px-6 py-16"><h1 className="text-4xl font-black text-slate-950">Support and account recovery</h1><div className="mt-8 space-y-5 leading-7 text-slate-700"><p>Use <a href="/forgot-password" className="font-bold text-cyan-700 underline">Forgot password</a> to request a secure, single-use reset link. If email delivery is unavailable or you no longer control the account email, contact the deployment operator for privately verified assistance.</p>{supportUrl ? <p><a href={supportUrl} className="inline-flex rounded-full bg-slate-950 px-5 py-3 font-black text-white">Contact support</a></p> : <div role="note" className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950"><p className="font-bold">Support destination not configured</p><p className="mt-1 text-sm">A verified support destination has not yet been supplied for this deployment.</p></div>}<p>Never send passwords, database credentials, session tokens or private customer data in a support request.</p></div></main><PublicFooter /></>;
}
