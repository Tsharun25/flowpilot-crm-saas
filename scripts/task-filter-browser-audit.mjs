import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.DEMO_URL ?? "http://localhost:3000";
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE });
const page = await browser.newPage();

async function openFilter(query) {
  await page.goto(`${baseUrl}/dashboard/tasks?${query}`, { waitUntil: "networkidle" });
  return page.getByTestId("workspace-task-card");
}

async function exportedStatuses(query) {
  const response = await page.request.get(`${baseUrl}/api/export/tasks?${query}`);
  assert.equal(response.status(), 200);
  const csv = await response.text();
  return [...csv.matchAll(/,"(TODO|IN_PROGRESS|REVIEW|DONE)",/g)].map((match) => match[1]);
}

try {
  await page.goto(`${baseUrl}/login`);
  await page.getByLabel(/email/i).fill(process.env.DEMO_EMAIL ?? "demo@flowpilot.com");
  await page.getByLabel(/password/i).fill(process.env.DEMO_PASSWORD ?? "DemoFlow2026!");
  await page.getByRole("button", { name: /login|sign in/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 20_000 });

  const doneCards = await openFilter("status=DONE&overdue=1");
  assert.equal(await doneCards.count(), 0);
  await page.getByText("No tasks match these filters", { exact: true }).waitFor();
  assert.deepEqual(await exportedStatuses("status=DONE&overdue=1"), []);

  const progressCards = await openFilter("status=IN_PROGRESS&overdue=1");
  assert.ok(await progressCards.count() > 0, "Demo data should contain an overdue In Progress task");
  const progressStatuses = await exportedStatuses("status=IN_PROGRESS&overdue=1");
  assert.ok(progressStatuses.length > 0);
  assert.ok(progressStatuses.every((status) => status === "IN_PROGRESS"));

  await openFilter("status=REVIEW&overdue=1");
  const reviewStatuses = await exportedStatuses("status=REVIEW&overdue=1");
  assert.ok(reviewStatuses.every((status) => status === "REVIEW"));

  await openFilter("overdue=1");
  const overdueStatuses = await exportedStatuses("overdue=1");
  assert.ok(overdueStatuses.length > 0);
  assert.ok(overdueStatuses.every((status) => status !== "DONE"));

  console.log("PASS task board and CSV compose status with overdue filters");
} finally {
  await browser.close();
}
