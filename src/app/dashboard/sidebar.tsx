"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BriefcaseBusiness,
  CheckSquare,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/dashboard/projects", icon: BriefcaseBusiness },
  { label: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { label: "Clients", href: "/dashboard/clients", icon: Users },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 overflow-y-auto border-r border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,.16),transparent_18rem),linear-gradient(180deg,#090e20_0%,#060914_100%)] p-6 text-white shadow-2xl xl:block">
      <Link href="/dashboard" className="mb-10 flex items-center gap-3">
        <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 text-xl font-black text-slate-950 shadow-lg shadow-cyan-500/20">
          F
        </div>
        <div>
          <p className="text-2xl font-black leading-none text-white">
            FlowPilot
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
            CRM + Projects
          </p>
        </div>
      </Link>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition ${
                active
                  ? "bg-gradient-to-r from-cyan-300 to-blue-400 text-slate-950 shadow-lg shadow-cyan-500/15"
                  : "text-slate-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 rounded-3xl bg-gradient-to-br from-slate-950 to-slate-800 p-5 text-white">
        <p className="text-sm font-black text-cyan-300">Workspace Tip</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Keep projects, tasks, and client opportunities moving from one place.
        </p>
      </div>
    </aside>
  );
}
