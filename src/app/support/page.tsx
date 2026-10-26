import type { Metadata } from "next";
import PublicFooter from "@/components/public-footer";

export const metadata: Metadata = { title: "Support", description: "FlowPilot CRM support and account recovery guidance." };

export default function SupportPage() {
  return <><main className="mx-auto min-h-[80vh] max-w-3xl px-6 py-16"><h1 className="text-4xl font-black text-slate-950">Support and account recovery</h1><div className="mt-8 space-y-5 leading-7 text-slate-700"><p>This source package does not include outbound email infrastructure, so self-service password reset is intentionally unavailable. Contact the administrator of your FlowPilot deployment using the support channel they publish.</p><p>Deployment owners: configure <code>NEXT_PUBLIC_SUPPORT_URL</code> with an HTTPS help-desk or contact page before launch. Verify the requester&apos;s identity privately, then follow the documented operator recovery procedure in <code>HowToSetup.md</code>. Never expose a public administrator reset endpoint or send passwords in plain text.</p><p>If this page still shows generic guidance, the deployment owner has not configured a support destination.</p></div></main><PublicFooter /></>;
}
