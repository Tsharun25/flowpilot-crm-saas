import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getCurrentUserWithWorkspace } from "@/lib/current-user";
import TaskStatusForm from "../projects/[projectId]/task-status-form";
import { isDemoWorkspace } from "@/lib/demo-workspace";
import { buildTaskWhere, hasTaskFilters, parseTaskFilters } from "@/lib/task-filters";

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

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ q?: string | string[]; projectId?: string | string[]; status?: string | string[]; priority?: string | string[]; overdue?: string | string[] }> }) {
  const { user, workspace } = await getCurrentUserWithWorkspace();
  const demoReadOnly = isDemoWorkspace(workspace, user.email);
  const params = await searchParams;
  const filters = parseTaskFilters(params);
  const { q, status, priority, projectId, overdue } = filters;
  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const where = buildTaskWhere(workspace.id, filters, todayUtc);

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
        <p className="text-sm font-bold uppercase tracking-wide text-violet-800">
          Tasks
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
          Workspace Kanban
        </h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          See all tasks from every project in one board.
        </p>
      </div>

      <form method="get" className="task-filters mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input aria-label="Search tasks" name="q" defaultValue={q} placeholder="Search by task title" className="task-filter-search rounded-xl border border-slate-200 px-3 py-2" />
        <select aria-label="Filter task project" name="projectId" defaultValue={projectId ?? ""} className="rounded-xl border border-slate-200 px-3 py-2"><option value="">All projects</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>
        <select aria-label="Filter task status" name="status" defaultValue={status ?? ""} className="rounded-xl border border-slate-200 px-3 py-2"><option value="">All statuses</option><option value="TODO">Todo</option><option value="IN_PROGRESS">In progress</option><option value="REVIEW">Review</option><option value="DONE">Done</option></select>
        <select aria-label="Filter task priority" name="priority" defaultValue={priority ?? ""} className="rounded-xl border border-slate-200 px-3 py-2"><option value="">All priorities</option><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></select>
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold"><input type="checkbox" name="overdue" value="1" defaultChecked={overdue} /> Overdue only</label>
        <div className="task-filter-actions">
          <button className="flow-button">Apply</button>
          <Link href="/dashboard/tasks" className="flow-button flow-button-outline">Reset</Link>
        </div>
      </form>
      <div className="mb-6 flex justify-end"><a href={`/api/export/tasks?${new URLSearchParams({ ...(q ? { q } : {}), ...(projectId ? { projectId } : {}), ...(status ? { status } : {}), ...(priority ? { priority } : {}), ...(overdue ? { overdue: "1" } : {}) })}`} className="flow-button flow-button-outline">Export filtered CSV</a></div>

      {tasks.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-black text-slate-950">{hasTaskFilters(filters) ? "No tasks match these filters" : "No tasks yet"}</p>
          <p className="mt-2 text-sm text-slate-500">
            {hasTaskFilters(filters) ? "Try a different combination or reset all task filters." : "Open a project and create your first task."}
          </p>
          <Link
            href={hasTaskFilters(filters) ? "/dashboard/tasks" : "/dashboard/projects"}
            className="flow-button mt-6"
          >
            {hasTaskFilters(filters) ? "Reset filters" : "Go to Projects"}
          </Link>
        </div>
      ) : (
        <div className="task-board-container">
          <div className="task-board">
            {columns.map((column) => {
              const columnTasks = tasks.filter(
                (task) => task.status === column.value
              );

              return (
                <section key={column.value} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-bold text-slate-950">{column.label}</h2>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                      {columnTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {columnTasks.length === 0 ? <p className="p-2 text-sm text-slate-600">No tasks in this stage.</p> : null}
                    {columnTasks.map((task) => (
                      <article
                        key={task.id}
                        data-testid="workspace-task-card"
                        className="rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-violet-300 hover:bg-white"
                      >
                        <p className="wrap-anywhere font-semibold leading-snug text-slate-950">{task.title}</p>
                        <Link href={`/dashboard/projects/${task.projectId}`} className="mt-1 block wrap-anywhere text-sm font-medium text-violet-800 underline-offset-2 hover:underline">{task.project.name}</Link>
                        <span className={`mt-2 inline-flex rounded-md px-2 py-1 text-xs font-semibold ${getPriorityStyle(task.priority)}`}>
                          {task.priority}
                        </span>

                        {task.description ? (
                          <p className="mt-2 wrap-anywhere text-sm leading-5 text-slate-600">
                            {task.description}
                          </p>
                        ) : null}
                        {task.dueDate ? <p className={`mt-2 inline-flex rounded-md px-2 py-1 text-xs font-semibold ${task.status !== "DONE" && task.dueDate < todayUtc ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-800"}`}>{task.status !== "DONE" && task.dueDate < todayUtc ? "Overdue · " : "Due · "}{task.dueDate.toISOString().slice(0, 10)}</p> : null}
                        <TaskStatusForm projectId={task.projectId} taskId={task.id} currentStatus={task.status} disabled={demoReadOnly} />
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
