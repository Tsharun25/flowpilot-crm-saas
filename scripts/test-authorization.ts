import assert from "node:assert/strict";
import {
  assertWorkspaceManagerRole,
  canManageWorkspace,
} from "../src/lib/authorization-policy";
import { assertWorkspaceWritable } from "../src/lib/demo-workspace";

assert.equal(canManageWorkspace("OWNER"), true);
assert.equal(canManageWorkspace("ADMIN"), true);
assert.equal(canManageWorkspace("MEMBER"), false);
assert.doesNotThrow(() => assertWorkspaceManagerRole("OWNER"));
assert.doesNotThrow(() => assertWorkspaceManagerRole("ADMIN"));
assert.throws(() => assertWorkspaceManagerRole("MEMBER"), /Forbidden/);
assert.doesNotThrow(() =>
  assertWorkspaceWritable({ isDemo: false, slug: "customer-workspace" }),
);
assert.throws(
  () => assertWorkspaceWritable({ isDemo: true, slug: "demo" }),
  /changes are disabled/,
);

console.log("Authorization policy unit tests passed.");
