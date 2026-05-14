"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUserWithWorkspace } from "@/lib/current-user";

type ProjectStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";
type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export async function createProject(formData: FormData) {
  const { workspace } = await getCurrentUserWithWorkspace();

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!name) throw new Error("Project name is required");

  await prisma.project.create({
    data: {
      name,
      description,
      workspaceId: workspace.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  redirect("/dashboard/projects");
}

export async function updateProject(projectId: string, formData: FormData) {
  const { workspace } = await getCurrentUserWithWorkspace();

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const status = String(formData.get("status") || "ACTIVE") as ProjectStatus;

  if (!name) throw new Error("Project name is required");

  await prisma.project.updateMany({
    where: {
      id: projectId,
      workspaceId: workspace.id,
    },
    data: {
      name,
      description,
      status,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${projectId}`);

  redirect(`/dashboard/projects/${projectId}`);
}

export async function deleteProject(projectId: string) {
  const { workspace } = await getCurrentUserWithWorkspace();

  await prisma.task.deleteMany({
    where: {
      projectId,
      project: {
        workspaceId: workspace.id,
      },
    },
  });

  await prisma.project.deleteMany({
    where: {
      id: projectId,
      workspaceId: workspace.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  redirect("/dashboard/projects");
}

export async function createTask(projectId: string, formData: FormData) {
  const { workspace } = await getCurrentUserWithWorkspace();

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const status = String(formData.get("status") || "TODO") as TaskStatus;
  const priority = String(formData.get("priority") || "MEDIUM") as Priority;

  if (!title) throw new Error("Task title is required");

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspaceId: workspace.id,
    },
  });

  if (!project) throw new Error("Project not found");

  await prisma.task.create({
    data: {
      title,
      description,
      status,
      priority,
      projectId,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${projectId}`);

  redirect(`/dashboard/projects/${projectId}`);
}

export async function updateTaskStatus(
  projectId: string,
  taskId: string,
  status: TaskStatus
) {
  const { workspace } = await getCurrentUserWithWorkspace();

  await prisma.task.updateMany({
    where: {
      id: taskId,
      projectId,
      project: {
        workspaceId: workspace.id,
      },
    },
    data: {
      status,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function deleteTask(projectId: string, taskId: string) {
  const { workspace } = await getCurrentUserWithWorkspace();

  await prisma.task.deleteMany({
    where: {
      id: taskId,
      projectId,
      project: {
        workspaceId: workspace.id,
      },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${projectId}`);

  redirect(`/dashboard/projects/${projectId}`);
}