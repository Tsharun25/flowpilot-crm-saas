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
    <div className="premium-dashboard min-h-screen">
      <div className="flex min-h-screen">
        <DashboardSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flow-workspace-header sticky top-0 z-30 px-3 py-3 sm:px-5 lg:px-8">
            <div className="flex min-w-0 items-center justify-between gap-2 sm:gap-4">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <MobileSidebar />

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950 sm:text-base">{workspace.name}</p>
                  <p className="truncate text-sm text-slate-600">{user.name || "Workspace member"}</p>
                </div>
              </div>

              <LogoutButton />
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1600px] min-w-0 p-3 sm:p-5 lg:p-7 xl:p-8">
            {demoReadOnly ? (
              <div role="status" className="flow-workspace-notice mb-5 text-sm">
                Read-only demo. Changes are disabled. Browse the sample workspace and export records.
              </div>
            ) : null}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
