import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.DEMO_URL ?? "http://localhost:3000";
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE });
const page = await browser.newPage();

try {
  await page.goto(`${baseUrl}/login`);
  const email = page.getByLabel(/email/i);
  await email.fill("failure-state@example.com");
  await page.getByLabel(/password/i).fill("WrongPassword123!");
  const button = page.getByRole("button", { name: /login|sign in/i });
  await button.click();
  await page.getByRole("alert").waitFor({ timeout: 20_000 });
  assert.equal(await email.inputValue(), "failure-state@example.com", "Failed sign-in must preserve the entered email");
  assert.equal(await button.isEnabled(), true, "Failed sign-in must not leave an indefinite pending state");

  const exportResponse = await page.request.get(`${baseUrl}/api/export/clients`);
  assert.equal(exportResponse.status(), 401, "Anonymous export must fail with 401");
  console.log("PASS failed login preserved input/recovered pending state; anonymous export returned 401");
} finally {
  await browser.close();
}
