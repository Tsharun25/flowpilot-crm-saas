import type { Metadata } from "next";
import PublicFooter from "@/components/public-footer";
import PublicHeader from "@/components/public-header";

export const metadata: Metadata = { title: "Privacy", description: "FlowPilot CRM privacy information for self-hosted deployments." };

export default function PrivacyPage() {
  return <><PublicHeader /><main className="mx-auto min-h-[80vh] max-w-3xl px-6 py-16"><h1 className="text-4xl font-black text-slate-950">Privacy</h1><div className="mt-8 space-y-5 leading-7 text-slate-700"><p>FlowPilot stores account, workspace, client, project, task, note and activity data in the MongoDB database configured by the deployment owner. Passwords are stored as bcrypt hashes; the application does not include advertising trackers or marketing-email automation.</p><p>The deployment owner controls hosting, database access, retention, backups, support contact and any additional analytics or integrations they add. Before using real customer data, the owner must publish business identity, jurisdiction-specific privacy terms and a retention/deletion process.</p><p>The included public demo uses synthetic data. Do not enter personal, confidential or customer information into it.</p></div></main><PublicFooter /></>;
}
