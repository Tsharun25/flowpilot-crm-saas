"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getCurrentUserWithWorkspace } from "@/lib/current-user";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function updateProfile(formData: FormData) {
  const { user } = await getCurrentUserWithWorkspace();

  const name = String(formData.get("name") || "").trim();

  if (!name) {
    throw new Error("Name is required");
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      name,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
}

export async function updateWorkspace(formData: FormData) {
  const { workspace } = await getCurrentUserWithWorkspace();

  const name = String(formData.get("name") || "").trim();

  if (!name) {
    throw new Error("Workspace name is required");
  }

  const baseSlug = slugify(name);

  await prisma.workspace.update({
    where: {
      id: workspace.id,
    },
    data: {
      name,
      slug: `${baseSlug}-${workspace.id.slice(-6)}`,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
}