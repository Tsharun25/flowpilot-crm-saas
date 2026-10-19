import assert from "node:assert/strict";
import { chromium } from "playwright";

if (process.env.CONFIRM_DEMO_MUTATION !== "1") {
  throw new Error(
    "This audit creates and removes temporary demo clients. Set CONFIRM_DEMO_MUTATION=1 only for a dedicated demo database.",
  );
}

const baseUrl = process.env.DEMO_URL ?? "http://localhost:3000";
const email = process.env.DEMO_EMAIL ?? "demo@flowpilot.com";
const password = process.env.DEMO_PASSWORD ?? "DemoFlow2026!";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
const runId = Date.now();
const cases = [
  { input: "0", display: "$0.00", status: "LEAD" },
  { input: "0.01", display: "$0.01", status: "CONTACTED" },
  { input: "1250.50", display: "$1,250.50", status: "WON" },
  {
    input: "1000000000.00",
    display: "$1,000,000,000.00",
    status: "LOST",
  },
];
const createdNames = [];

const browser = await chromium.launch({ executablePath });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

function clientCard(name) {
  return page
    .getByTestId("client-card")
    .filter({ has: page.getByText(name, { exact: true }) });
}

async function openClients() {
  await page.goto(`${baseUrl}/dashboard/clients`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForLoadState("networkidle").catch(() => {});
}

async function submitClientAction(click) {
  const response = page.waitForResponse(
    (candidate) =>
      candidate.request().method() === "POST" &&
      candidate.url().includes("/dashboard/clients"),
    { timeout: 20_000 },
  );
  await click();
  await response;
}

try {
  await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in|login/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 20_000 });

  for (const [index, testCase] of cases.entries()) {
    await openClients();
    const name = `Money Audit ${runId}-${index + 1}`;
    createdNames.push(name);

    await page.locator("#client-name").fill(name);
    await page.locator("#client-value").fill(testCase.input);
    await page.locator("#client-status").selectOption(testCase.status);
    await submitClientAction(() =>
      page.getByRole("button", { name: "Add Client" }).click(),
    );

    let card = clientCard(name);
    await card.getByText(testCase.display, { exact: true }).waitFor();

    await card.getByText("Edit Client", { exact: true }).click();
    await card.getByLabel("Deal value in USD").fill(testCase.input);
    await submitClientAction(() =>
      card.getByRole("button", { name: "Save Changes" }).click(),
    );

    await page.reload({ waitUntil: "networkidle" });
    card = clientCard(name);
    await card.getByText(testCase.display, { exact: true }).waitFor();
    console.log(`PASS create/edit/reload ${testCase.input} -> ${testCase.display}`);
  }

  const valueInput = page.locator("#client-value");
  for (const invalid of ["-0.01", "0.001", "1000000000.01"]) {
    await valueInput.fill(invalid);
    assert.equal(
      await valueInput.evaluate((input) => input.checkValidity()),
      false,
      `${invalid} should fail native input validation`,
    );
    console.log(`PASS browser rejects ${invalid}`);
  }

  await page.setViewportSize({ width: 360, height: 800 });
  const width = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));
  assert.ok(
    width.content <= width.viewport + 1,
    `Upper-bound money card caused horizontal overflow: ${JSON.stringify(width)}`,
  );
  console.log("PASS upper-bound card at 360px without horizontal overflow");
} finally {
  await page.setViewportSize({ width: 1920, height: 1080 }).catch(() => {});
  for (const name of createdNames) {
    try {
      await openClients();
      const card = clientCard(name);
      if ((await card.count()) === 0) continue;
      page.once("dialog", (dialog) => dialog.accept());
      await submitClientAction(() =>
        card.getByRole("button", { name: "Delete Client" }).click(),
      );
      await card.waitFor({ state: "detached", timeout: 20_000 });
      console.log(`CLEANUP removed ${name}`);
    } catch (error) {
      console.error(`CLEANUP FAILED for ${name}`, error);
      process.exitCode = 1;
    }
  }
  await browser.close();
}
