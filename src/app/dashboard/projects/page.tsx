import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma, ProjectStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentUserWithWorkspace } from "@/lib/current-user";
import SubmitButton from "@/components/submit-button";
import { createProject } from "./actions";

export const metadata: Metadata = {
  title: "Projects",
  description: "Create, review, and track projects in your FlowPilot workspace.",
};

function getStatusStyle(status: string) {
  if (status === "COMPLETED") return "bg-emerald-100 text-emerald-700";
  if (status === "ARCHIVED") return "bg-slate-200 text-slate-600";
  return "bg-cyan-100 text-cyan-700";
}

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; clientId?: string }> }) {
  const { workspace } = await getCurrentUserWithWorkspace();
  const params = await searchParams;
  const q = (params.q ?? "").trim().slice(0, 100);
  const allowedStatuses = new Set(["ACTIVE", "COMPLETED", "ARCHIVED"]);
  const status = allowedStatuses.has(params.status ?? "") ? params.status as ProjectStatus : undefined;
  const clientId = /^[a-f\d]{24}$/i.test(params.clientId ?? "") ? params.clientId : params.clientId === "internal" ? "internal" : undefined;
  const where: Prisma.ProjectWhereInput = { workspaceId: workspace.id, ...(status ? { status } : {}), ...(q ? { name: { contains: q, mode: "insensitive" } } : {}), ...(clientId === "internal" ? { clientId: null } : clientId ? { clientId } : {}) };

  const [projects, clients] = await Promise.all([prisma.project.findMany({
    where,
    include: {
      tasks: true,
      client: { select: { id: true, name: true } },
    },
    orderBy: {
      createdAt: "desc",
    },
  }), prisma.client.findMany({ where: { workspaceId: workspace.id }, orderBy: { name: "asc" }, select: { id: true, name: true } })]);

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-cyan-700">
            Projects
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Manage Projects
          </h2>
          <p className="mt-2 max-w-2xl text-slate-500">
            Create, track, and manage all client/internal work inside your
            workspace.
          </p>
        </div>
      </div>

      <form method="get" className="mb-6 grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_180px_220px_auto_auto]">
        <input aria-label="Search projects" name="q" defaultValue={q} placeholder="Search project name" className="rounded-xl border border-slate-200 px-4 py-3" />
        <select aria-label="Filter project status" name="status" defaultValue={status ?? ""} className="rounded-xl border border-slate-200 px-4 py-3"><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="COMPLETED">Completed</option><option value="ARCHIVED">Archived</option></select>
        <select aria-label="Filter project client" name="clientId" defaultValue={clientId ?? ""} className="rounded-xl border border-slate-200 px-4 py-3"><option value="">All clients</option><option value="internal">Internal / no client</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select>
        <button className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white">Apply</button>
        <Link href="/dashboard/projects" className="rounded-xl border border-slate-200 px-5 py-3 text-center font-bold">Reset</Link>
      </form>
      <div className="mb-6 flex justify-end"><a href={`/api/export/projects?${new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}), ...(clientId ? { clientId } : {}) })}`} className="rounded-xl border border-cyan-300 bg-cyan-50 px-4 py-2 text-sm font-black text-cyan-900">Export filtered CSV</a></div>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form
          action={createProject}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="text-xl font-black text-slate-950">
            Create New Project
          </h3>

          <div className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="new-project-name"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Project Name
              </label>
              <input
                id="new-project-name"
                name="name"
                required
                placeholder="Website Redesign"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-cyan-400 focus:bg-white"
              />
            </div>

            <div>
              <label
                htmlFor="new-project-description"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Description
              </label>
              <textarea
                id="new-project-description"
                name="description"
                rows={5}
                placeholder="Short project summary..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-cyan-400 focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="new-project-client" className="mb-2 block text-sm font-bold text-slate-700">Client (optional)</label>
              <select id="new-project-client" name="clientId" defaultValue="" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <option value="">Internal / no client</option>
                {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
              </select>
            </div>

            <SubmitButton
              pendingText="Creating Project..."
              className="w-full rounded-2xl bg-slate-950 px-5 py-3 font-black text-white transition hover:bg-slate-800"
            >
              Create Project
            </SubmitButton>
          </div>
        </form>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-950">
              All Projects
            </h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {projects.length} total
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <p className="text-lg font-black text-slate-950">
                No projects yet
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Create your first project from the form on the left.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => {
                const doneTasks = project.tasks.filter(
                  (task) => task.status === "DONE"
                ).length;

                const progress =
                  project.tasks.length === 0
                    ? 0
                    : Math.round((doneTasks / project.tasks.length) * 100);

                return (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-cyan-300 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h4 className="break-words font-black text-slate-950">
                          {project.name}
                        </h4>
                        <p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-slate-500">
                          {project.description || "No description added."}
                        </p>
                        <p className="mt-2 text-xs font-black text-cyan-800">{project.client ? `Client: ${project.client.name}` : "Internal project"}</p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${getStatusStyle(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                    </div>

                    <div className="mt-6">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-bold text-slate-500">
                          Progress
                        </span>
                        <span className="font-black text-slate-950">
                          {progress}%
                        </span>
                      </div>

                      <div className="h-2 rounded-full bg-slate-200">
                        <div
                          className="h-2 rounded-full bg-cyan-400"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <p className="mt-4 text-sm font-bold text-slate-500">
                      {project.tasks.length} {project.tasks.length === 1 ? "task" : "tasks"}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
