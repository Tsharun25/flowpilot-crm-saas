import Link from "next/link";
import { getSupportHref } from "@/lib/site";
import { APP_VERSION } from "@/lib/version";

export default function PublicFooter({ dark = false }: { dark?: boolean }) {
  const linkClass = dark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-950";
  return (
    <footer className={dark ? "border-t border-white/10 bg-slate-950" : "border-t border-slate-200 bg-white"}>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-7 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className={dark ? "text-slate-400" : "text-slate-500"}>FlowPilot CRM v{APP_VERSION} — self-hosted CRM &amp; project management starter.</p>
        <nav aria-label="Legal and support" className="flex flex-wrap gap-5 font-semibold">
          <Link className={linkClass} href="/privacy">Privacy</Link>
          <Link className={linkClass} href="/terms">Terms</Link>
          <Link className={linkClass} href={getSupportHref()}>Support</Link>
        </nav>
      </div>
    </footer>
  );
}
