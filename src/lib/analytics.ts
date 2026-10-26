import "server-only";

import { prisma } from "@/lib/prisma";
import { calculateCrmMetrics } from "@/lib/crm-metrics";

export { formatMoney } from "@/lib/crm-metrics";

export async function getWorkspaceCrmMetrics(workspaceId: string, year?: number) {
  const clients = await prisma.client.findMany({
    where: { workspaceId },
    select: { value: true, valueCents: true, status: true, wonAt: true },
  });
  return calculateCrmMetrics(clients, new Date(), year);
}
