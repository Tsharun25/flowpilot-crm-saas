import { chromium } from "playwright";

const baseUrl = process.env.DEMO_URL ?? "http://localhost:3000";
const email = process.env.DEMO_EMAIL ?? "demo@flowpilot.com";
const password = process.env.DEMO_PASSWORD ?? "DemoFlow2026!";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;

const publicRoutes = [
  { name: "landing", path: "/", expectNoIndex: false },
  { name: "login", path: "/login", expectNoIndex: true },
  { name: "register", path: "/register", expectNoIndex: true },
  { name: "privacy", path: "/privacy", expectNoIndex: false },
  { name: "terms", path: "/terms", expectNoIndex: false },
  { name: "support", path: "/support", expectNoIndex: false },
];

const authenticatedRoutes = [
  { name: "overview", path: "/dashboard", expectNoIndex: true },
  { name: "projects", path: "/dashboard/projects", expectNoIndex: true },
  { name: "tasks", path: "/dashboard/tasks", expectNoIndex: true },
  { name: "clients", path: "/dashboard/clients", expectNoIndex: true },
  { name: "analytics", path: "/dashboard/analytics", expectNoIndex: true },
  { name: "settings", path: "/dashboard/settings", expectNoIndex: true },
];

const browser = await chromium.launch({ executablePath });
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
});
const page = await context.newPage();
const results = [];

function record(route, check, passed, details = "") {
  results.push({ route, check, passed, details });
  console.log(
    `${passed ? "PASS" : "FAIL"} ${route} — ${check}${details ? `: ${details}` : ""}`
  );
}

async function auditRoute(route) {
  await page.goto(`${baseUrl}${route.path}`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});

  const report = await page.evaluate(() => {
    function isVisible(element) {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();

      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        rect.width > 0 &&
        rect.height > 0
      );
    }

    function referencedText(element) {
      const ids = element.getAttribute("aria-labelledby")?.trim().split(/\s+/) ?? [];
      return ids
        .map((id) => document.getElementById(id)?.textContent?.trim() ?? "")
        .filter(Boolean)
        .join(" ");
    }

    function accessibleName(element) {
      const ariaLabel = element.getAttribute("aria-label")?.trim();
      if (ariaLabel) return ariaLabel;

      const ariaLabelledBy = referencedText(element);
      if (ariaLabelledBy) return ariaLabelledBy;

      const isFormControl =
        element instanceof HTMLInputElement ||
        element instanceof HTMLSelectElement ||
        element instanceof HTMLTextAreaElement;

      if (isFormControl) {
        const labelText = Array.from(element.labels ?? [])
          .map((label) => label.textContent?.trim() ?? "")
          .filter(Boolean)
          .join(" ");
        if (labelText) return labelText;

        if (
          element instanceof HTMLInputElement &&
          ["button", "reset", "submit"].includes(element.type) &&
          element.value.trim()
        ) {
          return element.value.trim();
        }

        const controlTitle = element.getAttribute("title")?.trim();
        return controlTitle ?? "";
      }

      const title = element.getAttribute("title")?.trim();
      if (title) return title;

      const text = element.textContent?.trim();
      if (text) return text;

      const imageAlt = element.querySelector("img[alt]")?.getAttribute("alt")?.trim();
      return imageAlt ?? "";
    }

    function describe(element) {
      const id = element.id ? `#${element.id}` : "";
      const name = element.getAttribute("name");
      return `${element.tagName.toLowerCase()}${id}${name ? `[name="${name}"]` : ""}`;
    }

    const ids = Array.from(document.querySelectorAll("[id]"))
      .map((element) => element.id)
      .filter(Boolean);
    const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];

    const controls = Array.from(
      document.querySelectorAll("input:not([type='hidden']), select, textarea")
    ).filter(isVisible);
    const unnamedControls = controls
      .filter((element) => !accessibleName(element))
      .map(describe);

    const namedInteractive = Array.from(
      document.querySelectorAll(
        "a[href], button, summary, [role='button'], [role='link'], [role='dialog'], [role='img'], [role='progressbar']"
      )
    ).filter(isVisible);
    const unnamedInteractive = namedInteractive
      .filter((element) => !accessibleName(element))
      .map(describe);

    const orphanLabels = Array.from(document.querySelectorAll("label[for]"))
      .filter((label) => !document.getElementById(label.htmlFor))
      .map((label) => `label[for="${label.htmlFor}"]`);

    const imagesMissingAlt = Array.from(document.querySelectorAll("img:not([alt])"))
      .filter(isVisible)
      .map(describe);

    const passwordFormsUsingGet = Array.from(
      document.querySelectorAll("input[type='password']")
    )
      .map((input) => input.closest("form"))
      .filter((form) => form && form.method.toLowerCase() === "get")
      .map(() => "password form defaults to GET");

    return {
      title: document.title.trim(),
      lang: document.documentElement.lang.trim(),
      visibleH1Count: Array.from(document.querySelectorAll("h1")).filter(isVisible)
        .length,
      mainCount: Array.from(document.querySelectorAll("main")).filter(isVisible).length,
      robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? "",
      duplicateIds,
      unnamedControls,
      unnamedInteractive,
      orphanLabels,
      imagesMissingAlt,
      passwordFormsUsingGet,
    };
  });

  record(route.path, "document title", Boolean(report.title), report.title || "missing");
  record(route.path, "document language", Boolean(report.lang), report.lang || "missing");
  record(
    route.path,
    "visible primary heading",
    report.visibleH1Count === 1,
    `${report.visibleH1Count} visible h1`
  );
  record(route.path, "main landmark", report.mainCount === 1, `${report.mainCount} visible main`);
  record(
    route.path,
    "unique element IDs",
    report.duplicateIds.length === 0,
    report.duplicateIds.join(", ")
  );
  record(
    route.path,
    "form control names",
    report.unnamedControls.length === 0,
    report.unnamedControls.join(", ")
  );
  record(
    route.path,
    "interactive accessible names",
    report.unnamedInteractive.length === 0,
    report.unnamedInteractive.join(", ")
  );
  record(
    route.path,
    "label targets",
    report.orphanLabels.length === 0,
    report.orphanLabels.join(", ")
  );
  record(
    route.path,
    "image alternatives",
    report.imagesMissingAlt.length === 0,
    report.imagesMissingAlt.join(", ")
  );
  record(
    route.path,
    "password form method",
    report.passwordFormsUsingGet.length === 0,
    report.passwordFormsUsingGet.join(", ")
  );
  record(
    route.path,
    "private-route noindex",
    !route.expectNoIndex || report.robots.toLowerCase().includes("noindex"),
    report.robots || (route.expectNoIndex ? "missing" : "not required")
  );

  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    document.body.tabIndex = -1;
    document.body.focus();
    document.body.removeAttribute("tabindex");
  });
  await page.keyboard.press("Tab");

  const keyboardFocus = await page.evaluate(() => {
    const element = document.activeElement;
    if (!(element instanceof HTMLElement) || element === document.body) {
      return { passed: false, details: "Tab did not move focus to an interactive element" };
    }

    const style = window.getComputedStyle(element);
    const hasOutline =
      style.outlineStyle !== "none" && Number.parseFloat(style.outlineWidth) > 0;
    const hasShadow = style.boxShadow !== "none";

    return {
      passed: hasOutline || hasShadow,
      details: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}`,
    };
  });

  record(
    route.path,
    "keyboard focus indicator",
    keyboardFocus.passed,
    keyboardFocus.details
  );

  return report.title;
}

async function testMobileDrawer() {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/dashboard`, { waitUntil: "domcontentloaded" });

  const trigger = page.getByRole("button", { name: "Open navigation" });
  await trigger.focus();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog", { name: "Dashboard navigation" });
  await dialog.waitFor({ state: "visible" });

  const openedFocus = await page.evaluate(
    () => document.activeElement?.getAttribute("aria-label") ?? ""
  );
  record(
    "mobile drawer",
    "focus moves inside",
    openedFocus === "Close navigation",
    openedFocus || "no focused control"
  );

  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "detached" });

  const restoredFocus = await page.evaluate(
    () => document.activeElement?.getAttribute("aria-label") ?? ""
  );
  record(
    "mobile drawer",
    "Escape closes and restores focus",
    restoredFocus === "Open navigation",
    restoredFocus || "no focused control"
  );
}

