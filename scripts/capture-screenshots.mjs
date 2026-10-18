import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.DEMO_URL ?? "http://localhost:3000";
const email = process.env.DEMO_EMAIL ?? "demo@flowpilot.com";
const password = process.env.DEMO_PASSWORD ?? "DemoFlow2026!";
const outputDir = "marketplace-assets/screenshots";

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

async function capture(name, path) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${outputDir}/${name}.png`, fullPage: false });
}

try {
  await capture("01-landing-page", "/");

  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in|login/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 20_000 });

  await capture("02-dashboard", "/dashboard");
  await capture("03-projects", "/dashboard/projects");
  await capture("04-crm-pipeline", "/dashboard/clients");
  await capture("05-analytics", "/dashboard/analytics");
  await capture("06-settings", "/dashboard/settings");
} finally {
  await browser.close();
}
