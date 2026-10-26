"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getCurrentUserWithWorkspace, requireWorkspaceManager } from "@/lib/current-user";
import { assertWorkspaceWritable } from "@/lib/demo-workspace";
import { nameSchema, workspaceNameSchema } from "@/lib/validators/workspace";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function updateProfile(formData: FormData) {
  const { user, workspace } = await getCurrentUserWithWorkspace();
  assertWorkspaceWritable(workspace, user.email);

  const name = nameSchema.parse(formData.get("name"));

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
  const { user, workspace } = await requireWorkspaceManager();

  assertWorkspaceWritable(workspace, user.email);

  const name = workspaceNameSchema.parse(formData.get("name"));

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
