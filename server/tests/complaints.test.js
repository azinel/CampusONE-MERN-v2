import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import {
  setupTestEnv,
  teardownTestEnv,
  clearDatabase,
  createTestUser,
  createTestComplaint,
  apiRequest,
} from "./helpers/setup.js";

describe("Complaints API", () => {
  let studentA, studentB, admin;

  before(async () => {
    await setupTestEnv();
  });

  after(async () => {
    await teardownTestEnv();
  });

  beforeEach(async () => {
    await clearDatabase();
    studentA = await createTestUser({
      name: "Student Alice",
      email: "alice@campus.edu",
      role: "student",
      hostel: "H1",
      room: "101",
    });
    studentB = await createTestUser({
      name: "Student Bob",
      email: "bob@campus.edu",
      role: "student",
      hostel: "H2",
      room: "202",
    });
    admin = await createTestUser({
      name: "Admin User",
      email: "admin@campus.edu",
      role: "admin",
    });
  });

  describe("Create Complaint", () => {
    it("should allow student to create a complaint", async () => {
      const res = await apiRequest("/api/complaints", {
        method: "POST",
        token: studentA.token,
        body: {
          title: "WiFi not working",
          description: "There is no internet connectivity in room 101 since morning.",
          category: "WiFi",
          priority: "High",
          hostel: "H1",
          roomNumber: "101",
        },
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.id);
      assert.equal(res.body.data.title, "WiFi not working");
      assert.equal(res.body.data.category, "WiFi");
      assert.equal(res.body.data.status, "Pending");
      assert.equal(res.body.data.priority, "High");
      assert.equal(res.body.data.studentId, studentA.user._id.toString());
    });

    it("should prevent admin from creating a complaint (student role only)", async () => {
      const res = await apiRequest("/api/complaints", {
        method: "POST",
        token: admin.token,
        body: {
          title: "Admin complaint test",
          description: "This should fail because admin is not a student.",
          category: "Other",
        },
      });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.message, "Forbidden");
    });
  });

  describe("Get Complaints and Role Boundary", () => {
    it("should return only own complaints for students", async () => {
      await createTestComplaint(studentA.user, { title: "Alice Complaint 1" });
      await createTestComplaint(studentA.user, { title: "Alice Complaint 2" });
      await createTestComplaint(studentB.user, { title: "Bob Complaint 1" });

      const res = await apiRequest("/api/complaints", {
        method: "GET",
        token: studentA.token,
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.length, 2);
      assert.equal(res.body.pagination.total, 2);
      for (const c of res.body.data) {
        assert.equal(c.studentId, studentA.user._id.toString());
      }
    });

    it("should return all complaints for admin", async () => {
      await createTestComplaint(studentA.user, { title: "Alice Complaint" });
      await createTestComplaint(studentB.user, { title: "Bob Complaint" });

      const res = await apiRequest("/api/complaints", {
        method: "GET",
        token: admin.token,
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.length, 2);
      assert.equal(res.body.pagination.total, 2);
    });
  });

  describe("Pagination", () => {
    it("should correctly paginate complaints", async () => {
      for (let i = 1; i <= 5; i++) {
        await createTestComplaint(studentA.user, { title: `Complaint ${i}` });
      }

      // Page 1, limit 2
      const page1 = await apiRequest("/api/complaints?page=1&limit=2", {
        method: "GET",
        token: studentA.token,
      });
      assert.equal(page1.status, 200);
      assert.equal(page1.body.data.length, 2);
      assert.equal(page1.body.pagination.page, 1);
      assert.equal(page1.body.pagination.limit, 2);
      assert.equal(page1.body.pagination.total, 5);
      assert.equal(page1.body.pagination.totalPages, 3);
      assert.equal(page1.body.pagination.hasNextPage, true);
      assert.equal(page1.body.pagination.hasPrevPage, false);

      // Page 2, limit 2
      const page2 = await apiRequest("/api/complaints?page=2&limit=2", {
        method: "GET",
        token: studentA.token,
      });
      assert.equal(page2.status, 200);
      assert.equal(page2.body.data.length, 2);
      assert.equal(page2.body.pagination.page, 2);
      assert.equal(page2.body.pagination.hasNextPage, true);
      assert.equal(page2.body.pagination.hasPrevPage, true);

      // Page 3, limit 2
      const page3 = await apiRequest("/api/complaints?page=3&limit=2", {
        method: "GET",
        token: studentA.token,
      });
      assert.equal(page3.status, 200);
      assert.equal(page3.body.data.length, 1);
      assert.equal(page3.body.pagination.page, 3);
      assert.equal(page3.body.pagination.hasNextPage, false);
      assert.equal(page3.body.pagination.hasPrevPage, true);
    });
  });

  describe("Filtering and Search", () => {
    it("should filter complaints by status, category, priority, and hostel", async () => {
      await createTestComplaint(studentA.user, {
        title: "Water Problem",
        category: "Water",
        status: "Pending",
        priority: "High",
        hostel: "H1",
      });
      await createTestComplaint(studentA.user, {
        title: "WiFi Issue",
        category: "WiFi",
        status: "Resolved",
        priority: "Low",
        hostel: "H1",
      });

      // Filter by category
      const resCat = await apiRequest("/api/complaints?category=Water", {
        token: studentA.token,
      });
      assert.equal(resCat.body.data.length, 1);
      assert.equal(resCat.body.data[0].category, "Water");

      // Filter by status
      const resStatus = await apiRequest("/api/complaints?status=Resolved", {
        token: studentA.token,
      });
      assert.equal(resStatus.body.data.length, 1);
      assert.equal(resStatus.body.data[0].status, "Resolved");

      // Filter by priority
      const resPriority = await apiRequest("/api/complaints?priority=High", {
        token: studentA.token,
      });
      assert.equal(resPriority.body.data.length, 1);
      assert.equal(resPriority.body.data[0].priority, "High");
    });

    it("should search complaints by title and description", async () => {
      await createTestComplaint(studentA.user, {
        title: "Broken Fan Regulator",
        description: "The ceiling fan knob is jammed and sparking.",
      });
      await createTestComplaint(studentA.user, {
        title: "No Water In Tap",
        description: "Bathroom tap has zero flow since 7am.",
      });

      const resTitle = await apiRequest("/api/complaints?search=regulator", {
        token: studentA.token,
      });
      assert.equal(resTitle.body.data.length, 1);
      assert.equal(resTitle.body.data[0].title, "Broken Fan Regulator");

      const resDesc = await apiRequest("/api/complaints?search=bathroom", {
        token: studentA.token,
      });
      assert.equal(resDesc.body.data.length, 1);
      assert.equal(resDesc.body.data[0].title, "No Water In Tap");

      const resNone = await apiRequest("/api/complaints?search=nonexistentterm", {
        token: studentA.token,
      });
      assert.equal(resNone.body.data.length, 0);
    });
  });

  describe("Sorting", () => {
    it("should sort complaints by createdAt asc and desc", async () => {
      const now = Date.now();
      await createTestComplaint(studentA.user, {
        title: "First Complaint",
        createdAt: new Date(now - 20000),
      });
      await createTestComplaint(studentA.user, {
        title: "Second Complaint",
        createdAt: new Date(now - 10000),
      });
      await createTestComplaint(studentA.user, {
        title: "Third Complaint",
        createdAt: new Date(now),
      });

      const ascRes = await apiRequest("/api/complaints?sortBy=createdAt&sortOrder=asc", {
        token: studentA.token,
      });
      assert.equal(ascRes.body.data[0].title, "First Complaint");
      assert.equal(ascRes.body.data[2].title, "Third Complaint");

      const descRes = await apiRequest("/api/complaints?sortBy=createdAt&sortOrder=desc", {
        token: studentA.token,
      });
      assert.equal(descRes.body.data[0].title, "Third Complaint");
      assert.equal(descRes.body.data[2].title, "First Complaint");
    });
  });

  describe("Get Complaint by ID", () => {
    it("should allow student to fetch own complaint by ID", async () => {
      const complaint = await createTestComplaint(studentA.user, { title: "Alice's Issue" });

      const res = await apiRequest(`/api/complaints/${complaint._id}`, {
        token: studentA.token,
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.data.id, complaint._id.toString());
      assert.equal(res.body.data.title, "Alice's Issue");
    });

    it("should prevent student from fetching another student's complaint (403)", async () => {
      const complaintA = await createTestComplaint(studentA.user, { title: "Alice's Secret Issue" });

      const res = await apiRequest(`/api/complaints/${complaintA._id}`, {
        token: studentB.token,
      });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.message, "Forbidden");
    });

    it("should allow admin to fetch any student's complaint by ID", async () => {
      const complaintA = await createTestComplaint(studentA.user, { title: "Alice's Issue" });

      const res = await apiRequest(`/api/complaints/${complaintA._id}`, {
        token: admin.token,
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.data.id, complaintA._id.toString());
    });

    it("should return 404 for non-existent valid ObjectId", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const res = await apiRequest(`/api/complaints/${nonExistentId}`, {
        token: admin.token,
      });

      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
      assert.equal(res.body.message, "Complaint not found");
    });
  });

  describe("Update Complaint (Status, Priority, Resolution)", () => {
    it("should allow admin to update status, priority, and resolution", async () => {
      const complaint = await createTestComplaint(studentA.user, {
        title: "Pipe Burst",
        status: "Pending",
        priority: "Medium",
      });

      // Update status
      const statusRes = await apiRequest(`/api/complaints/${complaint._id}/status`, {
        method: "PATCH",
        token: admin.token,
        body: { status: "In Progress", note: "Plumber dispatched" },
      });
      assert.equal(statusRes.status, 200);
      assert.equal(statusRes.body.data.status, "In Progress");

      // Update priority
      const priorityRes = await apiRequest(`/api/complaints/${complaint._id}/priority`, {
        method: "PATCH",
        token: admin.token,
        body: { priority: "High" },
      });
      assert.equal(priorityRes.status, 200);
      assert.equal(priorityRes.body.data.priority, "High");

      // Update resolution
      const resRes = await apiRequest(`/api/complaints/${complaint._id}/resolution`, {
        method: "PATCH",
        token: admin.token,
        body: { resolution: "Replaced broken pipe and valve" },
      });
      assert.equal(resRes.status, 200);
      assert.equal(resRes.body.data.status, "Resolved");
      assert.equal(resRes.body.data.resolution, "Replaced broken pipe and valve");
    });

    it("should reject student attempting to update complaint status, priority, or resolution", async () => {
      const complaint = await createTestComplaint(studentA.user, { title: "Student Issue" });

      const statusRes = await apiRequest(`/api/complaints/${complaint._id}/status`, {
        method: "PATCH",
        token: studentA.token,
        body: { status: "Resolved" },
      });
      assert.equal(statusRes.status, 403);

      const priorityRes = await apiRequest(`/api/complaints/${complaint._id}/priority`, {
        method: "PATCH",
        token: studentA.token,
        body: { priority: "High" },
      });
      assert.equal(priorityRes.status, 403);

      const resolutionRes = await apiRequest(`/api/complaints/${complaint._id}/resolution`, {
        method: "PATCH",
        token: studentA.token,
        body: { resolution: "Resolved by student" },
      });
      assert.equal(resolutionRes.status, 403);
    });
  });

  describe("Validation and Invalid Inputs", () => {
    it("should reject invalid ObjectId in params", async () => {
      const res = await apiRequest("/api/complaints/not-a-valid-object-id", {
        token: admin.token,
      });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes("must be a valid ObjectId"));
    });

    it("should reject invalid query parameters", async () => {
      const resPage = await apiRequest("/api/complaints?page=0", { token: studentA.token });
      assert.equal(resPage.status, 400);

      const resLimit = await apiRequest("/api/complaints?limit=999", { token: studentA.token });
      assert.equal(resLimit.status, 400);

      const resStatus = await apiRequest("/api/complaints?status=FakeStatus", { token: studentA.token });
      assert.equal(resStatus.status, 400);

      const resCategory = await apiRequest("/api/complaints?category=FakeCategory", { token: studentA.token });
      assert.equal(resCategory.status, 400);

      const resPriority = await apiRequest("/api/complaints?priority=FakePriority", { token: studentA.token });
      assert.equal(resPriority.status, 400);

      const resSortBy = await apiRequest("/api/complaints?sortBy=unknownField", { token: studentA.token });
      assert.equal(resSortBy.status, 400);

      const resSortOrder = await apiRequest("/api/complaints?sortOrder=invalidOrder", { token: studentA.token });
      assert.equal(resSortOrder.status, 400);
    });
  });
});
