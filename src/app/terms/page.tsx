import type { Metadata } from "next";
import PublicFooter from "@/components/public-footer";

export const metadata: Metadata = { title: "Terms", description: "FlowPilot CRM deployment and usage terms notice." };

export default function TermsPage() {
  return <><main className="mx-auto min-h-[80vh] max-w-3xl px-6 py-16"><h1 className="text-4xl font-black text-slate-950">Terms notice</h1><div className="mt-8 space-y-5 leading-7 text-slate-700"><p>FlowPilot is distributed as source code for a self-hosted CRM and project management starter. It is not a managed service, payment processor, legal-compliance service or security certification.</p><p>The deployment owner is responsible for supplying seller identity, final customer terms, licensing details, support commitments, infrastructure, backups, security configuration and compliance obligations before accepting users.</p><p>Demo values and screenshots are illustrative and are not promises of revenue, profit or business results.</p></div></main><PublicFooter /></>;
}
