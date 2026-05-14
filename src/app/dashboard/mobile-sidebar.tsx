"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Projects", href: "/dashboard/projects" },
  { label: "Tasks", href: "/dashboard/tasks" },
  { label: "Clients", href: "/dashboard/clients" },
  { label: "Analytics", href: "/dashboard/analytics" },
  { label: "Settings", href: "/dashboard/settings" },
];

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="grid size-10 place-items-center rounded-2xl bg-slate-950 text-white"
      >
        <Menu size={18} />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm">
          <aside className="h-full w-80 bg-white p-6 shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="text-2xl font-black text-slate-950"
              >
                FlowPilot
              </Link>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-10 place-items-center rounded-2xl bg-slate-100 text-slate-950"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-sm font-black text-slate-600 hover:bg-slate-100"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      ) : null}
    </div>
  );
}