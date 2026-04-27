import assert from "node:assert/strict";
import test from "node:test";

process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://x:y@localhost:5432/z";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const { signToken, verifyToken, buildCookieOptions } = await import("../src/utils/jwt.js");

test("signToken and verifyToken round-trip user id", () => {
  const token = signToken("user_123");
  const payload = verifyToken(token);

  assert.equal(payload.userId, "user_123");
});

test("buildCookieOptions uses secure defaults in development", () => {
  const options = buildCookieOptions();

  assert.equal(options.httpOnly, true);
  assert.equal(options.sameSite, "lax");
  assert.equal(options.secure, false);
});

