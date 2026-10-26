import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUserWithWorkspace } from "@/lib/current-user";
import { projectIdSchema } from "@/lib/validators/workspace";
import {
  createTask,
  deleteProject,
  deleteTask,
  updateTask,
  updateProject,
} from "../actions";
import TaskStatusForm from "./task-status-form";
import ConfirmSubmitButton from "@/components/confirm-submit-button";
import SubmitButton from "@/components/submit-button";

export const metadata: Metadata = {
  title: "Project details",
  description: "Review a project, manage its tasks, and update project progress.",
};

const columns = [
  { label: "Todo", value: "TODO" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Review", value: "REVIEW" },
  { label: "Done", value: "DONE" },
] as const;

function getStatusStyle(status: string) {
  if (status === "COMPLETED") return "bg-emerald-100 text-emerald-700";
  if (status === "ARCHIVED") return "bg-slate-200 text-slate-600";
  return "bg-cyan-100 text-cyan-700";
}

function getPriorityStyle(priority: string) {
  if (priority === "URGENT") return "bg-red-100 text-red-700";
  if (priority === "HIGH") return "bg-orange-100 text-orange-700";
  if (priority === "LOW") return "bg-slate-100 text-slate-600";
  return "bg-blue-100 text-blue-700";
}

function getDueState(dueDate: Date | null, status: string) {
  if (!dueDate) return null;
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  if (status === "DONE") return { label: `Completed · due ${dueDate.toISOString().slice(0, 10)}`, className: "bg-emerald-50 text-emerald-800" };
  if (dueDate.getTime() < todayUtc) return { label: `Overdue · ${dueDate.toISOString().slice(0, 10)}`, className: "bg-red-50 text-red-700" };
  if (dueDate.getTime() === todayUtc) return { label: "Due today (UTC)", className: "bg-amber-50 text-amber-800" };
  return { label: `Due ${dueDate.toISOString().slice(0, 10)}`, className: "bg-blue-50 text-blue-800" };
}

export default async function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const parsedProjectId = projectIdSchema.safeParse((await params).projectId);
  if (!parsedProjectId.success) notFound();

  const projectId = parsedProjectId.data;
  const { workspace, membership } = await getCurrentUserWithWorkspace();
  const canDelete = membership.role === "OWNER" || membership.role === "ADMIN";

  const [project, clients] = await Promise.all([prisma.project.findFirst({
    where: {
      id: projectId,
      workspaceId: workspace.id,
    },
    include: {
      client: { select: { id: true, name: true } },
      tasks: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  }), prisma.client.findMany({ where: { workspaceId: workspace.id }, orderBy: { name: "asc" }, select: { id: true, name: true } })]);

  if (!project) notFound();

  const doneTasks = project.tasks.filter((task) => task.status === "DONE").length;
  const progress =
    project.tasks.length === 0
      ? 0
      : Math.round((doneTasks / project.tasks.length) * 100);

  const updateProjectWithId = updateProject.bind(null, project.id);
  const deleteProjectWithId = deleteProject.bind(null, project.id);
  const createTaskWithProjectId = createTask.bind(null, project.id);

  return (
    <div>
      <Link
        href="/dashboard/projects"
        className="mb-6 inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:text-slate-950"
      >
        ← Back to Projects
      </Link>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${getStatusStyle(
                project.status
              )}`}
            >
              {project.status}
            </span>

            <h2 className="mt-4 break-words text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              {project.name}
            </h2>

            <p className="mt-4 max-w-3xl break-words leading-7 text-slate-500">
              {project.description || "No description added."}
            </p>
            {project.client ? <Link href={`/dashboard/clients/${project.client.id}`} className="mt-4 inline-flex rounded-full bg-cyan-50 px-3 py-2 text-sm font-black text-cyan-900">Client: {project.client.name}</Link> : <p className="mt-4 text-sm font-bold text-slate-500">Internal project · no linked client</p>}

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm font-bold text-slate-500">Total Tasks</p>
                <p className="mt-2 text-3xl font-black text-slate-950">
                  {project.tasks.length}
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm font-bold text-slate-500">Completed</p>
                <p className="mt-2 text-3xl font-black text-slate-950">
                  {doneTasks}
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm font-bold text-slate-500">Progress</p>
                <p className="mt-2 text-3xl font-black text-slate-950">
                  {progress}%
                </p>
              </div>
            </div>

            <div className="mt-8">
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-bold text-slate-500">
                  Project Progress
                </span>
                <span className="font-black text-slate-950">{progress}%</span>
              </div>

              <div
                className="h-3 rounded-full bg-slate-200"
                role="progressbar"
                aria-label="Project progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <div
                  className="h-3 rounded-full bg-cyan-400"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-cyan-700">
                  Kanban
                </p>
                <h3 className="mt-1 text-2xl font-black text-slate-950">
                  Task Board
                </h3>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {project.tasks.length} {project.tasks.length === 1 ? "task" : "tasks"}
              </span>
            </div>

            {project.tasks.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                <p className="text-lg font-black text-slate-950">
                  No tasks yet
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Create a task from the right panel to start tracking work.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                {columns.map((column) => {
                  const columnTasks = project.tasks.filter(
                    (task) => task.status === column.value
                  );

                  return (
                    <div
                      key={column.value}
                      className="rounded-3xl bg-slate-50 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="font-black text-slate-950">
                          {column.label}
                        </h4>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600">
                          {columnTasks.length}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {columnTasks.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-center text-sm font-medium text-slate-600">
                            Empty
                          </div>
                        ) : (
                          columnTasks.map((task) => {
                            const deleteTaskWithIds = deleteTask.bind(
                              null,
                              project.id,
                              task.id
                            );
                            const updateTaskWithIds = updateTask.bind(null, project.id, task.id);

                            return (
                              <div
                                key={task.id}
                                data-testid="task-card"
                                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="break-words font-black text-slate-950">
                                      {task.title}
                                    </p>
                                    {task.description ? (
                                      <p className="mt-2 break-words text-sm leading-6 text-slate-500">
                                        {task.description}
                                      </p>
                                    ) : null}
                                    {getDueState(task.dueDate, task.status) ? <p className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-black ${getDueState(task.dueDate, task.status)!.className}`}>{getDueState(task.dueDate, task.status)!.label}</p> : null}
                                  </div>

                                  <span
                                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${getPriorityStyle(
                                      task.priority
                                    )}`}
                                  >
                                    {task.priority}
                                  </span>
                                </div>

                                <TaskStatusForm
                                  projectId={project.id}
                                  taskId={task.id}
                                  currentStatus={task.status}
                                />

                                <details className="mt-3 rounded-xl border border-slate-200 p-3">
                                  <summary className="cursor-pointer text-center text-xs font-black text-slate-700">Edit Task</summary>
                                  <form
                                    key={task.updatedAt.toISOString()}
                                    action={updateTaskWithIds}
                                    className="mt-3 space-y-3"
                                  >
                                    <input aria-label="Task title" name="title" required defaultValue={task.title} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                                    <textarea aria-label="Task description" name="description" rows={3} defaultValue={task.description ?? ""} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                                    <select aria-label="Priority" name="priority" defaultValue={task.priority} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></select>
                                    <input aria-label="Task due date" name="dueDate" type="date" defaultValue={task.dueDate?.toISOString().slice(0, 10) ?? ""} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                                    <input type="hidden" name="status" value={task.status} />
                                    <SubmitButton
                                      pendingText="Saving..."
                                      className="w-full rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white"
                                    >
                                      Save Changes
                                    </SubmitButton>
                                  </form>
                                </details>

                                {canDelete ? (
                                  <form action={deleteTaskWithIds}>
                                    <ConfirmSubmitButton message={`Delete ${task.title}? This cannot be undone.`} className="mt-3 w-full rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100">
                                      Delete Task
                                    </ConfirmSubmitButton>
                                  </form>
                                ) : null}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <form
            action={createTaskWithProjectId}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-xl font-black text-slate-950">Create Task</h3>

            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="new-task-title"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Task Title
                </label>
                <input
                  id="new-task-title"
                  name="title"
                  required
                  placeholder="Design homepage wireframe"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-cyan-400 focus:bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="new-task-description"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Description
                </label>
                <textarea
                  id="new-task-description"
                  name="description"
                  rows={4}
                  placeholder="Short task details..."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-cyan-400 focus:bg-white"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                <div>
                  <label
                    htmlFor="new-task-status"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Status
                  </label>
                  <select
                    id="new-task-status"
                    name="status"
                    defaultValue="TODO"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-cyan-400 focus:bg-white"
                  >
                    <option value="TODO">Todo</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="new-task-priority"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Priority
                  </label>
                  <select
                    id="new-task-priority"
                    name="priority"
                    defaultValue="MEDIUM"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-cyan-400 focus:bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div><label htmlFor="new-task-due-date" className="mb-2 block text-sm font-bold text-slate-700">Due Date (optional, UTC date)</label><input id="new-task-due-date" name="dueDate" type="date" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" /></div>

              <SubmitButton
                pendingText="Adding Task..."
                className="w-full rounded-2xl bg-cyan-400 px-5 py-3 font-black text-slate-950 transition hover:bg-cyan-300"
              >
                Add Task
              </SubmitButton>
            </div>
          </form>

          <form
            key={project.updatedAt.toISOString()}
            action={updateProjectWithId}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-xl font-black text-slate-950">Edit Project</h3>

            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="edit-project-name"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Project Name
                </label>
                <input
                  id="edit-project-name"
                  name="name"
                  required
                  defaultValue={project.name}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-cyan-400 focus:bg-white"
                />
              </div>

              <div><label htmlFor="edit-project-client" className="mb-2 block text-sm font-bold text-slate-700">Client (optional)</label><select id="edit-project-client" name="clientId" defaultValue={project.clientId ?? ""} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><option value="">Internal / no client</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></div>

              <div>
                <label
                  htmlFor="edit-project-status"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Project Status
                </label>
                <select
                  id="edit-project-status"
                  name="status"
                  defaultValue={project.status}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-cyan-400 focus:bg-white"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-project-description"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Description
                </label>
                <textarea
                  id="edit-project-description"
                  name="description"
                  rows={4}
                  defaultValue={project.description || ""}
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-cyan-400 focus:bg-white"
                />
              </div>

              <SubmitButton
                pendingText="Saving..."
                className="w-full rounded-2xl bg-slate-950 px-5 py-3 font-black text-white transition hover:bg-slate-800"
              >
                Save Changes
              </SubmitButton>
            </div>
          </form>

          {canDelete ? (
            <form
              action={deleteProjectWithId}
              className="rounded-3xl border border-red-200 bg-red-50 p-6"
            >
              <h3 className="text-xl font-black text-red-950">Danger Zone</h3>
              <p className="mt-2 text-sm leading-6 text-red-700">
                Deleting this project will also remove all tasks attached to it.
              </p>

              <ConfirmSubmitButton message={`Delete ${project.name} and all of its tasks? This cannot be undone.`} className="mt-5 w-full rounded-2xl bg-red-600 px-5 py-3 font-black text-white transition hover:bg-red-700">
                Delete Project
              </ConfirmSubmitButton>
            </form>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
