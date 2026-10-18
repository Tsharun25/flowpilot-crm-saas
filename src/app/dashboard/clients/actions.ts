"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUserWithWorkspace } from "@/lib/current-user";
import {
  clientIdSchema,
  clientSchema,
  clientStatusSchema,
} from "@/lib/validators/workspace";

export async function createClient(formData: FormData) {
  const { workspace } = await getCurrentUserWithWorkspace();

  const { name, company, email, value, status } = clientSchema.parse({
    name: formData.get("name"),
    company: formData.get("company") ?? "",
    email: formData.get("email") ?? "",
    value: formData.get("value") ?? 0,
    status: formData.get("status"),
  });

  await prisma.client.create({
    data: {
      name,
      company,
      email,
      value,
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
  status: string
) {
  const { workspace } = await getCurrentUserWithWorkspace();
  const safeClientId = clientIdSchema.parse(clientId);
  const safeStatus = clientStatusSchema.parse(status);

  await prisma.client.updateMany({
    where: {
      id: safeClientId,
      workspaceId: workspace.id,
    },
    data: {
      status: safeStatus,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/clients");
}

export async function deleteClient(clientId: string) {
  const { workspace } = await getCurrentUserWithWorkspace();
  const safeClientId = clientIdSchema.parse(clientId);

  await prisma.client.deleteMany({
    where: {
      id: safeClientId,
      workspaceId: workspace.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/clients");

  redirect("/dashboard/clients");
}
