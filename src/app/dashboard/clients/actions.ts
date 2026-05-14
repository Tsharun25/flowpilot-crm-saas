"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUserWithWorkspace } from "@/lib/current-user";

type ClientStatus = "LEAD" | "CONTACTED" | "WON" | "LOST";

export async function createClient(formData: FormData) {
  const { workspace } = await getCurrentUserWithWorkspace();

  const name = String(formData.get("name") || "").trim();
  const company = String(formData.get("company") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const value = Number(formData.get("value") || 0);
  const status = String(formData.get("status") || "LEAD") as ClientStatus;

  if (!name) {
    throw new Error("Client name is required");
  }

  await prisma.client.create({
    data: {
      name,
      company,
      email,
      value: Number.isNaN(value) ? 0 : value,
      status,
      workspaceId: workspace.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/clients");

  redirect("/dashboard/clients");
}

export async function updateClientStatus(
  clientId: string,
  status: ClientStatus
) {
  const { workspace } = await getCurrentUserWithWorkspace();

  await prisma.client.updateMany({
    where: {
      id: clientId,
      workspaceId: workspace.id,
    },
    data: {
      status,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/clients");
}

export async function deleteClient(clientId: string) {
  const { workspace } = await getCurrentUserWithWorkspace();

  await prisma.client.deleteMany({
    where: {
      id: clientId,
      workspaceId: workspace.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/clients");

  redirect("/dashboard/clients");
}