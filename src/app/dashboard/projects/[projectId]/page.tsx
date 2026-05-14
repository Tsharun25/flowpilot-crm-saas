import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUserWithWorkspace } from "@/lib/current-user";
import {
  createTask,
  deleteProject,
  deleteTask,
  updateProject,
} from "../actions";
import TaskStatusForm from "./task-status-form";

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

export default async function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { workspace } = await getCurrentUserWithWorkspace();

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspaceId: workspace.id,
    },
    include: {
      tasks: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

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

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${getStatusStyle(
                project.status
              )}`}
            >
              {project.status}
            </span>

            <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950">
              {project.name}
            </h2>

            <p className="mt-4 max-w-3xl leading-7 text-slate-500">
              {project.description || "No description added."}
            </p>

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

              <div className="h-3 rounded-full bg-slate-200">
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
                <p className="text-sm font-bold uppercase tracking-wide text-cyan-600">
                  Kanban
                </p>
                <h3 className="mt-1 text-2xl font-black text-slate-950">
                  Task Board
                </h3>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {project.tasks.length} tasks
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
              <div className="grid gap-4 xl:grid-cols-4">
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
                          <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-center text-sm font-medium text-slate-400">
                            Empty
                          </div>
                        ) : (
                          columnTasks.map((task) => {
                            const deleteTaskWithIds = deleteTask.bind(
                              null,
                              project.id,
                              task.id
                            );

                            return (
                              <div
                                key={task.id}
                                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="font-black text-slate-950">
                                      {task.title}
                                    </p>
                                    {task.description ? (
                                      <p className="mt-2 text-sm leading-6 text-slate-500">
                                        {task.description}
                                      </p>
                                    ) : null}
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

                                <form action={deleteTaskWithIds}>
                                  <button className="mt-3 w-full rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100">
                                    Delete Task
                                  </button>
                                </form>
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
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Task Title
                </label>
                <input
                  name="title"
                  required
                  placeholder="Design homepage wireframe"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-cyan-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Short task details..."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-cyan-400 focus:bg-white"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Status
                  </label>
                  <select
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
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Priority
                  </label>
                  <select
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

              <button className="w-full rounded-2xl bg-cyan-400 px-5 py-3 font-black text-slate-950 transition hover:bg-cyan-300">
                Add Task
              </button>
            </div>
          </form>

          <form
            action={updateProjectWithId}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-xl font-black text-slate-950">Edit Project</h3>

            <div className="mt-6 space-y-5">
              <input
                name="name"
                required
                defaultValue={project.name}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-cyan-400 focus:bg-white"
              />

              <select
                name="status"
                defaultValue={project.status}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-cyan-400 focus:bg-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>

              <textarea
                name="description"
                rows={4}
                defaultValue={project.description || ""}
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-cyan-400 focus:bg-white"
              />

              <button className="w-full rounded-2xl bg-slate-950 px-5 py-3 font-black text-white transition hover:bg-slate-800">
                Save Changes
              </button>
            </div>
          </form>

          <form
            action={deleteProjectWithId}
            className="rounded-3xl border border-red-200 bg-red-50 p-6"
          >
            <h3 className="text-xl font-black text-red-950">Danger Zone</h3>
            <p className="mt-2 text-sm leading-6 text-red-700">
              Deleting this project will also remove all tasks attached to it.
            </p>

            <button className="mt-5 w-full rounded-2xl bg-red-600 px-5 py-3 font-black text-white transition hover:bg-red-700">
              Delete Project
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}