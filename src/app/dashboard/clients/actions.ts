"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUserWithWorkspace } from "@/lib/current-user";
import { clientIdSchema, clientSchema, clientStatusSchema } from "@/lib/validators/workspace";

function refreshClientViews() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard/analytics");
}

export async function createClient(formData: FormData) {
  const { workspace } = await getCurrentUserWithWorkspace();
  const data = clientSchema.parse({ name: formData.get("name"), company: formData.get("company") ?? "", email: formData.get("email") ?? "", value: formData.get("value") ?? 0, status: formData.get("status") });
  await prisma.client.create({ data: { ...data, wonAt: data.status === "WON" ? new Date() : null, workspaceId: workspace.id } });
  refreshClientViews();
  redirect("/dashboard/clients");
}

export async function updateClientStatus(clientId: string, status: string) {
  const { workspace } = await getCurrentUserWithWorkspace();
  const safeClientId = clientIdSchema.parse(clientId);
  const safeStatus = clientStatusSchema.parse(status);
  const existing = await prisma.client.findFirst({ where: { id: safeClientId, workspaceId: workspace.id }, select: { wonAt: true } });
  if (!existing) throw new Error("Client not found");
  await prisma.client.updateMany({ where: { id: safeClientId, workspaceId: workspace.id }, data: { status: safeStatus, wonAt: safeStatus === "WON" ? existing.wonAt ?? new Date() : null } });
  refreshClientViews();
}

export async function updateClient(clientId: string, formData: FormData) {
  const { workspace } = await getCurrentUserWithWorkspace();
  const safeClientId = clientIdSchema.parse(clientId);
  const data = clientSchema.parse({ name: formData.get("name"), company: formData.get("company") ?? "", email: formData.get("email") ?? "", value: formData.get("value") ?? 0, status: formData.get("status") });
  const existing = await prisma.client.findFirst({ where: { id: safeClientId, workspaceId: workspace.id }, select: { wonAt: true } });
  if (!existing) throw new Error("Client not found");
  await prisma.client.updateMany({ where: { id: safeClientId, workspaceId: workspace.id }, data: { ...data, wonAt: data.status === "WON" ? existing.wonAt ?? new Date() : null } });
  refreshClientViews();
}

export async function deleteClient(clientId: string) {
  const { workspace } = await getCurrentUserWithWorkspace();
  const safeClientId = clientIdSchema.parse(clientId);
  await prisma.client.deleteMany({ where: { id: safeClientId, workspaceId: workspace.id } });
  refreshClientViews();
  redirect("/dashboard/clients");
}
