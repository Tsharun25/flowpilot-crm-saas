import type { Prisma, Priority, TaskStatus } from "@prisma/client";

export type TaskFilterValue = string | string[] | null | undefined;

export type TaskFilters = {
  q: string;
  projectId?: string;
  status?: TaskStatus;
  priority?: Priority;
  overdue: boolean;
};

const TASK_STATUSES = new Set<TaskStatus>(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]);
const TASK_PRIORITIES = new Set<Priority>(["LOW", "MEDIUM", "HIGH", "URGENT"]);

function first(value: TaskFilterValue) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export function parseTaskFilters(input: {
  q?: TaskFilterValue;
  projectId?: TaskFilterValue;
  status?: TaskFilterValue;
  priority?: TaskFilterValue;
  overdue?: TaskFilterValue;
}): TaskFilters {
  const rawStatus = first(input.status);
  const rawPriority = first(input.priority);
  const rawProjectId = first(input.projectId);

  return {
    q: first(input.q).trim().slice(0, 100),
    status: TASK_STATUSES.has(rawStatus as TaskStatus) ? rawStatus as TaskStatus : undefined,
    priority: TASK_PRIORITIES.has(rawPriority as Priority) ? rawPriority as Priority : undefined,
    projectId: /^[a-f\d]{24}$/i.test(rawProjectId) ? rawProjectId : undefined,
    overdue: first(input.overdue) === "1",
  };
}

export function buildTaskWhere(
  workspaceId: string,
  filters: TaskFilters,
  todayUtc: Date,
): Prisma.TaskWhereInput {
  const statusPredicates: Prisma.TaskWhereInput[] = [];
  if (filters.status) statusPredicates.push({ status: filters.status });
  if (filters.overdue) {
    statusPredicates.push({ dueDate: { lt: todayUtc }, status: { not: "DONE" } });
  }

  return {
    project: { workspaceId },
    ...(filters.q ? { title: { contains: filters.q, mode: "insensitive" } } : {}),
    ...(filters.projectId ? { projectId: filters.projectId } : {}),
    ...(filters.priority ? { priority: filters.priority } : {}),
    ...(statusPredicates.length ? { AND: statusPredicates } : {}),
  };
}

export function hasTaskFilters(filters: TaskFilters) {
  return Boolean(filters.q || filters.projectId || filters.status || filters.priority || filters.overdue);
}
