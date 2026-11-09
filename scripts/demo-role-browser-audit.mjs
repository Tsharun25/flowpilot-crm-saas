import { chromium } from "playwright";

const baseUrl = process.env.AUDIT_BASE_URL ?? "http://127.0.0.1:3000";
const roles = ["Owner", "Admin", "Member"];
const browser = await chromium.launch({ headless: true });

try {
  for (const role of roles) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: `${role} demo` }).click();
    await page.waitForURL(`${baseUrl}/dashboard`, { timeout: 20_000 });
    await page.goto(`${baseUrl}/dashboard/settings`, { waitUntil: "networkidle" });
    await page.getByText(role.toUpperCase(), { exact: true }).waitFor();
    await context.close();
  }

  for (const width of [360, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } });
    const page = await context.newPage();
    for (const path of ["/", "/login"]) {
      await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      if (overflow) throw new Error(`${path} has horizontal overflow at ${width}px.`);
    }
    await context.close();
  }

  console.log("Owner, Admin and Member one-click login plus landing/login responsive checks passed.");
} finally {
  await browser.close();
}
