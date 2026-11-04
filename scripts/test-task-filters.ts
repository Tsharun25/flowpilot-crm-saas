import assert from "node:assert/strict";
import { buildTaskWhere, hasTaskFilters, parseTaskFilters } from "../src/lib/task-filters";

const todayUtc = new Date("2026-11-04T00:00:00.000Z");
const workspaceId = "507f1f77bcf86cd799439011";

const doneOverdue = parseTaskFilters({ status: "DONE", overdue: "1" });
assert.deepEqual(buildTaskWhere(workspaceId, doneOverdue, todayUtc).AND, [
  { status: "DONE" },
  { dueDate: { lt: todayUtc }, status: { not: "DONE" } },
]);
assert.equal(hasTaskFilters(doneOverdue), true);

for (const status of ["IN_PROGRESS", "REVIEW"] as const) {
  const where = buildTaskWhere(workspaceId, parseTaskFilters({ status, overdue: "1" }), todayUtc);
  assert.deepEqual(where.AND, [
    { status },
    { dueDate: { lt: todayUtc }, status: { not: "DONE" } },
  ]);
}

const allOverdue = buildTaskWhere(workspaceId, parseTaskFilters({ overdue: "1" }), todayUtc);
assert.deepEqual(allOverdue.AND, [{ dueDate: { lt: todayUtc }, status: { not: "DONE" } }]);

const combined = buildTaskWhere(workspaceId, parseTaskFilters({
  q: "  Launch  ",
  projectId: "507f1f77bcf86cd799439012",
  priority: "URGENT",
  status: "REVIEW",
  overdue: "1",
}), todayUtc);
assert.equal(combined.projectId, "507f1f77bcf86cd799439012");
assert.equal(combined.priority, "URGENT");
assert.deepEqual(combined.project, { workspaceId });
assert.deepEqual(combined.title, { contains: "Launch", mode: "insensitive" });

const invalid = parseTaskFilters({ status: "INVALID", priority: "NOPE", projectId: "bad", overdue: "true", q: [" first ", "ignored"] });
assert.equal(invalid.status, undefined);
assert.equal(invalid.priority, undefined);
assert.equal(invalid.projectId, undefined);
assert.equal(invalid.overdue, false);
assert.equal(invalid.q, "first");

console.log("Task filter composition tests passed.");
