import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getCurrentUserWithWorkspace } from "@/lib/current-user";

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

export default async function TasksPage() {
  const { workspace } = await getCurrentUserWithWorkspace();

  const tasks = await prisma.task.findMany({
    where: {
      project: {
        workspaceId: workspace.id,
      },
    },
    include: {
      project: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-wide text-cyan-600">
          Tasks
        </p>
        <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
          Workspace Kanban
        </h2>
        <p className="mt-2 max-w-2xl text-slate-500">
          See all tasks from every project in one board.
        </p>
      </div>

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
                    <Link
                      key={task.id}
                      href={`/dashboard/projects/${task.projectId}`}
                      className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-300 hover:bg-white"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-slate-950">
                            {task.title}
                          </p>
                          <p className="mt-1 text-xs font-bold text-slate-500">
                            {task.project.name}
                          </p>
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
                        <p className="mt-3 text-sm leading-6 text-slate-500">
                          {task.description}
                        </p>
                      ) : null}
                    </Link>
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