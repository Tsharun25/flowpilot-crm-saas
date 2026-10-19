import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import "server-only";

export async function getCurrentUserWithWorkspace() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  if (!dbUser) {
    redirect("/login");
  }

  const membership = await prisma.membership.findFirst({
    where: {
      userId: dbUser.id,
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      workspace: true,
    },
  });

  if (!membership) {
    redirect("/login");
  }

  return {
    user: dbUser,
    workspace: membership.workspace,
    membership,
  };
}

export async function requireWorkspaceManager() {
  const context = await getCurrentUserWithWorkspace();

  if (context.membership.role !== "OWNER" && context.membership.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  return context;
}
