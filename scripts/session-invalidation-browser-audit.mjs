import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";

if (process.env.CONFIRM_ISOLATED_MUTATION !== "1") throw new Error("Set CONFIRM_ISOLATED_MUTATION=1 only for an isolated acceptance run.");
const prisma = new PrismaClient();
const baseUrl = process.env.DEMO_URL ?? "http://localhost:3000";
const runId = Date.now();
const email = `session-audit-${runId}@example.com`;
const firstPassword = `Before-${runId}-Pass!`;
const nextPassword = `After-${runId}-Pass!`;
let workspaceId;
let userId;
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE });

async function login(context, password) {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/login`);
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /login|sign in/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 20_000 });
  return page;
}

try {
  const workspace = await prisma.workspace.create({ data: { name: "Session Audit", slug: `session-audit-${runId}` } });
  const user = await prisma.user.create({ data: { name: "Session Owner", email, password: await bcrypt.hash(firstPassword, 10) } });
  await prisma.membership.create({ data: { role: "OWNER", userId: user.id, workspaceId: workspace.id } });
  workspaceId = workspace.id;
  userId = user.id;

  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  const pageA = await login(contextA, firstPassword);
  const pageB = await login(contextB, firstPassword);

  await prisma.user.update({ where: { id: user.id }, data: { password: await bcrypt.hash(nextPassword, 12), sessionVersion: { increment: 1 } } });

  for (const page of [pageA, pageB]) {
    await page.goto(`${baseUrl}/dashboard`, { waitUntil: "networkidle" });
    await page.waitForURL(/\/login/, { timeout: 20_000 });
  }

  const contextFresh = await browser.newContext();
  const freshPage = await login(contextFresh, nextPassword);
  assert.match(freshPage.url(), /\/dashboard/);
  await contextA.close(); await contextB.close(); await contextFresh.close();
  console.log("PASS password reset invalidated two existing JWT sessions and allowed a fresh login");
} finally {
  if (workspaceId) {
    await prisma.membership.deleteMany({ where: { workspaceId } }).catch(() => {});
    await prisma.workspace.deleteMany({ where: { id: workspaceId } }).catch(() => {});
  }
  if (userId) await prisma.user.deleteMany({ where: { id: userId } }).catch(() => {});
  await prisma.$disconnect();
  await browser.close();
  console.log("CLEANUP removed session invalidation audit records");
}
