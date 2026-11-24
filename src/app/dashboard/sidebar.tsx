"use client";

import Link from "next/link";
import FlowPilotBrand from "@/components/flowpilot-brand";
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
    <aside className="flow-sidebar sticky top-0 hidden h-dvh w-60 shrink-0 overflow-y-auto p-5 lg:block">
      <FlowPilotBrand href="/dashboard" />
      <p className="flow-sidebar-label">Workspace</p>
      <nav className="space-y-1" aria-label="Workspace navigation">
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
              className="flow-sidebar-link"
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
