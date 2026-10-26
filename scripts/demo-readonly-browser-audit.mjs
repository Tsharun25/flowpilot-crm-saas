import assert from "node:assert/strict";
import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const baseUrl = process.env.DEMO_URL ?? "http://localhost:3000";
const email = process.env.DEMO_EMAIL ?? "demo@flowpilot.com";
const password = process.env.DEMO_PASSWORD ?? "DemoFlow2026!";
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE });
const page = await browser.newPage();

try {
  const demoUser = await prisma.user.findUnique({ where: { email }, include: { memberships: { include: { workspace: true } } } });
  const workspace = demoUser?.memberships[0]?.workspace;
  assert.ok(workspace?.isDemo, "The public demo workspace must have a persisted isDemo marker");
  const before = await prisma.client.count({ where: { workspaceId: workspace.id } });

  await page.goto(`${baseUrl}/login`);
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /login|sign in/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 20_000 });
  await page.getByText(/changes are disabled/i).waitFor();
  await page.goto(`${baseUrl}/dashboard/clients`, { waitUntil: "networkidle" });
  await page.locator("#client-name").fill(`Blocked ${Date.now()}`);
  await page.locator("#client-value").fill("1.00");
  const responsePromise = page.waitForResponse((response) => response.request().method() === "POST" && response.url().includes("/dashboard/clients"));
  await page.getByRole("button", { name: "Add Client" }).click();
  await responsePromise;
  assert.equal(await prisma.client.count({ where: { workspaceId: workspace.id } }), before, "A blocked demo mutation must leave data unchanged");
  console.log("PASS demo mutation rejected and client data remained unchanged");
} finally {
  await prisma.$disconnect();
  await browser.close();
}
