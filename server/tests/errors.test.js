import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  setupTestEnv,
  teardownTestEnv,
  clearDatabase,
  createTestUser,
  apiRequest,
} from "./helpers/setup.js";
import { errorHandler } from "../src/middlewares/error.middleware.js";

describe("Error Handling", () => {
  let admin, student;

  before(async () => {
    await setupTestEnv();
  });

  after(async () => {
    await teardownTestEnv();
  });

  beforeEach(async () => {
    await clearDatabase();
    admin = await createTestUser({
      name: "Admin Err",
      email: "admin-err@campus.edu",
      role: "admin",
    });
    student = await createTestUser({
      name: "Student Err",
      email: "student-err@campus.edu",
      role: "student",
    });
  });

  it("should handle body validation errors with 400 and consistent error format", async () => {
    const res = await apiRequest("/api/auth/register", {
      method: "POST",
      body: {
        // Missing name, email, password
      },
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(typeof res.body.message === "string");
    assert.ok(Array.isArray(res.body.errors));
    assert.ok(res.body.errors.length > 0);
  });

  it("should handle Mongoose CastError on invalid identifier with 400", async () => {
    // /api/users/:id passes param directly to User.findById which triggers Mongoose CastError
    const res = await apiRequest("/api/users/not-an-object-id-cast-error", {
      token: admin.token,
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(typeof res.body.message === "string");
    assert.ok(Array.isArray(res.body.errors));
    assert.ok(res.body.message.includes("Invalid"));
  });

  it("should handle duplicate key registration conflict with 409", async () => {
    await createTestUser({
      email: "duplicate@campus.edu",
    });

    const res = await apiRequest("/api/auth/register", {
      method: "POST",
      body: {
        name: "Second User",
        email: "duplicate@campus.edu",
        password: "password123",
      },
    });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.ok(typeof res.body.message === "string");
    assert.ok(Array.isArray(res.body.errors));
    assert.equal(res.body.message, "Email already registered");
  });

  it("should handle raw MongoDB code 11000 duplicate key error in errorHandler middleware", () => {
    const fakeReq = {};
    let capturedStatus = 0;
    let capturedJson = null;
    const fakeRes = {
      status(s) {
        capturedStatus = s;
        return this;
      },
      json(j) {
        capturedJson = j;
        return this;
      },
    };

    const duplicateErr = new Error("E11000 duplicate key error");
    duplicateErr.code = 11000;
    duplicateErr.keyPattern = { email: 1 };

    errorHandler(duplicateErr, fakeReq, fakeRes, () => {});

    assert.equal(capturedStatus, 409);
    assert.equal(capturedJson.success, false);
    assert.equal(capturedJson.message, "email already exists");
    assert.deepEqual(capturedJson.errors, ["email already exists"]);
  });

  it("should handle malformed JSON syntax in request body with 400", async () => {
    const res = await apiRequest("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ malformed json",
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, "Invalid JSON body");
    assert.deepEqual(res.body.errors, ["Invalid JSON body"]);
  });

  it("should maintain consistent { success: false, message, errors } format across 401, 403, 404", async () => {
    // 401 Unauthorized
    const res401 = await apiRequest("/api/complaints");
    assert.equal(res401.status, 401);
    assert.equal(res401.body.success, false);
    assert.ok(typeof res401.body.message === "string");
    assert.ok(Array.isArray(res401.body.errors) && res401.body.errors.length > 0);

    // 403 Forbidden
    const res403 = await apiRequest("/api/complaints/analytics", {
      token: student.token,
    });
    assert.equal(res403.status, 403);
    assert.equal(res403.body.success, false);
    assert.ok(typeof res403.body.message === "string");
    assert.ok(Array.isArray(res403.body.errors) && res403.body.errors.length > 0);

    // 404 Not Found
    const res404 = await apiRequest("/api/complaints/607f1f77bcf86cd799439011", {
      token: admin.token,
    });
    assert.equal(res404.status, 404);
    assert.equal(res404.body.success, false);
    assert.ok(typeof res404.body.message === "string");
    assert.ok(Array.isArray(res404.body.errors) && res404.body.errors.length > 0);
  });
});
