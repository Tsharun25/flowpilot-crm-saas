import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.DEMO_URL ?? "http://localhost:3000";
const email = process.env.DEMO_EMAIL ?? "demo@flowpilot.com";
const password = process.env.DEMO_PASSWORD ?? "DemoFlow2026!";
const outputDir = "marketplace-assets/responsive-audit";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;

const viewports = [
  { name: "mobile-360", width: 360, height: 800 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "laptop-1024", width: 1024, height: 768 },
  { name: "desktop-1280", width: 1280, height: 800 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

const routes = [
  { name: "landing", path: "/", public: true },
  { name: "dashboard", path: "/dashboard" },
  { name: "projects", path: "/dashboard/projects" },
  { name: "tasks", path: "/dashboard/tasks" },
  { name: "clients", path: "/dashboard/clients" },
  { name: "analytics", path: "/dashboard/analytics" },
  { name: "settings", path: "/dashboard/settings" },
];

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ executablePath });
let failed = false;

try {
  const context = await browser.newContext({ viewport: viewports[0] });
  const page = await context.newPage();

  await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in|login/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 20_000 });

  for (const route of routes) {
    await page.goto(`${baseUrl}${route.path}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(100);
      const metrics = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        pageWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
      }));
      const overflow = Math.max(metrics.pageWidth, metrics.bodyWidth) > metrics.viewport + 1;
      failed ||= overflow;
      console.log(`${overflow ? "FAIL" : "PASS"} ${viewport.name} ${route.path}`, metrics);
      await page.screenshot({
        path: `${outputDir}/${viewport.name}-${route.name}.png`,
        fullPage: true,
      });
    }
  }

  await context.close();
} finally {
  await browser.close();
}

if (failed) process.exitCode = 1;
