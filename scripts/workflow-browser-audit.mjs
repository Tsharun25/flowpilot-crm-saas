import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";

if (process.env.CONFIRM_ISOLATED_MUTATION !== "1") throw new Error("Set CONFIRM_ISOLATED_MUTATION=1 only for an isolated acceptance run.");
const prisma = new PrismaClient();
const baseUrl = process.env.DEMO_URL ?? "http://localhost:3000";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
const runId = Date.now();
const email = `workflow-owner-${runId}@example.com`;
const password = `Workflow-${runId}-Pass!`;
let workspaceId;
let userId;
const clientName = `Ågency QA ${runId}`;
const company = `=2+2, "Synthetic"`;
const taskName = `Dated delivery ${runId}`;
let projectUrl;

const browser = await chromium.launch({ executablePath });
const page = await browser.newPage({ viewport: { width: 1366, height: 1000 }, acceptDownloads: true });

async function submit(click, urlPart) {
  const response = page.waitForResponse((candidate) => candidate.request().method() === "POST" && candidate.url().includes(urlPart), { timeout: 20_000 });
  await click(); await response; await page.waitForLoadState("networkidle").catch(() => {});
}
function clientCard() { return page.getByTestId("client-card").filter({ has: page.getByText(clientName, { exact: true }) }); }
function taskCard() { return page.getByTestId("task-card").filter({ has: page.getByText(taskName, { exact: true }) }); }

