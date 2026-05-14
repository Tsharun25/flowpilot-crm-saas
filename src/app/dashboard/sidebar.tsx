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
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white p-6 md:block">
      <Link href="/dashboard" className="mb-10 flex items-center gap-3">
        <div className="grid size-12 place-items-center rounded-2xl bg-slate-950 text-xl font-black text-white shadow-lg">
          F
        </div>
        <div>
          <p className="text-2xl font-black leading-none text-slate-950">
            FlowPilot
          </p>
          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-cyan-600">
            SaaS CRM
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
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition ${
                active
                  ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 rounded-3xl bg-gradient-to-br from-slate-950 to-slate-800 p-5 text-white">
        <p className="text-sm font-black text-cyan-300">Portfolio Tip</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Add demo data and deploy this app with a public demo login.
        </p>
      </div>
    </aside>
  );
}