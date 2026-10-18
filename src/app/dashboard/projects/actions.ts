"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUserWithWorkspace } from "@/lib/current-user";
import {
  projectIdSchema,
  projectSchema,
  taskIdSchema,
  taskSchema,
  taskStatusSchema,
} from "@/lib/validators/workspace";

export async function createProject(formData: FormData) {
  const { workspace } = await getCurrentUserWithWorkspace();

  const { name, description } = projectSchema.parse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
  });

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
  const safeProjectId = projectIdSchema.parse(projectId);
  const { name, description, status } = projectSchema.parse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    status: formData.get("status"),
  });

  await prisma.project.updateMany({
    where: {
      id: safeProjectId,
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
  const safeProjectId = projectIdSchema.parse(projectId);

  await prisma.task.deleteMany({
    where: {
      projectId: safeProjectId,
      project: {
        workspaceId: workspace.id,
      },
    },
  });

  await prisma.project.deleteMany({
    where: {
      id: safeProjectId,
      workspaceId: workspace.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  redirect("/dashboard/projects");
}

export async function createTask(projectId: string, formData: FormData) {
  const { workspace } = await getCurrentUserWithWorkspace();
  const safeProjectId = projectIdSchema.parse(projectId);
  const { title, description, status, priority } = taskSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    status: formData.get("status"),
    priority: formData.get("priority"),
  });

  const project = await prisma.project.findFirst({
    where: {
      id: safeProjectId,
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
      projectId: safeProjectId,
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
  status: string
) {
  const { workspace } = await getCurrentUserWithWorkspace();
  const safeProjectId = projectIdSchema.parse(projectId);
  const safeTaskId = taskIdSchema.parse(taskId);
  const safeStatus = taskStatusSchema.parse(status);

  await prisma.task.updateMany({
    where: {
      id: safeTaskId,
      projectId: safeProjectId,
      project: {
        workspaceId: workspace.id,
      },
    },
    data: {
      status: safeStatus,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function deleteTask(projectId: string, taskId: string) {
  const { workspace } = await getCurrentUserWithWorkspace();
  const safeProjectId = projectIdSchema.parse(projectId);
  const safeTaskId = taskIdSchema.parse(taskId);

  await prisma.task.deleteMany({
    where: {
      id: safeTaskId,
      projectId: safeProjectId,
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

export async function updateTask(projectId: string, taskId: string, formData: FormData) {
  const { workspace } = await getCurrentUserWithWorkspace();
  const safeProjectId = projectIdSchema.parse(projectId);
  const safeTaskId = taskIdSchema.parse(taskId);
  const data = taskSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    status: formData.get("status"),
    priority: formData.get("priority"),
  });
  const result = await prisma.task.updateMany({
    where: { id: safeTaskId, projectId: safeProjectId, project: { workspaceId: workspace.id } },
    data,
  });
  if (result.count === 0) throw new Error("Task not found");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tasks");
  revalidatePath(`/dashboard/projects/${safeProjectId}`);
}
