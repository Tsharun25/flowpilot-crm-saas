import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getCurrentUserWithWorkspace } from "@/lib/current-user";
import { createProject } from "./actions";

function getStatusStyle(status: string) {
  if (status === "COMPLETED") return "bg-emerald-100 text-emerald-700";
  if (status === "ARCHIVED") return "bg-slate-200 text-slate-600";
  return "bg-cyan-100 text-cyan-700";
}

export default async function ProjectsPage() {
  const { workspace } = await getCurrentUserWithWorkspace();

  const projects = await prisma.project.findMany({
    where: {
      workspaceId: workspace.id,
    },
    include: {
      tasks: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-cyan-600">
            Projects
          </p>
          <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
            Manage Projects
          </h2>
          <p className="mt-2 max-w-2xl text-slate-500">
            Create, track, and manage all client/internal work inside your
            workspace.
          </p>
        </div>
      </div>

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
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Project Name
              </label>
              <input
                name="name"
                required
                placeholder="Website Redesign"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-cyan-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Description
              </label>
              <textarea
                name="description"
                rows={5}
                placeholder="Short project summary..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-cyan-400 focus:bg-white"
              />
            </div>

            <button className="w-full rounded-2xl bg-slate-950 px-5 py-3 font-black text-white transition hover:bg-slate-800">
              Create Project
            </button>
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
                      <div>
                        <h4 className="font-black text-slate-950">
                          {project.name}
                        </h4>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                          {project.description || "No description added."}
                        </p>
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
                      {project.tasks.length} tasks
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