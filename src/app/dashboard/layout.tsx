import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardSidebar from "./sidebar";
import MobileSidebar from "./mobile-sidebar";

import LogoutButton from "./logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) redirect("/login");

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
  });

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
                    {membership?.workspace.name || "FlowPilot Workspace"}
                  </p>
                  <h1 className="text-xl font-black text-slate-950 md:text-2xl">
                    Welcome, {session.user.name || "User"}
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