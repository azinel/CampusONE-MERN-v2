import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  setupTestEnv,
  teardownTestEnv,
  clearDatabase,
  createTestUser,
  apiRequest,
} from "./helpers/setup.js";

describe("Authentication API", () => {
  before(async () => {
    await setupTestEnv();
  });

  after(async () => {
    await teardownTestEnv();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  it("should successfully log in with valid credentials", async () => {
    await createTestUser({
      name: "Auth Student",
      email: "auth-student@campus.edu",
      password: "ValidPassword123",
      role: "student",
    });

    const res = await apiRequest("/api/auth/login", {
      method: "POST",
      body: {
        email: "auth-student@campus.edu",
        password: "ValidPassword123",
      },
    });

    assert.equal(res.status, 200);
    assert.ok(res.body.token, "Response should include an access token");
    assert.equal(res.body.user.email, "auth-student@campus.edu");
    assert.equal(res.body.user.role, "student");
    assert.equal(res.body.user.passwordHash, undefined, "passwordHash must not be exposed");
  });

  it("should reject login with invalid password", async () => {
    await createTestUser({
      name: "Auth Student",
      email: "auth-student@campus.edu",
      password: "ValidPassword123",
    });

    const res = await apiRequest("/api/auth/login", {
      method: "POST",
      body: {
        email: "auth-student@campus.edu",
        password: "WrongPassword999",
      },
    });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, "Invalid email or password");
    assert.ok(Array.isArray(res.body.errors));
    assert.ok(res.body.errors.includes("Invalid email or password"));
  });

  it("should reject login with non-existent email", async () => {
    const res = await apiRequest("/api/auth/login", {
      method: "POST",
      body: {
        email: "nobody@campus.edu",
        password: "SomePassword123",
      },
    });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, "Invalid email or password");
  });

  it("should reject protected route without token", async () => {
    const res = await apiRequest("/api/auth/me", {
      method: "GET",
    });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, "Unauthorized request");
    assert.ok(Array.isArray(res.body.errors));
  });

  it("should reject protected route with invalid token", async () => {
    const res = await apiRequest("/api/auth/me", {
      method: "GET",
      token: "malformed.invalid.token",
    });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, "Invalid or expired access token");
    assert.ok(Array.isArray(res.body.errors));
  });

  it("should allow access to protected route with valid token", async () => {
    const { token } = await createTestUser({
      name: "Protected User",
      email: "protected@campus.edu",
    });

    const res = await apiRequest("/api/auth/me", {
      method: "GET",
      token,
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.email, "protected@campus.edu");
  });
});
