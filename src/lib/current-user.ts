import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUserWithWorkspace() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!dbUser) {
    redirect("/login");
  }

  const membership = await prisma.membership.findFirst({
    where: {
      userId: dbUser.id,
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