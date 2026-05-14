import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "./logout-button";

const stats = [
  { label: "Total Projects", value: "12" },
  { label: "Active Tasks", value: "48" },
  { label: "Clients", value: "23" },
  { label: "Pipeline Value", value: "$84.2k" },
];

const tasks = [
  { title: "Design CRM dashboard", status: "In Progress", priority: "High" },
  { title: "Prepare client proposal", status: "Review", priority: "Medium" },
  { title: "Fix onboarding flow", status: "Todo", priority: "Urgent" },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const membership = await prisma.membership.findFirst({
    where: {
      userId: session.user.id,
    },
    include: {
      workspace: true,
    },
  });

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-slate-500">
              {membership?.workspace.name || "FlowPilot Workspace"}
            </p>

            <h1 className="text-4xl font-black tracking-tight text-slate-950">
              Welcome, {session.user.name || "User"}
            </h1>
          </div>

          <LogoutButton />
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-3 text-3xl font-black text-slate-950">
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="mb-5 text-xl font-bold text-slate-950">
              Recent Tasks
            </h2>

            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.title}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
                >
                  <div>
                    <p className="font-semibold text-slate-950">{task.title}</p>
                    <p className="text-sm text-slate-500">{task.status}</p>
                  </div>

                  <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-sm text-cyan-300">CRM Health</p>
            <h2 className="mt-3 text-3xl font-black">Strong</h2>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              You have 8 warm leads, 4 active proposals, and 3 projects close to
              completion.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}