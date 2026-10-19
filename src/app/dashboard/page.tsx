import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, CheckSquare, DollarSign, Users } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getCurrentUserWithWorkspace } from "@/lib/current-user";
import AnalyticsChart from "./analytics-chart";
import { formatMoney, getWorkspaceCrmMetrics } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "Workspace overview",
  description: "Review workspace projects, active tasks, clients, and CRM totals.",
};

export default async function DashboardPage() {
  const { workspace } = await getCurrentUserWithWorkspace();

  const [totalProjects, activeTasks, totalClients, crmMetrics, recentProjects] =
    await Promise.all([
      prisma.project.count({ where: { workspaceId: workspace.id } }),

      prisma.task.count({
        where: {
          project: { workspaceId: workspace.id },
          status: { not: "DONE" },
        },
      }),

      prisma.client.count({ where: { workspaceId: workspace.id } }),

      getWorkspaceCrmMetrics(workspace.id),

      prisma.project.findMany({
        where: { workspaceId: workspace.id },
        include: { tasks: true },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
    ]);

  const stats = [
    {
      label: "Projects",
      value: totalProjects,
      note: "Workspace projects",
      icon: BriefcaseBusiness,
    },
    {
      label: "Active Tasks",
      value: activeTasks,
      note: "Not completed",
      icon: CheckSquare,
    },
    {
      label: "Clients",
      value: totalClients,
      note: "CRM contacts",
      icon: Users,
    },
    {
      label: "Open Pipeline",
      value: formatMoney(crmMetrics.openPipeline),
      note: "Lead + Contacted",
      icon: DollarSign,
    },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-cyan-700">
            Overview
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Command Center
          </h2>
          <p className="mt-3 max-w-2xl text-slate-500">
            A premium SaaS dashboard for projects, tasks, clients, and deal value.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/projects"
            className="rounded-full bg-slate-950 px-6 py-3 text-center font-black text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800"
          >
            New Project
          </Link>

          <Link
            href="/dashboard/clients"
            className="rounded-full bg-cyan-400 px-6 py-3 text-center font-black text-slate-950 shadow-lg shadow-cyan-400/20 transition hover:bg-cyan-300"
          >
            Add Client
          </Link>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200"
            >
              <div className="flex items-start justify-between">
                <div className="grid size-12 place-items-center rounded-2xl bg-slate-950 text-white">
                  <Icon size={20} />
                </div>

                <ArrowUpRight className="text-slate-300" size={20} />
              </div>

              <p className="mt-6 text-sm font-bold text-slate-500">
                {stat.label}
              </p>
              <p className="mt-2 break-words text-xl font-black text-slate-950 sm:text-2xl 2xl:text-3xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-bold text-emerald-600">
                {stat.note}
              </p>
            </div>
          );
        })}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-cyan-700">
                Analytics
              </p>
              <h3 className="mt-1 text-2xl font-black text-slate-950">
                Won Deal Value · {crmMetrics.year}
              </h3>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
              {crmMetrics.growth === null ? "No prior-period baseline" : `${crmMetrics.growth >= 0 ? "+" : ""}${crmMetrics.growth.toFixed(1)}% MoM`}
            </span>
          </div>

          {crmMetrics.hasWonData ? <AnalyticsChart data={crmMetrics.monthlyWon} currency={crmMetrics.currency} /> : <div className="grid h-80 place-items-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><div><p className="font-black text-slate-950">No won deals in {crmMetrics.year}</p><p className="mt-2 text-sm text-slate-500">The chart will update when a deal is marked Won.</p></div></div>}
        </div>

        <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 to-slate-800 p-6 text-white shadow-xl shadow-slate-300">
          <p className="text-sm font-black text-cyan-300">CRM Pulse</p>
          <h3 className="mt-4 break-words text-2xl font-black sm:text-3xl 2xl:text-4xl">
            {formatMoney(crmMetrics.openPipeline)}
          </h3>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Open pipeline includes Lead and Contacted opportunities only.
          </p>

          <Link
            href="/dashboard/clients"
            className="mt-8 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950"
          >
            View CRM
          </Link>
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-2xl font-black text-slate-950">
            Recent Projects
          </h3>
          <Link href="/dashboard/projects" className="text-sm font-black text-cyan-700">
            View all
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <p className="text-lg font-black text-slate-950">No projects yet</p>
            <p className="mt-2 text-sm text-slate-500">
              Create your first project to make this dashboard come alive.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-cyan-300 hover:bg-white hover:shadow-sm"
              >
                <p className="break-words font-black text-slate-950">{project.name}</p>
                <p className="mt-2 text-sm text-slate-500">
                  {project.tasks.length} {project.tasks.length === 1 ? "task" : "tasks"} • {project.status}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