try {
  const titles = new Map();

  for (const route of publicRoutes) {
    titles.set(route.path, await auditRoute(route));
  }

  await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Login" }).click();
  await page.waitForURL(/\/dashboard(?:\/|$)/, { timeout: 20_000 });

  for (const route of authenticatedRoutes) {
    titles.set(route.path, await auditRoute(route));
  }

  await page.goto(`${baseUrl}/dashboard/projects`, { waitUntil: "domcontentloaded" });
  const projectHref = await page
    .locator('a[href^="/dashboard/projects/"]')
    .first()
    .getAttribute("href");

  if (projectHref) {
    const projectRoute = {
      name: "project details",
      path: projectHref,
      expectNoIndex: true,
    };
    titles.set(projectHref, await auditRoute(projectRoute));
  } else {
    console.log("SKIP project details — no seeded project is available");
  }

  await page.goto(`${baseUrl}/dashboard/clients`, { waitUntil: "domcontentloaded" });
  const clientHref = await page.locator('a[href^="/dashboard/clients/"]').first().getAttribute("href");
  if (clientHref) {
    const clientRoute = { name: "client details", path: clientHref, expectNoIndex: true };
    titles.set(clientHref, await auditRoute(clientRoute));
  } else {
    console.log("SKIP client details — no seeded client is available");
  }

  const titleGroups = new Map();
  for (const [path, title] of titles) {
    const paths = titleGroups.get(title) ?? [];
    paths.push(path);
    titleGroups.set(title, paths);
  }

  const duplicateTitles = [...titleGroups.entries()].filter(
    ([title, paths]) => !title || paths.length > 1
  );
  record(
    "all routes",
    "unique descriptive titles",
    duplicateTitles.length === 0,
    duplicateTitles
      .map(([title, paths]) => `${title || "(empty)"}: ${paths.join(", ")}`)
      .join("; ")
  );

  await testMobileDrawer();
} finally {
  await context.close();
  await browser.close();
}

const failures = results.filter((result) => !result.passed);
console.log(
  `\nAutomated accessibility checks: ${results.length - failures.length}/${results.length} passed.`
);
console.log(
  "Scope: metadata, landmarks, accessible names, labels, duplicate IDs, basic focus visibility, and mobile drawer focus behavior. This is not an axe, contrast, zoom, screen-reader, or full manual keyboard audit."
);

if (failures.length) process.exitCode = 1;