try {
  const workspace = await prisma.workspace.create({ data: { name: "Workflow Audit", slug: `workflow-audit-${runId}` } });
  const user = await prisma.user.create({ data: { name: "Workflow Owner", email, password: await bcrypt.hash(password, 10) } });
  await prisma.membership.create({ data: { role: "OWNER", userId: user.id, workspaceId: workspace.id } });
  workspaceId = workspace.id;
  userId = user.id;
  await page.goto(`${baseUrl}/login`);
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /login|sign in/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 20_000 });

  await page.goto(`${baseUrl}/dashboard/clients`, { waitUntil: "networkidle" });
  await page.locator("#client-name").fill(clientName);
  await page.locator("#client-company").fill(company);
  await page.locator("#client-email").fill(`workflow-${runId}@example.com`);
  await page.locator("#client-value").fill("1234.56");
  await page.locator("#client-follow-up").fill("2026-11-01");
  await submit(() => page.getByRole("button", { name: "Add Client" }).click(), "/dashboard/clients");
  await clientCard().waitFor({ timeout: 20_000 });
  assert.equal(await clientCard().count(), 1);

  const wonResponse = page.waitForResponse((r) => r.request().method() === "POST" && r.url().includes("/dashboard/clients"));
  await clientCard().getByLabel("Client status").selectOption("WON");
  await wonResponse;
  await page.waitForLoadState("networkidle").catch(() => {});
  await clientCard().getByText("WON", { exact: true }).waitFor();

  await clientCard().getByRole("link", { name: "View details & activity" }).click();
  await page.getByLabel("Plain-text note").fill("Unicode বাংলা, comma, and a newline\nremain plain text.");
  await submit(() => page.getByRole("button", { name: "Add Note" }).click(), "/dashboard/clients/");
  await page.getByText(/Unicode বাংলা/).waitFor();
  await submit(() => page.getByRole("button", { name: "Convert Won Deal to Project" }).click(), "/dashboard/clients/");
  await page.waitForURL(/\/dashboard\/projects\//, { timeout: 20_000 });
  projectUrl = page.url();
  await page.getByText(`Client: ${clientName}`, { exact: true }).waitFor();

  await page.locator("#new-task-title").fill(taskName);
  await page.locator("#new-task-description").fill("Past date should be overdue until complete");
  await page.locator("#new-task-priority").selectOption("HIGH");
  await page.locator("#new-task-due-date").fill("2026-10-19");
  await submit(() => page.getByRole("button", { name: "Add Task" }).click(), "/dashboard/projects/");
  let card = taskCard();
  await card.getByText(/Overdue/).waitFor();
  await card.getByText("Edit Task", { exact: true }).click();
  await card.getByLabel("Priority").selectOption("URGENT");
  await submit(() => card.getByRole("button", { name: "Save Changes" }).click(), "/dashboard/projects/");
  card = taskCard();
  assert.equal(await card.getByLabel("Priority").inputValue(), "URGENT");
  await submit(() => card.getByRole("button", { name: "Save Changes" }).click(), "/dashboard/projects/");
  await page.reload({ waitUntil: "networkidle" });
  card = taskCard(); await card.getByText("URGENT", { exact: true }).waitFor();
  const doneResponse = page.waitForResponse((r) => r.request().method() === "POST" && r.url().includes("/dashboard/projects/"));
  await card.getByLabel("Task status").selectOption("DONE");
  await doneResponse;
  await page.waitForLoadState("networkidle").catch(() => {});
  await taskCard().getByText(/Completed · due/).waitFor();

  await page.goto(`${baseUrl}/dashboard/tasks?q=${encodeURIComponent(taskName)}`, { waitUntil: "networkidle" });
  const workspaceCard = page.getByTestId("workspace-task-card").filter({ has: page.getByText(taskName, { exact: true }) });
  const reviewResponse = page.waitForResponse((r) => r.request().method() === "POST" && r.url().includes("/dashboard/tasks"));
  await workspaceCard.getByLabel("Task status").selectOption("REVIEW");
  await reviewResponse;
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await page.getByTestId("workspace-task-card").filter({ has: page.getByText(taskName, { exact: true }) }).getByLabel("Task status").inputValue(), "REVIEW");
  const restoreDoneResponse = page.waitForResponse((r) => r.request().method() === "POST" && r.url().includes("/dashboard/tasks"));
  await page.getByTestId("workspace-task-card").filter({ has: page.getByText(taskName, { exact: true }) }).getByLabel("Task status").selectOption("DONE");
  await restoreDoneResponse;

  await page.goto(`${baseUrl}/dashboard/clients?q=${encodeURIComponent(clientName)}&status=WON`, { waitUntil: "networkidle" });
  assert.equal(await clientCard().count(), 1);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Export filtered CSV" }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  let csv = ""; for await (const chunk of stream) csv += chunk.toString("utf8");
  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.includes(clientName));
  assert.ok(csv.includes("'=2+2"), "formula-like CSV cell should be prefixed safely");
  console.log("PASS lead, follow-up, note, Won conversion, linked project, due task, repeated priority save, inline workspace status, completion, filter, and safe CSV export");
} finally {
  try {
    if (projectUrl) {
      await page.goto(projectUrl, { waitUntil: "networkidle" });
      page.once("dialog", (dialog) => dialog.accept());
      await submit(() => page.getByRole("button", { name: "Delete Project" }).click(), "/dashboard/projects/");
    }
    await page.goto(`${baseUrl}/dashboard/clients?q=${encodeURIComponent(clientName)}`, { waitUntil: "networkidle" });
    const card = clientCard();
    if (await card.count()) { page.once("dialog", (dialog) => dialog.accept()); await submit(() => card.getByRole("button", { name: "Delete Client" }).click(), "/dashboard/clients"); }
    if (workspaceId) {
      await prisma.task.deleteMany({ where: { project: { workspaceId } } }).catch(() => {});
      await prisma.dealConversion.deleteMany({ where: { client: { workspaceId } } }).catch(() => {});
      await prisma.project.deleteMany({ where: { workspaceId } }).catch(() => {});
      await prisma.clientNote.deleteMany({ where: { client: { workspaceId } } }).catch(() => {});
      await prisma.clientActivity.deleteMany({ where: { client: { workspaceId } } }).catch(() => {});
      await prisma.client.deleteMany({ where: { workspaceId } }).catch(() => {});
      await prisma.membership.deleteMany({ where: { workspaceId } }).catch(() => {});
      await prisma.workspace.deleteMany({ where: { id: workspaceId } }).catch(() => {});
    }
    if (userId) await prisma.user.deleteMany({ where: { id: userId } }).catch(() => {});
    console.log("CLEANUP removed isolated workflow audit records");
  } catch (error) { console.error("CLEANUP FAILED", error); process.exitCode = 1; }
  await prisma.$disconnect(); await browser.close();
}
