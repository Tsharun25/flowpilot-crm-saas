import type { ClientStatus, Prisma, Priority, ProjectStatus, TaskStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

import { authOptions } from "@/lib/auth";
import { createCsv } from "@/lib/csv";
import { centsToDollars, getDealValueCents } from "@/lib/crm-metrics";
import { prisma } from "@/lib/prisma";

const MAX_ROWS = 5000;

function response(resource: string, csv: string) {
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="flowpilot-${resource}.csv"`, "Cache-Control": "private, no-store" } });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const membership = await prisma.membership.findFirst({ where: { userId: session.user.id }, orderBy: { createdAt: "asc" }, select: { workspaceId: true } });
  if (!membership) return new Response("Forbidden", { status: 403 });
  const { resource } = await params;
  const search = request.nextUrl.searchParams;
  const q = (search.get("q") ?? "").trim().slice(0, 100);

  if (resource === "clients") {
    const rawStatus = search.get("status") ?? "";
    const status = new Set(["LEAD", "CONTACTED", "WON", "LOST"]).has(rawStatus) ? rawStatus as ClientStatus : undefined;
    const where: Prisma.ClientWhereInput = { workspaceId: membership.workspaceId, ...(status ? { status } : {}), ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { company: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {}) };
    const clients = await prisma.client.findMany({ where, orderBy: { createdAt: "desc" }, take: MAX_ROWS });
    return response(resource, createCsv(["Name", "Company", "Email", "Status", "Deal Value USD", "Next Follow-up UTC", "Created At UTC"], clients.map((client) => [client.name, client.company, client.email, client.status, centsToDollars(getDealValueCents(client)).toFixed(2), client.nextFollowUp?.toISOString().slice(0, 10), client.createdAt.toISOString()])));
  }

  if (resource === "projects") {
    const rawStatus = search.get("status") ?? "";
    const status = new Set(["ACTIVE", "COMPLETED", "ARCHIVED"]).has(rawStatus) ? rawStatus as ProjectStatus : undefined;
    const rawClientId = search.get("clientId") ?? "";
    const clientFilter = rawClientId === "internal" ? { clientId: null } : /^[a-f\d]{24}$/i.test(rawClientId) ? { clientId: rawClientId } : {};
    const where: Prisma.ProjectWhereInput = { workspaceId: membership.workspaceId, ...clientFilter, ...(status ? { status } : {}), ...(q ? { name: { contains: q, mode: "insensitive" } } : {}) };
    const projects = await prisma.project.findMany({ where, include: { client: { select: { name: true } }, tasks: { select: { status: true } } }, orderBy: { createdAt: "desc" }, take: MAX_ROWS });
    return response(resource, createCsv(["Name", "Description", "Status", "Client", "Task Count", "Completed Tasks", "Created At UTC"], projects.map((project) => [project.name, project.description, project.status, project.client?.name, project.tasks.length, project.tasks.filter((task) => task.status === "DONE").length, project.createdAt.toISOString()])));
  }

  if (resource === "tasks") {
    const rawStatus = search.get("status") ?? "";
    const status = new Set(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]).has(rawStatus) ? rawStatus as TaskStatus : undefined;
    const rawPriority = search.get("priority") ?? "";
    const priority = new Set(["LOW", "MEDIUM", "HIGH", "URGENT"]).has(rawPriority) ? rawPriority as Priority : undefined;
    const projectId = /^[a-f\d]{24}$/i.test(search.get("projectId") ?? "") ? search.get("projectId")! : undefined;
    const now = new Date();
    const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const overdue = search.get("overdue") === "1";
    const where: Prisma.TaskWhereInput = { project: { workspaceId: membership.workspaceId }, ...(q ? { title: { contains: q, mode: "insensitive" } } : {}), ...(projectId ? { projectId } : {}), ...(status ? { status } : {}), ...(priority ? { priority } : {}), ...(overdue ? { dueDate: { lt: todayUtc }, status: { not: "DONE" } } : {}) };
    const tasks = await prisma.task.findMany({ where, include: { project: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: MAX_ROWS });
    return response(resource, createCsv(["Title", "Description", "Project", "Status", "Priority", "Due Date UTC", "Created At UTC"], tasks.map((task) => [task.title, task.description, task.project.name, task.status, task.priority, task.dueDate?.toISOString().slice(0, 10), task.createdAt.toISOString()])));
  }

  return new Response("Not found", { status: 404 });
}
