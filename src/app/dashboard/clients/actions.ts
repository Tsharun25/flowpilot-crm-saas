"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUserWithWorkspace, requireWorkspaceManager } from "@/lib/current-user";
import { clientIdSchema, clientNoteSchema, clientSchema, clientStatusSchema, parseDateOnly, requestIdSchema } from "@/lib/validators/workspace";

function refreshClientViews(clientId?: string) {
  for (const path of ["/dashboard", "/dashboard/clients", "/dashboard/projects", "/dashboard/tasks", "/dashboard/analytics"]) revalidatePath(path);
  if (clientId) revalidatePath(`/dashboard/clients/${clientId}`);
}

function parseClientForm(formData: FormData) {
  return clientSchema.parse({
    name: formData.get("name"), company: formData.get("company") ?? "",
    email: formData.get("email") ?? "", value: formData.get("value"),
    status: formData.get("status"), nextFollowUp: formData.get("nextFollowUp") ?? "",
  });
}

export async function createClient(formData: FormData) {
  const { workspace } = await getCurrentUserWithWorkspace();
  const { value: valueCents, nextFollowUp, ...data } = parseClientForm(formData);
  await prisma.client.create({ data: { ...data, value: Number(valueCents / BigInt(100)), valueCents, wonAt: data.status === "WON" ? new Date() : null, nextFollowUp: parseDateOnly(nextFollowUp), workspaceId: workspace.id } });
  refreshClientViews();
  redirect("/dashboard/clients");
}

export async function updateClientStatus(clientId: string, status: string, eventKey: string) {
  const { user, workspace } = await getCurrentUserWithWorkspace();
  const safeClientId = clientIdSchema.parse(clientId);
  const safeStatus = clientStatusSchema.parse(status);
  const safeEventKey = requestIdSchema.parse(eventKey);
  await prisma.$transaction(async (tx) => {
    const existing = await tx.client.findFirst({ where: { id: safeClientId, workspaceId: workspace.id }, select: { status: true, wonAt: true } });
    if (!existing) throw new Error("Client not found");
    if (existing.status === safeStatus) return;
    const result = await tx.client.updateMany({ where: { id: safeClientId, workspaceId: workspace.id, status: existing.status }, data: { status: safeStatus, wonAt: safeStatus === "WON" ? existing.wonAt ?? new Date() : null } });
    if (result.count === 0) return;
    await tx.clientActivity.create({ data: { clientId: safeClientId, actorId: user.id, kind: "STATUS_CHANGE", summary: `Status changed from ${existing.status} to ${safeStatus}`, eventKey: safeEventKey } });
  });
  refreshClientViews(safeClientId);
}

export async function updateClient(clientId: string, formData: FormData) {
  const { user, workspace } = await getCurrentUserWithWorkspace();
  const safeClientId = clientIdSchema.parse(clientId);
  const eventKey = requestIdSchema.parse(formData.get("eventKey"));
  const { value: valueCents, nextFollowUp, ...data } = parseClientForm(formData);
  await prisma.$transaction(async (tx) => {
    const existing = await tx.client.findFirst({ where: { id: safeClientId, workspaceId: workspace.id }, select: { status: true, wonAt: true } });
    if (!existing) throw new Error("Client not found");
    const result = await tx.client.updateMany({ where: { id: safeClientId, workspaceId: workspace.id }, data: { ...data, value: Number(valueCents / BigInt(100)), valueCents, nextFollowUp: parseDateOnly(nextFollowUp), wonAt: data.status === "WON" ? existing.wonAt ?? new Date() : null } });
    if (result.count === 0) throw new Error("Client not found");
    if (existing.status !== data.status) await tx.clientActivity.create({ data: { clientId: safeClientId, actorId: user.id, kind: "STATUS_CHANGE", summary: `Status changed from ${existing.status} to ${data.status}`, eventKey } });
  });
  refreshClientViews(safeClientId);
}

export async function addClientNote(clientId: string, formData: FormData) {
  const { user, workspace } = await getCurrentUserWithWorkspace();
  const safeClientId = clientIdSchema.parse(clientId);
  const body = clientNoteSchema.parse(formData.get("body"));
  const requestId = requestIdSchema.parse(formData.get("requestId"));
  const client = await prisma.client.findFirst({ where: { id: safeClientId, workspaceId: workspace.id }, select: { id: true } });
  if (!client) throw new Error("Client not found");
  try {
    await prisma.clientNote.create({ data: { body, requestId, clientId: safeClientId, authorId: user.id } });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) throw error;
  }
  refreshClientViews(safeClientId);
  redirect(`/dashboard/clients/${safeClientId}`);
}

export async function convertWonClientToProject(clientId: string) {
  const { user, workspace } = await getCurrentUserWithWorkspace();
  const safeClientId = clientIdSchema.parse(clientId);
  const existing = await prisma.dealConversion.findFirst({ where: { clientId: safeClientId, client: { workspaceId: workspace.id } }, select: { projectId: true } });
  if (existing) redirect(`/dashboard/projects/${existing.projectId}`);
  let projectId: string | undefined;
  try {
    projectId = await prisma.$transaction(async (tx) => {
      const client = await tx.client.findFirst({ where: { id: safeClientId, workspaceId: workspace.id, status: "WON" }, select: { id: true, name: true, company: true } });
      if (!client) throw new Error("Only a Won client can be converted");
      const project = await tx.project.create({ data: { name: `${client.company || client.name} Project`, description: `Created from won deal for ${client.name}.`, workspaceId: workspace.id, clientId: client.id } });
      await tx.dealConversion.create({ data: { clientId: client.id, projectId: project.id } });
      await tx.clientActivity.create({ data: { clientId: client.id, actorId: user.id, kind: "CONVERSION", summary: `Won deal converted to project: ${project.name}`, eventKey: `conversion:${client.id}` } });
      return project.id;
    });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) throw error;
    const conversion = await prisma.dealConversion.findFirst({ where: { clientId: safeClientId, client: { workspaceId: workspace.id } }, select: { projectId: true } });
    if (!conversion) throw error;
    projectId = conversion.projectId;
  }
  refreshClientViews(safeClientId);
  redirect(`/dashboard/projects/${projectId}`);
}

export async function deleteClient(clientId: string) {
  const { workspace } = await requireWorkspaceManager();
  const safeClientId = clientIdSchema.parse(clientId);
  const client = await prisma.client.findFirst({ where: { id: safeClientId, workspaceId: workspace.id }, select: { id: true } });
  if (!client) throw new Error("Client not found");
  await prisma.$transaction([
    prisma.project.updateMany({ where: { clientId: safeClientId, workspaceId: workspace.id }, data: { clientId: null } }),
    prisma.dealConversion.deleteMany({ where: { clientId: safeClientId } }),
    prisma.clientNote.deleteMany({ where: { clientId: safeClientId } }),
    prisma.clientActivity.deleteMany({ where: { clientId: safeClientId } }),
    prisma.client.delete({ where: { id: safeClientId } }),
  ]);
  refreshClientViews();
  redirect("/dashboard/clients");
}
