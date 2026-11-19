import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  setupTestEnv,
  teardownTestEnv,
  clearDatabase,
  createTestUser,
  createTestComplaint,
  apiRequest,
} from "./helpers/setup.js";

describe("Complaint Analytics API", () => {
  let student, admin;

  before(async () => {
    await setupTestEnv();
  });

  after(async () => {
    await teardownTestEnv();
  });

  beforeEach(async () => {
    await clearDatabase();
    student = await createTestUser({
      name: "Analytics Student",
      email: "astudent@campus.edu",
      role: "student",
    });
    admin = await createTestUser({
      name: "Analytics Admin",
      email: "aadmin@campus.edu",
      role: "admin",
    });
  });

  it("should allow admin to access complaint analytics (200 OK)", async () => {
    await createTestComplaint(student.user, { title: "C1", category: "Water" });

    const res = await apiRequest("/api/complaints/analytics", {
      token: admin.token,
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data);
  });

  it("should reject student accessing analytics with 403 Forbidden", async () => {
    const res = await apiRequest("/api/complaints/analytics", {
      token: student.token,
    });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, "Forbidden");
  });

  it("should reject unauthenticated request with 401 Unauthorized", async () => {
    const res = await apiRequest("/api/complaints/analytics");

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, "Unauthorized request");
  });

  it("should return valid aggregation response structure and accurate metrics", async () => {
    const baseDate = new Date("2026-08-01T10:00:00Z");
    const resolvedDate = new Date("2026-08-02T10:00:00Z"); // 24 hours later (1 day)

    // 1: Water, Pending, High
    await createTestComplaint(student.user, {
      title: "Tap leaking",
      category: "Water",
      status: "Pending",
      priority: "High",
      createdAt: baseDate,
    });

    // 2: Water, Resolved, Medium (with timeline)
    await createTestComplaint(student.user, {
      title: "Pipe burst",
      category: "Water",
      status: "Resolved",
      priority: "Medium",
      createdAt: baseDate,
      updatedAt: resolvedDate,
      timeline: [
        { status: "Pending", note: "Submitted", timestamp: baseDate, actor: "Student" },
        { status: "Resolved", note: "Fixed", timestamp: resolvedDate, actor: "Admin" },
      ],
    });

    // 3: WiFi, In Progress, Low
    await createTestComplaint(student.user, {
      title: "Router offline",
      category: "WiFi",
      status: "In Progress",
      priority: "Low",
      createdAt: baseDate,
    });

    const res = await apiRequest("/api/complaints/analytics", {
      token: admin.token,
    });

    assert.equal(res.status, 200);
    const data = res.body.data;

    // Verify root metrics
    assert.equal(data.total, 3);
    assert.equal(data.resolved, 1);
    assert.equal(data.unresolved, 2);
    assert.equal(data.pending, 1);
    assert.equal(data.inProgress, 1);
    assert.equal(data.highPriority, 1);

    // Verify structured status, priority, and category counts
    assert.equal(data.statusCounts.Pending, 1);
    assert.equal(data.statusCounts["In Progress"], 1);
    assert.equal(data.statusCounts.Resolved, 1);

    assert.equal(data.priorityCounts.High, 1);
    assert.equal(data.priorityCounts.Medium, 1);
    assert.equal(data.priorityCounts.Low, 1);

    assert.equal(data.categoryCounts.Water, 2);
    assert.equal(data.categoryCounts.WiFi, 1);

    // Verify chart arrays
    assert.ok(Array.isArray(data.byStatus));
    assert.ok(Array.isArray(data.byPriority));
    assert.ok(Array.isArray(data.byCategory));
    assert.ok(Array.isArray(data.topCategories));
    assert.equal(data.topCategories[0].category, "Water");
    assert.equal(data.topCategories[0].count, 2);

    // Verify trend
    assert.ok(Array.isArray(data.trend));
    assert.ok(data.trend.length >= 1);
    assert.equal(data.trend[0].month, "Aug");
    assert.equal(data.trend[0].count, 3);

    // Verify resolution time
    assert.ok(typeof data.avgResolutionDays === "number");
    assert.ok(typeof data.avgResolutionHours === "number");
    assert.equal(data.resolutionTime.resolvedCountWithTimestamps, 1);
    assert.equal(data.avgResolutionDays, 1);
    assert.equal(data.avgResolutionHours, 24);
  });

  it("should validate date and query parameters correctly", async () => {
    // Invalid date
    const resInvalidDate = await apiRequest("/api/complaints/analytics?startDate=not-a-date", {
      token: admin.token,
    });
    assert.equal(resInvalidDate.status, 400);
    assert.equal(resInvalidDate.body.success, false);

    // Inverted date range
    const resInverted = await apiRequest(
      "/api/complaints/analytics?startDate=2026-10-10&endDate=2026-10-01",
      { token: admin.token }
    );
    assert.equal(resInverted.status, 400);
    assert.equal(resInverted.body.success, false);

    // Invalid category
    const resCat = await apiRequest("/api/complaints/analytics?category=FakeCategory", {
      token: admin.token,
    });
    assert.equal(resCat.status, 400);

    // Invalid status
    const resStatus = await apiRequest("/api/complaints/analytics?status=FakeStatus", {
      token: admin.token,
    });
    assert.equal(resStatus.status, 400);

    // Invalid priority
    const resPriority = await apiRequest("/api/complaints/analytics?priority=FakePriority", {
      token: admin.token,
    });
    assert.equal(resPriority.status, 400);
  });

  it("should correctly filter analytics by category and status", async () => {
    await createTestComplaint(student.user, { title: "C1", category: "Water", status: "Pending" });
    await createTestComplaint(student.user, { title: "C2", category: "WiFi", status: "Pending" });

    const filteredCat = await apiRequest("/api/complaints/analytics?category=Water", {
      token: admin.token,
    });
    assert.equal(filteredCat.status, 200);
    assert.equal(filteredCat.body.data.total, 1);
    assert.equal(filteredCat.body.data.categoryCounts.Water, 1);
  });
});
