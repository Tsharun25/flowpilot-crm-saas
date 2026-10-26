import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma, Priority, TaskStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentUserWithWorkspace } from "@/lib/current-user";
import TaskStatusForm from "../projects/[projectId]/task-status-form";
import { isDemoWorkspace } from "@/lib/demo-workspace";

export const metadata: Metadata = {
  title: "Workspace tasks",
  description: "Review tasks from every workspace project on one Kanban board.",
};

const columns = [
  { label: "Todo", value: "TODO" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Review", value: "REVIEW" },
  { label: "Done", value: "DONE" },
] as const;

function getPriorityStyle(priority: string) {
  if (priority === "URGENT") return "bg-red-100 text-red-700";
  if (priority === "HIGH") return "bg-orange-100 text-orange-700";
  if (priority === "LOW") return "bg-slate-100 text-slate-600";
  return "bg-blue-100 text-blue-700";
}

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ q?: string; projectId?: string; status?: string; priority?: string; overdue?: string }> }) {
  const { user, workspace } = await getCurrentUserWithWorkspace();
  const demoReadOnly = isDemoWorkspace(workspace, user.email);
  const params = await searchParams;
  const q = (params.q ?? "").trim().slice(0, 100);
  const status = new Set(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]).has(params.status ?? "") ? params.status as TaskStatus : undefined;
  const priority = new Set(["LOW", "MEDIUM", "HIGH", "URGENT"]).has(params.priority ?? "") ? params.priority as Priority : undefined;
  const projectId = /^[a-f\d]{24}$/i.test(params.projectId ?? "") ? params.projectId : undefined;
  const overdue = params.overdue === "1";
  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const where: Prisma.TaskWhereInput = { project: { workspaceId: workspace.id }, ...(q ? { title: { contains: q, mode: "insensitive" } } : {}), ...(status ? { status } : {}), ...(priority ? { priority } : {}), ...(projectId ? { projectId } : {}), ...(overdue ? { dueDate: { lt: todayUtc }, status: { not: "DONE" } } : {}) };

  const [tasks, projects] = await Promise.all([prisma.task.findMany({
    where,
    include: {
      project: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  }), prisma.project.findMany({ where: { workspaceId: workspace.id }, orderBy: { name: "asc" }, select: { id: true, name: true } })]);

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-wide text-cyan-700">
          Tasks
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Workspace Kanban
        </h2>
        <p className="mt-2 max-w-2xl text-slate-500">
          See all tasks from every project in one board.
        </p>
      </div>

      <form method="get" className="mb-6 grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3 xl:grid-cols-7">
        <input aria-label="Search tasks" name="q" defaultValue={q} placeholder="Search task title" className="rounded-xl border border-slate-200 px-3 py-2" />
        <select aria-label="Filter task project" name="projectId" defaultValue={projectId ?? ""} className="rounded-xl border border-slate-200 px-3 py-2"><option value="">All projects</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>
        <select aria-label="Filter task status" name="status" defaultValue={status ?? ""} className="rounded-xl border border-slate-200 px-3 py-2"><option value="">All statuses</option><option value="TODO">Todo</option><option value="IN_PROGRESS">In progress</option><option value="REVIEW">Review</option><option value="DONE">Done</option></select>
        <select aria-label="Filter task priority" name="priority" defaultValue={priority ?? ""} className="rounded-xl border border-slate-200 px-3 py-2"><option value="">All priorities</option><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></select>
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold"><input type="checkbox" name="overdue" value="1" defaultChecked={overdue} /> Overdue only</label>
        <button className="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white">Apply</button><Link href="/dashboard/tasks" className="rounded-xl border border-slate-200 px-4 py-2 text-center font-bold">Reset</Link>
      </form>
      <div className="mb-6 flex justify-end"><a href={`/api/export/tasks?${new URLSearchParams({ ...(q ? { q } : {}), ...(projectId ? { projectId } : {}), ...(status ? { status } : {}), ...(priority ? { priority } : {}), ...(overdue ? { overdue: "1" } : {}) })}`} className="rounded-xl border border-cyan-300 bg-cyan-50 px-4 py-2 text-sm font-black text-cyan-900">Export filtered CSV</a></div>

      {tasks.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-black text-slate-950">No tasks yet</p>
          <p className="mt-2 text-sm text-slate-500">
            Open a project and create your first task.
          </p>
          <Link
            href="/dashboard/projects"
            className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white"
          >
            Go to Projects
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-4">
          {columns.map((column) => {
            const columnTasks = tasks.filter(
              (task) => task.status === column.value
            );

            return (
              <section key={column.value} className="rounded-3xl bg-white p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-black text-slate-950">{column.label}</h3>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {columnTasks.map((task) => (
                    <article
                      key={task.id}
                      data-testid="workspace-task-card"
                      className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-300 hover:bg-white"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="break-words font-black text-slate-950">
                            {task.title}
                          </p>
                          <Link href={`/dashboard/projects/${task.projectId}`} className="mt-1 block break-words text-xs font-bold text-cyan-800 underline-offset-2 hover:underline">{task.project.name}</Link>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-black ${getPriorityStyle(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {task.description ? (
                        <p className="mt-3 break-words text-sm leading-6 text-slate-500">
                          {task.description}
                        </p>
                      ) : null}
                      {task.dueDate ? <p className={`mt-3 rounded-full px-2.5 py-1 text-xs font-black ${task.status !== "DONE" && task.dueDate < todayUtc ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-800"}`}>{task.status !== "DONE" && task.dueDate < todayUtc ? "Overdue · " : "Due · "}{task.dueDate.toISOString().slice(0, 10)}</p> : null}
                      <TaskStatusForm projectId={task.projectId} taskId={task.id} currentStatus={task.status} disabled={demoReadOnly} />
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
