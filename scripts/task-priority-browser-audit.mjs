import assert from "node:assert/strict";
import { chromium } from "playwright";

if (process.env.CONFIRM_DEMO_MUTATION !== "1") {
  throw new Error(
    "This audit creates and removes a temporary demo project. Set CONFIRM_DEMO_MUTATION=1 only for a dedicated demo database.",
  );
}

const baseUrl = process.env.DEMO_URL ?? "http://localhost:3000";
const email = process.env.DEMO_EMAIL ?? "demo@flowpilot.com";
const password = process.env.DEMO_PASSWORD ?? "DemoFlow2026!";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
const runId = Date.now();
const projectName = `Priority Audit ${runId}`;
const taskName = `Repeated Save ${runId}`;

const browser = await chromium.launch({ executablePath });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
let projectUrl;

function projectTaskCard() {
  return page
    .getByTestId("task-card")
    .filter({ has: page.getByText(taskName, { exact: true }) });
}

async function submitProjectAction(click) {
  const response = page.waitForResponse(
    (candidate) =>
      candidate.request().method() === "POST" &&
      candidate.url().includes("/dashboard/projects"),
    { timeout: 20_000 },
  );
  await click();
  await response;
  await page.waitForLoadState("networkidle").catch(() => {});
}

try {
  await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in|login/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 20_000 });

  await page.goto(`${baseUrl}/dashboard/projects`, { waitUntil: "networkidle" });
  await page.locator("#new-project-name").fill(projectName);
  await page.locator("#new-project-description").fill("Temporary priority regression audit");
  await submitProjectAction(() =>
    page.getByRole("button", { name: "Create Project" }).click(),
  );

  await page.getByRole("link", { name: new RegExp(projectName) }).click();
  await page.waitForURL(/\/dashboard\/projects\//, { timeout: 20_000 });
  projectUrl = page.url();

  await page.locator("#new-task-title").fill(taskName);
  await page.locator("#new-task-description").fill("High to Urgent repeated-save regression");
  await page.locator("#new-task-priority").selectOption("HIGH");
  await submitProjectAction(() =>
    page.getByRole("button", { name: "Add Task" }).click(),
  );

  let card = projectTaskCard();
  await card.getByText("Edit Task", { exact: true }).click();
  await card.getByLabel("Priority").selectOption("URGENT");
  await submitProjectAction(() =>
    card.getByRole("button", { name: "Save Changes" }).click(),
  );

  card = projectTaskCard();
  assert.equal(await card.getByLabel("Priority").inputValue(), "URGENT");
  await card.getByText("URGENT", { exact: true }).waitFor();

  await submitProjectAction(() =>
    card.getByRole("button", { name: "Save Changes" }).click(),
  );
  await page.reload({ waitUntil: "networkidle" });

  card = projectTaskCard();
  await card.getByText("Edit Task", { exact: true }).click();
  assert.equal(await card.getByLabel("Priority").inputValue(), "URGENT");
  await card.getByText("URGENT", { exact: true }).waitFor();

  await page.goto(`${baseUrl}/dashboard/tasks`, { waitUntil: "networkidle" });
  const globalCard = page
    .getByTestId("workspace-task-card")
    .filter({ has: page.getByText(taskName, { exact: true }) });
  await globalCard.getByText("URGENT", { exact: true }).waitFor();

  console.log("PASS High -> Urgent -> save -> unchanged save -> reload");
  console.log("PASS project and workspace task boards remain Urgent");
} finally {
  if (projectUrl) {
    try {
      await page.goto(projectUrl, { waitUntil: "networkidle" });
      page.once("dialog", (dialog) => dialog.accept());
      await submitProjectAction(() =>
        page.getByRole("button", { name: "Delete Project" }).click(),
      );
      await page.waitForURL(/\/dashboard\/projects$/, { timeout: 20_000 });
      console.log(`CLEANUP removed ${projectName}`);
    } catch (error) {
      console.error(`CLEANUP FAILED for ${projectName}`, error);
      process.exitCode = 1;
    }
  }
  await browser.close();
}
