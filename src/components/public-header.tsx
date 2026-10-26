import Link from "next/link";

export default function PublicHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav aria-label="Public navigation" className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-3 font-black text-slate-950">
          <span className="grid size-9 place-items-center rounded-xl bg-cyan-400">F</span>
          FlowPilot CRM
        </Link>
        <div className="flex items-center gap-4 text-sm font-bold">
          <Link href="/" className="text-slate-600 hover:text-slate-950">Home</Link>
          <Link href="/login" className="rounded-full bg-slate-950 px-4 py-2 text-white">Login</Link>
        </div>
      </nav>
    </header>
  );
}
