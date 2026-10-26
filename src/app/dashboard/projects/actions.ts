"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUserWithWorkspace, requireWorkspaceManager } from "@/lib/current-user";
import { assertWorkspaceWritable } from "@/lib/demo-workspace";
import {
  projectIdSchema,
  projectSchema,
  parseDateOnly,
  taskIdSchema,
  taskSchema,
  taskStatusSchema,
} from "@/lib/validators/workspace";

export async function createProject(formData: FormData) {
  const { user, workspace } = await getCurrentUserWithWorkspace();
  assertWorkspaceWritable(workspace, user.email);

  const { name, description, clientId } = projectSchema.parse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    clientId: formData.get("clientId") ?? "",
  });

  if (clientId) {
    const client = await prisma.client.findFirst({
      where: { id: clientId, workspaceId: workspace.id },
      select: { id: true },
    });
    if (!client) throw new Error("Client not found");
  }

  await prisma.project.create({
    data: {
      name,
      description,
      clientId: clientId || null,
      workspaceId: workspace.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  redirect("/dashboard/projects");
}

export async function updateProject(projectId: string, formData: FormData) {
  const { user, workspace } = await getCurrentUserWithWorkspace();
  assertWorkspaceWritable(workspace, user.email);
  const safeProjectId = projectIdSchema.parse(projectId);
  const { name, description, status, clientId } = projectSchema.parse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    status: formData.get("status"),
    clientId: formData.get("clientId") ?? "",
  });

  if (clientId) {
    const client = await prisma.client.findFirst({
      where: { id: clientId, workspaceId: workspace.id },
      select: { id: true },
    });
    if (!client) throw new Error("Client not found");
  }

  const result = await prisma.project.updateMany({
    where: {
      id: safeProjectId,
      workspaceId: workspace.id,
    },
    data: {
      name,
      description,
      status,
      clientId: clientId || null,
    },
  });

  if (result.count === 0) throw new Error("Project not found");

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${projectId}`);

  redirect(`/dashboard/projects/${projectId}`);
}

export async function deleteProject(projectId: string) {
  const { user, workspace } = await requireWorkspaceManager();
  assertWorkspaceWritable(workspace, user.email);
  const safeProjectId = projectIdSchema.parse(projectId);

  const project = await prisma.project.findFirst({
    where: { id: safeProjectId, workspaceId: workspace.id },
    select: { id: true },
  });
  if (!project) throw new Error("Project not found");

  await prisma.$transaction([
    prisma.dealConversion.deleteMany({
      where: { projectId: safeProjectId },
    }),
    prisma.task.deleteMany({
      where: {
        projectId: safeProjectId,
        project: { workspaceId: workspace.id },
      },
    }),
    prisma.project.delete({ where: { id: project.id } }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  redirect("/dashboard/projects");
}

export async function createTask(projectId: string, formData: FormData) {
  const { user, workspace } = await getCurrentUserWithWorkspace();
  assertWorkspaceWritable(workspace, user.email);
  const safeProjectId = projectIdSchema.parse(projectId);
  const { title, description, status, priority, dueDate } = taskSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    status: formData.get("status"),
    priority: formData.get("priority"),
    dueDate: formData.get("dueDate") ?? "",
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
      dueDate: parseDateOnly(dueDate),
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
  const { user, workspace } = await getCurrentUserWithWorkspace();
  assertWorkspaceWritable(workspace, user.email);
  const safeProjectId = projectIdSchema.parse(projectId);
  const safeTaskId = taskIdSchema.parse(taskId);
  const safeStatus = taskStatusSchema.parse(status);

  const result = await prisma.task.updateMany({
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

  if (result.count === 0) throw new Error("Task not found");

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function deleteTask(projectId: string, taskId: string) {
  const { user, workspace } = await requireWorkspaceManager();
  assertWorkspaceWritable(workspace, user.email);
  const safeProjectId = projectIdSchema.parse(projectId);
  const safeTaskId = taskIdSchema.parse(taskId);

  const result = await prisma.task.deleteMany({
    where: {
      id: safeTaskId,
      projectId: safeProjectId,
      project: {
        workspaceId: workspace.id,
      },
    },
  });

  if (result.count === 0) throw new Error("Task not found");

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${projectId}`);

  redirect(`/dashboard/projects/${projectId}`);
}

export async function updateTask(projectId: string, taskId: string, formData: FormData) {
  const { user, workspace } = await getCurrentUserWithWorkspace();
  assertWorkspaceWritable(workspace, user.email);
  const safeProjectId = projectIdSchema.parse(projectId);
  const safeTaskId = taskIdSchema.parse(taskId);
  const data = taskSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    status: formData.get("status"),
    priority: formData.get("priority"),
    dueDate: formData.get("dueDate") ?? "",
  });
  const result = await prisma.task.updateMany({
    where: { id: safeTaskId, projectId: safeProjectId, project: { workspaceId: workspace.id } },
    data: { ...data, dueDate: parseDateOnly(data.dueDate) },
  });
  if (result.count === 0) throw new Error("Task not found");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tasks");
  revalidatePath(`/dashboard/projects/${safeProjectId}`);
}
