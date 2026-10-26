import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUserWithWorkspace } from "@/lib/current-user";
import DashboardSidebar from "./sidebar";
import MobileSidebar from "./mobile-sidebar";
import LogoutButton from "./logout-button";
import { isDemoWorkspace } from "@/lib/demo-workspace";

export const metadata: Metadata = {
  title: {
    default: "Workspace",
    template: "%s | FlowPilot CRM",
  },
  description: "Manage your FlowPilot projects, tasks, clients, and analytics.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, workspace } = await getCurrentUserWithWorkspace();

  if (!user?.id) redirect("/login");
  const demoReadOnly = isDemoWorkspace(workspace, user.email);

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <div className="flex min-h-screen">
        <DashboardSidebar />

        <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-3 py-3 backdrop-blur-xl sm:px-4 sm:py-4 lg:px-8">
            <div className="flex min-w-0 items-center justify-between gap-2 sm:gap-4">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <MobileSidebar />

                <div className="min-w-0">
                  <p className="truncate text-[10px] font-bold uppercase tracking-wide text-slate-600 sm:text-xs">
                    {workspace.name}
                  </p>
                  <h1 className="truncate text-lg font-black text-slate-950 sm:text-xl lg:text-2xl">
                    <span className="sm:hidden">{user.name || "User"}</span>
                    <span className="hidden sm:inline">
                      Welcome, {user.name || "User"}
                    </span>
                  </h1>
                </div>
              </div>

              <LogoutButton />
            </div>
          </header>

          <main className="min-w-0 p-3 sm:p-4 lg:p-8">
            {demoReadOnly ? (
              <div role="status" className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-950">
                Demo workspace — changes are disabled. Create your own account to try editing; browsing and exports remain available.
              </div>
            ) : null}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
