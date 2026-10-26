"use client";

import { useTransition } from "react";
import { updateTaskStatus } from "../actions";
import { toast } from "sonner";

type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

export default function TaskStatusForm({
  projectId,
  taskId,
  currentStatus,
  disabled = false,
}: {
  projectId: string;
  taskId: string;
  currentStatus: TaskStatus;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(status: TaskStatus) {
    startTransition(async () => {
      try {
        await updateTaskStatus(projectId, taskId, status);
        toast.success("Task status updated");
      } catch {
        toast.error("Could not update task status");
      }
    });
  }

  return (
    <select
      aria-label="Task status"
      value={currentStatus}
      disabled={isPending || disabled}
      onChange={(event) => handleChange(event.target.value as TaskStatus)}
      className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-cyan-400 disabled:opacity-60"
    >
      <option value="TODO">Todo</option>
      <option value="IN_PROGRESS">In Progress</option>
      <option value="REVIEW">Review</option>
      <option value="DONE">Done</option>
    </select>
  );
}
