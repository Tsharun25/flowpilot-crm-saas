import type { Metadata } from "next";
import Link from "next/link";
import PublicFooter from "@/components/public-footer";
import PublicHeader from "@/components/public-header";
import { getConfiguredSupportUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Support",
  description: "Find help with FlowPilot CRM, demo access, and account recovery.",
};

export default function SupportPage() {
  const supportUrl = getConfiguredSupportUrl();

  return (
    <>
      <PublicHeader />
      <main className="flow-document mx-auto min-h-[75vh] max-w-5xl px-6 py-12 sm:py-16">
        <h1 className="text-4xl font-bold text-slate-950 sm:text-5xl">FlowPilot support</h1>
        <p className="mt-3 max-w-2xl text-slate-600">Find the right place to get help with your account, the demo, or a marketplace purchase.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <section className="rounded-2xl border border-violet-100 bg-white p-5 sm:p-6">
            <h2 className="text-xl font-semibold">Recover your account</h2>
            <p className="mt-2 text-slate-600">Request a single-use reset link. If you can no longer access your account email, contact the operator of your FlowPilot instance.</p>
            <Link href="/forgot-password" className="flow-button mt-4">Reset password</Link>
          </section>
          <section className="rounded-2xl border border-violet-100 bg-white p-5 sm:p-6">
            <h2 className="text-xl font-semibold">Explore the demo</h2>
            <p className="mt-2 text-slate-600">Choose Owner, Admin or Member to browse the same sample workspace. Editing is disabled in the demo.</p>
            <Link href="/login" className="flow-button flow-button-outline mt-4">Live Demo</Link>
          </section>
          <section className="rounded-2xl border border-violet-100 bg-white p-5 sm:col-span-2 sm:p-6">
            <h2 className="text-xl font-semibold">Get help with a purchase</h2>
            <p className="mt-2 text-slate-600">If you bought FlowPilot on Vibe96, open a support ticket from the purchase in your account. Include the page and steps that produced the issue.</p>
            {supportUrl ? <a href={supportUrl} className="flow-button flow-button-outline mt-4">Contact support</a> : null}
          </section>
        </div>
        <p className="mt-5 text-sm text-slate-600">Keep passwords, credentials and customer data out of support requests.</p>
      </main>
      <PublicFooter />
    </>
  );
}
