import { copyFile, mkdir, readFile } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.DEMO_URL ?? "http://localhost:3000";
const directory = "marketplace-assets/vibe96-round4";
const viewport = { width: 1920, height: 1080 };
const captureStyle = `
  nextjs-portal { display: none !important; }
  [data-testid="client-card"] p[title*="@"], [data-testid="profile-email"] { display: none !important; }
  input[type="email"]::placeholder { color: transparent !important; }
`;

await mkdir(directory, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
});
const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
const page = await context.newPage();

async function open(target, pathname) {
  const response = await target.goto(new URL(pathname, baseUrl).href, { waitUntil: "networkidle" });
  if (!response?.ok() || new URL(target.url()).pathname !== pathname) {
    throw new Error(`Could not capture ${pathname}: ${response?.status()} ${target.url()}`);
  }
  await target.locator("h1").waitFor();
  await target.evaluate(() => document.fonts.ready);
}

async function capture(target, filename) {
  await target.screenshot({ path: `${directory}/${filename}.png`, animations: "disabled", style: captureStyle });
}

try {
  await open(page, "/login");
  await page.getByRole("button", { name: /owner demo/i }).click();
  await page.waitForURL("**/dashboard");
  if (!(await page.getByRole("status").filter({ hasText: "Read-only demo" }).count())) {
    throw new Error("Marketplace captures require the synthetic read-only demo workspace.");
  }

  for (const [filename, pathname] of [
    ["02-workspace-overview", "/dashboard"],
    ["03-client-pipeline", "/dashboard/clients"],
    ["04-project-delivery", "/dashboard/projects"],
    ["05-task-board", "/dashboard/tasks"],
    ["06-analytics", "/dashboard/analytics"],
  ]) {
    await open(page, pathname);
    await capture(page, filename);
  }

  if (process.argv.includes("--refresh-product-previews")) {
    await copyFile(`${directory}/02-workspace-overview.png`, "public/product/workspace-overview-round4.png");
    await copyFile(`${directory}/03-client-pipeline.png`, "public/product/client-pipeline-round4.png");
  }

  await context.clearCookies();
  await open(page, "/login");
  await capture(page, "07-role-demo-login");
  await page.getByRole("button", { name: /admin demo/i }).click();
  await page.waitForURL("**/dashboard");
  await open(page, "/dashboard/settings");
  await capture(page, "09-admin-settings");
  await context.clearCookies();

  const imageData = async (filename) =>
    `data:image/png;base64,${await readFile(`${directory}/${filename}.png`, "base64")}`;
  const overview = await imageData("02-workspace-overview");
  const pipeline = await imageData("03-client-pipeline");

  await page.setContent(`<!doctype html><html lang="en"><meta charset="utf-8"><title>FlowPilot CRM cover</title><style>
    * { box-sizing: border-box }
    body { margin: 0; color: white; font-family: system-ui,sans-serif; background: radial-gradient(ellipse at 90% 30%, #805bd1, transparent 58%), #251636; }
    main { display: grid; grid-template-columns: 660px 1fr; align-items: center; gap: 64px; height: 1080px; padding: 74px 0 74px 105px; overflow: hidden; }
    .brand { font-size: 36px; font-weight: 720; letter-spacing: -1.8px; color: #eadbff; }
    h1 { font-size: 87px; font-weight: 760; line-height: .98; letter-spacing: -7px; margin: 55px 0 28px; }
    h1 span { color: #d8bbff; }
    p { font-size: 29px; line-height: 1.45; color: #efe3fa; margin: 0; }
    ul { display: grid; grid-template-columns: 1fr 1fr; padding: 0; gap: 16px; margin: 42px 0 0; list-style: none; }
    li { padding: 16px 20px; border: 1px solid #b596ec70; background: #ffffff0c; border-radius: 13px; font-size: 23px; }
    .stack { margin-top: 38px; font-size: 23px; color: #e1cef8; }
    figure { margin: 0; position: relative; height: 820px; }
    img { position: absolute; border-radius: 21px; border: 8px solid #ebddff; box-shadow: 0 38px 88px #1d103a99; }
    .overview { top: 42px; left: 0; width: 1030px; }
    .pipeline { bottom: 0; left: 240px; width: 800px; }
  </style><main>
    <div><div class="brand">FlowPilot CRM</div><h1>From signed deal to <span>delivered work.</span></h1>
    <p>Self-hosted CRM and project management for small teams.</p>
    <ul><li>Client pipeline</li><li>Linked projects</li><li>Kanban tasks</li><li>Workspace analytics</li></ul>
    <p class="stack">Next.js · TypeScript · MongoDB · Prisma</p></div>
    <figure><img class="overview" src="${overview}" alt="Workspace overview"><img class="pipeline" src="${pipeline}" alt="Client pipeline"></figure>
  </main></html>`);
  await capture(page, "01-cover");

  await page.setViewportSize({ width: 1080, height: 1080 });
  await open(page, "/");
  await capture(page, "08-landing-square");
} finally {
  await browser.close();
}
