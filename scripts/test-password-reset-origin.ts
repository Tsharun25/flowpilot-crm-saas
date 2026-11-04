import assert from "node:assert/strict";

import {
  PasswordResetOriginError,
  passwordResetUrl,
  resolvePasswordResetOrigin,
} from "../src/lib/password-reset";

assert.equal(resolvePasswordResetOrigin("https://buyer.example", "production"), "https://buyer.example");
assert.equal(resolvePasswordResetOrigin("https://buyer.example/", "production"), "https://buyer.example");
assert.equal(resolvePasswordResetOrigin(undefined, "development"), "http://localhost:3000");
assert.equal(resolvePasswordResetOrigin("http://127.0.0.1:3000", "development"), "http://127.0.0.1:3000");
assert.equal(
  passwordResetUrl("test-token", "https://buyer.example"),
  "https://buyer.example/reset-password?token=test-token",
);

for (const value of [
  undefined,
  "",
  "not-a-url",
  "http://buyer.example",
  "https://user:password@buyer.example",
  "https://buyer.example/reset",
  "https://buyer.example?tenant=one",
  "https://buyer.example#fragment",
  "https://buyer.example./",
]) {
  assert.throws(
    () => resolvePasswordResetOrigin(value, "production"),
    PasswordResetOriginError,
    `Production must reject ${String(value)}`,
  );
}

assert.throws(
  () => resolvePasswordResetOrigin("http://buyer.example", "development"),
  PasswordResetOriginError,
);

console.log("Password reset trusted-origin validation tests passed.");
