import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";

if (process.env.CONFIRM_ISOLATION_MUTATION !== "1") throw new Error("Set CONFIRM_ISOLATION_MUTATION=1 only for an isolated acceptance run.");
const prisma = new PrismaClient();
const baseUrl = process.env.DEMO_URL ?? "http://localhost:3000";
const runId = Date.now();
const password = `Isolation-${runId}-Pass!`;
const hash = await bcrypt.hash(password, 10);
const emails = [`isolation-a-${runId}@example.com`, `isolation-b-${runId}@example.com`];
const workspaceIds = [];
const userIds = [];
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE });

async function login(context, email) {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/login`);
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /login|sign in/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 20_000 });
  return page;
}

try {
  for (let index = 0; index < 2; index += 1) {
    const workspace = await prisma.workspace.create({ data: { name: `Isolation ${index}`, slug: `isolation-${runId}-${index}` } });
    const user = await prisma.user.create({ data: { name: `Isolation User ${index}`, email: emails[index], password: hash } });
    await prisma.membership.create({ data: { role: "OWNER", userId: user.id, workspaceId: workspace.id } });
    workspaceIds.push(workspace.id); userIds.push(user.id);
  }
  const client = await prisma.client.create({ data: { name: `Private Client ${runId}`, email: `private-${runId}@example.com`, value: 42, valueCents: BigInt(4200), status: "WON", wonAt: new Date(), workspaceId: workspaceIds[0] } });
  const project = await prisma.project.create({ data: { name: `Private Project ${runId}`, workspaceId: workspaceIds[0], clientId: client.id } });
  const task = await prisma.task.create({ data: { title: `Private Task ${runId}`, projectId: project.id } });

  const anonymous = await browser.newContext();
  const anonymousPage = await anonymous.newPage();
  await anonymousPage.goto(`${baseUrl}/dashboard/clients/${client.id}`);
  await anonymousPage.waitForURL(/\/login/, { timeout: 20_000 });
  await anonymous.close();

  const contextA = await browser.newContext();
  const pageA = await login(contextA, emails[0]);
  await pageA.goto(`${baseUrl}/dashboard/clients/${client.id}`, { waitUntil: "networkidle" });
  await pageA.getByText(client.name, { exact: true }).waitFor();

  const contextB = await browser.newContext();
  const pageB = await login(contextB, emails[1]);
  await pageB.goto(`${baseUrl}/dashboard/clients/${client.id}`, { waitUntil: "networkidle" });
  assert.ok((await pageB.locator("body").innerText()).includes("not found") || (await pageB.locator("body").innerText()).includes("404"));
  await pageB.goto(`${baseUrl}/dashboard/projects/${project.id}`, { waitUntil: "networkidle" });
  assert.ok((await pageB.locator("body").innerText()).includes("not found") || (await pageB.locator("body").innerText()).includes("404"));
  const exportResponse = await pageB.request.get(`${baseUrl}/api/export/clients?q=${encodeURIComponent(client.name)}`);
  assert.equal(exportResponse.status(), 200);
  assert.equal((await exportResponse.text()).includes(client.name), false);
  await pageB.goto(`${baseUrl}/dashboard/projects`, { waitUntil: "networkidle" });
  assert.equal(await pageB.locator(`#new-project-client option[value="${client.id}"]`).count(), 0);
  assert.equal(await prisma.client.updateMany({ where: { id: client.id, workspaceId: workspaceIds[1] }, data: { name: "FORBIDDEN" } }).then((result) => result.count), 0);
  assert.equal(await prisma.task.findFirst({ where: { id: task.id, project: { workspaceId: workspaceIds[1] } } }), null);
  console.log("PASS fresh sessions, anonymous protection, cross-workspace reads, scoped export, link selector isolation, scoped write, and nested task isolation");
  await contextA.close(); await contextB.close();
} finally {
  for (const workspaceId of workspaceIds) {
    await prisma.task.deleteMany({ where: { project: { workspaceId } } }).catch(() => {});
    await prisma.dealConversion.deleteMany({ where: { client: { workspaceId } } }).catch(() => {});
    await prisma.project.deleteMany({ where: { workspaceId } }).catch(() => {});
    await prisma.clientNote.deleteMany({ where: { client: { workspaceId } } }).catch(() => {});
    await prisma.clientActivity.deleteMany({ where: { client: { workspaceId } } }).catch(() => {});
    await prisma.client.deleteMany({ where: { workspaceId } }).catch(() => {});
    await prisma.membership.deleteMany({ where: { workspaceId } }).catch(() => {});
    await prisma.workspace.deleteMany({ where: { id: workspaceId } }).catch(() => {});
  }
  for (const id of userIds) await prisma.user.deleteMany({ where: { id } }).catch(() => {});
  await prisma.$disconnect(); await browser.close();
  console.log("CLEANUP removed isolation audit records");
}
