import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.DEMO_URL ?? "http://localhost:3000";
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE });
const page = await browser.newPage();

async function metric(label) {
  return page.getByText(label, { exact: true }).locator("..").locator("p").nth(1).innerText();
}

try {
  await page.goto(`${baseUrl}/login`);
  await page.getByLabel(/email/i).fill(process.env.DEMO_EMAIL ?? "demo@flowpilot.com");
  await page.getByLabel(/password/i).fill(process.env.DEMO_PASSWORD ?? "DemoFlow2026!");
  await page.getByRole("button", { name: /login|sign in/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 20_000 });

  await page.goto(`${baseUrl}/dashboard/clients?q=Daniel`, { waitUntil: "networkidle" });
  assert.equal(await metric("Filtered Clients"), "1");
  assert.equal(await metric("Filtered Open Pipeline"), "$85,000.00");
  assert.equal(await metric("Filtered Won Deal Value"), "$0.00");
  assert.equal(await page.getByTestId("client-card").count(), 1);

  await page.goto(`${baseUrl}/dashboard/clients?q=NoSuchClientForAudit`, { waitUntil: "networkidle" });
  assert.equal(await metric("Filtered Clients"), "0");
  assert.equal(await metric("Filtered Open Pipeline"), "$0.00");
  await page.getByText("No clients match these filters", { exact: true }).waitFor();

  await page.getByRole("link", { name: "Reset" }).click();
  await page.waitForURL(/\/dashboard\/clients$/);
  assert.equal(await metric("Filtered Clients"), "4");
  console.log("PASS filtered CRM cards, empty state, and reset use the board dataset");
} finally {
  await browser.close();
}
