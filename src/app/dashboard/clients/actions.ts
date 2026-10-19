"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUserWithWorkspace, requireWorkspaceManager } from "@/lib/current-user";
import { clientIdSchema, clientSchema, clientStatusSchema } from "@/lib/validators/workspace";

function refreshClientViews() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard/analytics");
}

export async function createClient(formData: FormData) {
  const { workspace } = await getCurrentUserWithWorkspace();
  const { value: valueCents, ...data } = clientSchema.parse({ name: formData.get("name"), company: formData.get("company") ?? "", email: formData.get("email") ?? "", value: formData.get("value"), status: formData.get("status") });
  await prisma.client.create({ data: { ...data, value: Number(valueCents / BigInt(100)), valueCents, wonAt: data.status === "WON" ? new Date() : null, workspaceId: workspace.id } });
  refreshClientViews();
  redirect("/dashboard/clients");
}

export async function updateClientStatus(clientId: string, status: string) {
  const { workspace } = await getCurrentUserWithWorkspace();
  const safeClientId = clientIdSchema.parse(clientId);
  const safeStatus = clientStatusSchema.parse(status);
  const existing = await prisma.client.findFirst({ where: { id: safeClientId, workspaceId: workspace.id }, select: { wonAt: true } });
  if (!existing) throw new Error("Client not found");
  const result = await prisma.client.updateMany({ where: { id: safeClientId, workspaceId: workspace.id }, data: { status: safeStatus, wonAt: safeStatus === "WON" ? existing.wonAt ?? new Date() : null } });
  if (result.count === 0) throw new Error("Client not found");
  refreshClientViews();
}

export async function updateClient(clientId: string, formData: FormData) {
  const { workspace } = await getCurrentUserWithWorkspace();
  const safeClientId = clientIdSchema.parse(clientId);
  const { value: valueCents, ...data } = clientSchema.parse({ name: formData.get("name"), company: formData.get("company") ?? "", email: formData.get("email") ?? "", value: formData.get("value"), status: formData.get("status") });
  const existing = await prisma.client.findFirst({ where: { id: safeClientId, workspaceId: workspace.id }, select: { wonAt: true } });
  if (!existing) throw new Error("Client not found");
  const result = await prisma.client.updateMany({ where: { id: safeClientId, workspaceId: workspace.id }, data: { ...data, value: Number(valueCents / BigInt(100)), valueCents, wonAt: data.status === "WON" ? existing.wonAt ?? new Date() : null } });
  if (result.count === 0) throw new Error("Client not found");
  refreshClientViews();
}

export async function deleteClient(clientId: string) {
  const { workspace } = await requireWorkspaceManager();
  const safeClientId = clientIdSchema.parse(clientId);
  const result = await prisma.client.deleteMany({ where: { id: safeClientId, workspaceId: workspace.id } });
  if (result.count === 0) throw new Error("Client not found");
  refreshClientViews();
  redirect("/dashboard/clients");
}
