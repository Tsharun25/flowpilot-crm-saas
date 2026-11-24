import Link from "next/link";
import PublicHeader from "@/components/public-header";
import PublicFooter from "@/components/public-footer";

export default function NotFound() {
  return (
    <>
      <PublicHeader />
      <main className="flow-document mx-auto min-h-[65vh] max-w-3xl px-6 py-20">
        <h1 className="text-4xl font-bold">Page not found</h1>
        <p className="mt-3 max-w-lg text-slate-600">This page may have moved or the address may be incorrect.</p>
        <Link href="/" className="flow-button mt-6">Back to FlowPilot</Link>
      </main>
      <PublicFooter />
    </>
  );
}
