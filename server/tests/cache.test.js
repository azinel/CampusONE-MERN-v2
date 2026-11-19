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
import { MockRedis } from "./helpers/mockRedis.js";
import { setRedisClient, closeRedisConnection, verifyRedisConnection } from "../src/config/redis.js";
import Complaint from "../src/models/Complaint.js";

describe("Redis Caching and Invalidation", () => {
  let admin, studentA, studentB;
  let mockRedis;

  before(async () => {
    await setupTestEnv();
    mockRedis = new MockRedis();
    setRedisClient(mockRedis);
  });

  after(async () => {
    await closeRedisConnection();
    await teardownTestEnv();
  });

  beforeEach(async () => {
    await clearDatabase();
    await mockRedis.flushdb();
    mockRedis.resetStats();
    mockRedis.restore();

    admin = await createTestUser({
      name: "Cache Admin",
      email: "cache-admin@campus.edu",
      role: "admin",
    });

    studentA = await createTestUser({
      name: "Cache Alice",
      email: "alice-cache@campus.edu",
      role: "student",
      hostel: "H1",
      room: "101",
    });

    studentB = await createTestUser({
      name: "Cache Bob",
      email: "bob-cache@campus.edu",
      role: "student",
      hostel: "H2",
      room: "202",
    });
  });

  it("should handle cache miss on first analytics request and populate cache", async () => {
    await createTestComplaint(studentA.user, { title: "C1", category: "Water" });

    mockRedis.resetStats();
    const res = await apiRequest("/api/complaints/analytics", {
      token: admin.token,
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.total, 1);

    // Verify cache miss triggered a get and a set
    assert.ok(mockRedis.operations.get > 0, "Should attempt to get from cache");
    assert.ok(mockRedis.operations.set > 0, "Should write response to cache");

    // Verify key exists in store
    const keys = Array.from(mockRedis.store.keys());
    const analyticsKey = keys.find((k) => k.startsWith("campusone:complaints:analytics:"));
    assert.ok(analyticsKey, "Analytics cache key must exist in Redis store");
  });

  it("should serve subsequent analytics requests from cache (cache hit)", async () => {
    await createTestComplaint(studentA.user, { title: "C1", category: "Water" });

    // 1st request -> populates cache with total: 1
    const res1 = await apiRequest("/api/complaints/analytics", {
      token: admin.token,
    });
    assert.equal(res1.body.data.total, 1);

    // Insert another complaint directly into MongoDB (bypassing API so cache is NOT invalidated)
    await Complaint.create({
      title: "Stealth Complaint",
      description: "Direct DB insertion that bypasses API invalidation",
      category: "Electricity",
      student: studentA.user._id,
      studentName: studentA.user.name,
      studentEmail: studentA.user.email,
      hostel: "H1",
      roomNumber: "101",
    });

    // 2nd request -> should HIT cache and still return total: 1 (proving it did not hit MongoDB)
    mockRedis.resetStats();
    const res2 = await apiRequest("/api/complaints/analytics", {
      token: admin.token,
    });

    assert.equal(res2.status, 200);
    assert.equal(res2.body.data.total, 1, "Cache hit must return cached analytics count");
    assert.ok(mockRedis.operations.get > 0, "Should read from cache");
    assert.equal(mockRedis.operations.set, 0, "Should not rewrite to cache on cache hit");
  });

  it("should invalidate analytics and list cache when a new complaint is created", async () => {
    await createTestComplaint(studentA.user, { title: "Initial Issue", category: "Water" });

    // Populate analytics cache
    const initialAnalytics = await apiRequest("/api/complaints/analytics", {
      token: admin.token,
    });
    assert.equal(initialAnalytics.body.data.total, 1);

    // Populate list cache for studentA
    const initialList = await apiRequest("/api/complaints", {
      token: studentA.token,
    });
    assert.equal(initialList.body.data.length, 1);

    // Student creates a new complaint via API mutation
    const createRes = await apiRequest("/api/complaints", {
      method: "POST",
      token: studentA.token,
      body: {
        title: "New Leaking Sink",
        description: "The sink in the bathroom is leaking continuously.",
        category: "Water",
      },
    });
    assert.equal(createRes.status, 201);

    // Verify analytics cache was invalidated and now returns fresh total = 2
    const freshAnalytics = await apiRequest("/api/complaints/analytics", {
      token: admin.token,
    });
    assert.equal(freshAnalytics.body.data.total, 2, "Analytics should reflect new complaint count");

    // Verify list cache was invalidated and now returns 2 complaints
    const freshList = await apiRequest("/api/complaints", {
      token: studentA.token,
    });
    assert.equal(freshList.body.data.length, 2, "List should reflect new complaint");
  });

  it("should invalidate cache when admin updates status, priority, or resolution", async () => {
    const complaint = await createTestComplaint(studentA.user, {
      title: "Broken Window",
      status: "Pending",
      priority: "Low",
    });

    // Cache detail and analytics
    const detailBefore = await apiRequest(`/api/complaints/${complaint._id}`, {
      token: admin.token,
    });
    assert.equal(detailBefore.body.data.status, "Pending");

    const analyticsBefore = await apiRequest("/api/complaints/analytics", {
      token: admin.token,
    });
    assert.equal(analyticsBefore.body.data.statusCounts.Pending, 1);
    assert.equal(analyticsBefore.body.data.statusCounts["In Progress"], 0);

    // Mutation 1: Update status to 'In Progress'
    await apiRequest(`/api/complaints/${complaint._id}/status`, {
      method: "PATCH",
      token: admin.token,
      body: { status: "In Progress", note: "Started inspection" },
    });

    // Fetch detail -> must return updated status 'In Progress'
    const detailAfterStatus = await apiRequest(`/api/complaints/${complaint._id}`, {
      token: admin.token,
    });
    assert.equal(detailAfterStatus.body.data.status, "In Progress");

    // Fetch analytics -> must reflect In Progress = 1
    const analyticsAfterStatus = await apiRequest("/api/complaints/analytics", {
      token: admin.token,
    });
    assert.equal(analyticsAfterStatus.body.data.statusCounts["In Progress"], 1);

    // Mutation 2: Update priority to 'High'
    await apiRequest(`/api/complaints/${complaint._id}/priority`, {
      method: "PATCH",
      token: admin.token,
      body: { priority: "High" },
    });

    const detailAfterPriority = await apiRequest(`/api/complaints/${complaint._id}`, {
      token: admin.token,
    });
    assert.equal(detailAfterPriority.body.data.priority, "High");

    // Mutation 3: Resolve complaint
    await apiRequest(`/api/complaints/${complaint._id}/resolution`, {
      method: "PATCH",
      token: admin.token,
      body: { resolution: "Window glass replaced" },
    });

    const detailAfterResolved = await apiRequest(`/api/complaints/${complaint._id}`, {
      token: admin.token,
    });
    assert.equal(detailAfterResolved.body.data.status, "Resolved");

    const analyticsAfterResolved = await apiRequest("/api/complaints/analytics", {
      token: admin.token,
    });
    assert.equal(analyticsAfterResolved.body.data.resolved, 1);
    assert.equal(analyticsAfterResolved.body.data.unresolved, 0);
  });

  it("should gracefully fall back to database when Redis is offline or throws", async () => {
    await createTestComplaint(studentA.user, { title: "C1", category: "Water" });

    // Simulate Redis sudden outage
    mockRedis.simulateFailure();

    // 1. Analytics should continue to work seamlessly
    const resAnalytics = await apiRequest("/api/complaints/analytics", {
      token: admin.token,
    });
    assert.equal(resAnalytics.status, 200);
    assert.equal(resAnalytics.body.success, true);
    assert.equal(resAnalytics.body.data.total, 1);

    // 2. Complaint listing should continue to work seamlessly
    const resList = await apiRequest("/api/complaints", {
      token: studentA.token,
    });
    assert.equal(resList.status, 200);
    assert.equal(resList.body.data.length, 1);

    // 3. Complaint creation should continue to work seamlessly
    const resCreate = await apiRequest("/api/complaints", {
      method: "POST",
      token: studentA.token,
      body: {
        title: "New issue while Redis is down",
        description: "This should create without any errors even when Redis is down.",
        category: "Electricity",
      },
    });
    assert.equal(resCreate.status, 201);
    assert.equal(resCreate.body.success, true);

    // 4. Complaint detail should continue to work seamlessly
    const resDetail = await apiRequest(`/api/complaints/${resCreate.body.data.id}`, {
      token: studentA.token,
    });
    assert.equal(resDetail.status, 200);
    assert.equal(resDetail.body.data.title, "New issue while Redis is down");

    // Restore Redis for subsequent tests
    mockRedis.restore();
  });

  it("should maintain full analytics response structure and correctness with caching", async () => {
    const baseDate = new Date("2026-08-01T10:00:00Z");
    const resolvedDate = new Date("2026-08-02T10:00:00Z");

    await createTestComplaint(studentA.user, {
      title: "Tap leak",
      category: "Water",
      status: "Resolved",
      priority: "High",
      createdAt: baseDate,
      updatedAt: resolvedDate,
      timeline: [
        { status: "Pending", note: "Created", timestamp: baseDate, actor: "Alice" },
        { status: "Resolved", note: "Fixed", timestamp: resolvedDate, actor: "Admin" },
      ],
    });

    // 1st fetch (miss)
    const missRes = await apiRequest("/api/complaints/analytics", { token: admin.token });
    assert.equal(missRes.status, 200);

    // 2nd fetch (hit)
    const hitRes = await apiRequest("/api/complaints/analytics", { token: admin.token });
    assert.equal(hitRes.status, 200);

    // Compare miss and hit payloads: must be structurally identical
    assert.deepEqual(hitRes.body.data, missRes.body.data);
    assert.equal(hitRes.body.data.total, 1);
    assert.equal(hitRes.body.data.resolved, 1);
    assert.equal(hitRes.body.data.avgResolutionDays, 1);
    assert.equal(hitRes.body.data.avgResolutionHours, 24);
  });

  it("should never leak cached student data to other students", async () => {
    await createTestComplaint(studentA.user, { title: "Alice Private Complaint" });
    await createTestComplaint(studentB.user, { title: "Bob Private Complaint" });

    // Alice fetches list (populates studentA cache)
    const aliceRes = await apiRequest("/api/complaints", { token: studentA.token });
    assert.equal(aliceRes.status, 200);
    assert.equal(aliceRes.body.data.length, 1);
    assert.equal(aliceRes.body.data[0].title, "Alice Private Complaint");

    // Bob fetches list (should NOT get Alice's cache)
    const bobRes = await apiRequest("/api/complaints", { token: studentB.token });
    assert.equal(bobRes.status, 200);
    assert.equal(bobRes.body.data.length, 1);
    assert.equal(bobRes.body.data[0].title, "Bob Private Complaint");

    // Alice fetches detail (populates detail cache)
    const aliceDetail = await apiRequest(`/api/complaints/${aliceRes.body.data[0].id}`, {
      token: studentA.token,
    });
    assert.equal(aliceDetail.status, 200);

    // Bob attempts to fetch Alice's cached complaint -> must get 403 Forbidden
    const bobAttempt = await apiRequest(`/api/complaints/${aliceRes.body.data[0].id}`, {
      token: studentB.token,
    });
    assert.equal(bobAttempt.status, 403);
    assert.equal(bobAttempt.body.message, "Forbidden");
  });

  it("should successfully verify Redis connection with PING check", async () => {
    const isHealthy = await verifyRedisConnection(mockRedis);
    assert.equal(isHealthy, true, "PING check should succeed when Redis client is ready");
  });

  it("should safely handle and log PING check failure when Redis is offline", async () => {
    mockRedis.simulateFailure();
    const isHealthy = await verifyRedisConnection(mockRedis);
    assert.equal(isHealthy, false, "PING check should fail gracefully when Redis is offline");
    mockRedis.restore();
  });
});
