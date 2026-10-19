import assert from "node:assert/strict";

import {
  DEMO_ACCOUNT_EMAIL,
  isDemoWorkspace,
} from "../src/lib/demo-workspace";

assert.equal(
  isDemoWorkspace({ isDemo: true, slug: "renamed-workspace" }, "owner@example.com"),
  true,
  "A persisted demo marker must survive workspace renames",
);
assert.equal(
  isDemoWorkspace(
    { isDemo: false, slug: "demo-account-workspace-123" },
    DEMO_ACCOUNT_EMAIL,
  ),
  true,
  "The documented legacy demo account slug must be recognized",
);
assert.equal(
  isDemoWorkspace(
    { isDemo: false, slug: "demo-user-workspace-123" },
    "buyer@example.com",
  ),
  false,
  "A buyer workspace must not be locked only because its slug resembles the legacy demo",
);
assert.equal(
  isDemoWorkspace(
    { isDemo: false, slug: "customer-workspace-123" },
    DEMO_ACCOUNT_EMAIL,
  ),
  false,
  "The demo account must not authorize resetting an unrelated workspace",
);

console.log("Demo workspace safety tests passed.");
