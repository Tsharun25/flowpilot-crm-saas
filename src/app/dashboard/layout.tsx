import { redirect } from "next/navigation";

import { getCurrentUserWithWorkspace } from "@/lib/current-user";
import DashboardSidebar from "./sidebar";
import MobileSidebar from "./mobile-sidebar";
import LogoutButton from "./logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, workspace } = await getCurrentUserWithWorkspace();

  if (!user?.id) redirect("/login");

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <div className="flex min-h-screen">
        <DashboardSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur-xl md:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <MobileSidebar />

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    {workspace.name}
                  </p>
                  <h1 className="text-xl font-black text-slate-950 md:text-2xl">
                    Welcome, {user.name || "User"}
                  </h1>
                </div>
              </div>

              <LogoutButton />
            </div>
          </header>

          <main className="p-4 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}