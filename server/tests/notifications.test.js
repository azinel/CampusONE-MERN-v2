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
import { MockQueue } from "./helpers/mockQueue.js";
import {
  setNotificationQueue,
  closeNotificationQueue,
} from "../src/queues/notification.queue.js";
import {
  processNotificationJob,
  createNotificationIfNotExists,
} from "../src/workers/notification.worker.js";
import { DEFAULT_JOB_OPTIONS } from "../src/config/queue.js";
import Notification from "../src/models/Notification.js";
import Complaint from "../src/models/Complaint.js";

describe("Asynchronous Notification Processing", () => {
  let admin, student, mockQueue;

  before(async () => {
    await setupTestEnv();
    mockQueue = new MockQueue();
    setNotificationQueue(mockQueue);
  });

  after(async () => {
    await closeNotificationQueue();
    await teardownTestEnv();
  });

  beforeEach(async () => {
    await clearDatabase();
    mockQueue.clear();
    mockQueue.restore();

    admin = await createTestUser({
      name: "Queue Admin",
      email: "queue-admin@campus.edu",
      role: "admin",
    });

    student = await createTestUser({
      name: "Queue Student",
      email: "queue-student@campus.edu",
      role: "student",
      hostel: "Hostel-A",
      room: "101",
    });
  });

  it("should enqueue complaint.created job after complaint creation", async () => {
    const payload = {
      title: "Broken window latch",
      description: "Window latch broke during the storm and will not close securely.",
      category: "Other",
      priority: "Medium",
    };

    const res = await apiRequest("/api/complaints", {
      method: "POST",
      body: payload,
      token: student.token,
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);

    // Allow async microtask/queue dispatch to settle
    await new Promise((resolve) => setTimeout(resolve, 50));

    const jobs = mockQueue.getJobs();
    assert.equal(jobs.length, 1);

    const job = jobs[0];
    assert.equal(job.name, "complaint.created");
    assert.equal(job.data.title, payload.title);
    assert.equal(job.data.category, payload.category);
    assert.equal(job.data.priority, payload.priority);
    assert.equal(job.data.studentId, student.user._id.toString());
    assert.ok(job.data.complaintId);
    assert.equal(job.opts.attempts, 3);
  });

  it("should enqueue complaint.status_updated job after status change", async () => {
    const complaint = await createTestComplaint(student.user, {
      title: "Water leaking in bathroom",
      category: "Water",
    });

    const res = await apiRequest(`/api/complaints/${complaint._id}/status`, {
      method: "PATCH",
      body: { status: "In Progress", note: "Plumber assigned to inspect" },
      token: admin.token,
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    await new Promise((resolve) => setTimeout(resolve, 50));

    const jobs = mockQueue.getJobs();
    assert.equal(jobs.length, 1);

    const job = jobs[0];
    assert.equal(job.name, "complaint.status_updated");
    assert.equal(job.data.complaintId, complaint._id.toString());
    assert.equal(job.data.status, "In Progress");
    assert.equal(job.data.note, "Plumber assigned to inspect");
    assert.equal(job.data.studentId, student.user._id.toString());
  });

  it("should enqueue complaint.priority_updated job after priority change", async () => {
    const complaint = await createTestComplaint(student.user, {
      title: "Electrical spark in corridor",
      category: "Electricity",
      priority: "Medium",
    });

    const res = await apiRequest(`/api/complaints/${complaint._id}/priority`, {
      method: "PATCH",
      body: { priority: "High" },
      token: admin.token,
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    await new Promise((resolve) => setTimeout(resolve, 50));

    const jobs = mockQueue.getJobs();
    assert.equal(jobs.length, 1);

    const job = jobs[0];
    assert.equal(job.name, "complaint.priority_updated");
    assert.equal(job.data.complaintId, complaint._id.toString());
    assert.equal(job.data.priority, "High");
    assert.equal(job.data.studentId, student.user._id.toString());
  });

  it("should enqueue complaint.resolution_updated job after complaint resolution", async () => {
    const complaint = await createTestComplaint(student.user, {
      title: "Fan regulator broken",
      category: "Electricity",
    });

    const res = await apiRequest(`/api/complaints/${complaint._id}/resolution`, {
      method: "PATCH",
      body: { resolution: "Replaced fan regulator and verified operation" },
      token: admin.token,
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    await new Promise((resolve) => setTimeout(resolve, 50));

    const jobs = mockQueue.getJobs();
    assert.equal(jobs.length, 1);

    const job = jobs[0];
    assert.equal(job.name, "complaint.resolution_updated");
    assert.equal(job.data.complaintId, complaint._id.toString());
    assert.equal(job.data.resolution, "Replaced fan regulator and verified operation");
    assert.equal(job.data.studentId, student.user._id.toString());
  });

  it("API response does not depend on queue processing latency", async () => {
    mockQueue.setDelay(100);

    const startTime = Date.now();
    const res = await apiRequest("/api/complaints", {
      method: "POST",
      body: {
        title: "Slow queue test complaint",
        description: "Checking that HTTP response returns promptly regardless of queue delay.",
        category: "Other",
        priority: "Low",
      },
      token: student.token,
    });
    const duration = Date.now() - startTime;

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    // Request returns immediately without blocking on queue completion
    assert.ok(duration < 300, `Expected quick response, took ${duration}ms`);
  });

  it("API requests succeed even if Redis/Queue is unavailable (fail-open)", async () => {
    mockQueue.simulateFailure();

    // 1. Complaint creation fails open
    const createRes = await apiRequest("/api/complaints", {
      method: "POST",
      body: {
        title: "Redis offline test complaint",
        description: "Queue is simulated as offline, but complaint should be saved safely.",
        category: "Cleaning",
        priority: "Medium",
      },
      token: student.token,
    });

    assert.equal(createRes.status, 201);
    assert.equal(createRes.body.success, true);
    assert.ok(createRes.body.data.id);

    // Complaint exists in MongoDB
    const complaintDoc = await Complaint.findById(createRes.body.data.id);
    assert.ok(complaintDoc);
    assert.equal(complaintDoc.title, "Redis offline test complaint");

    // 2. Complaint update fails open
    const updateRes = await apiRequest(
      `/api/complaints/${createRes.body.data.id}/status`,
      {
        method: "PATCH",
        body: { status: "Resolved", note: "Fixed while queue offline" },
        token: admin.token,
      }
    );

    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.body.success, true);
    assert.equal(updateRes.body.data.status, "Resolved");
  });

  it("worker successfully processes complaint.created job and creates in-app notification for student", async () => {
    const complaint = await createTestComplaint(student.user, {
      title: "Broken chair in study room",
      category: "Other",
      priority: "Low",
    });

    const job = {
      name: "complaint.created",
      data: {
        complaintId: complaint._id.toString(),
        title: complaint.title,
        category: complaint.category,
        priority: complaint.priority,
        studentId: student.user._id.toString(),
      },
    };

    const result = await processNotificationJob(job);
    assert.equal(result.processed, true);
    assert.equal(result.notificationsCreated, 1);

    const notif = await Notification.findOne({
      recipient: student.user._id,
      title: "Complaint submitted",
    });

    assert.ok(notif);
    assert.equal(notif.type, "complaint");
    assert.match(notif.message, /Broken chair in study room/);
    assert.equal(notif.link, `/student/complaints/${complaint._id}`);
    assert.equal(notif.read, false);
  });

  it("worker creates notifications for student and all admins for high priority complaints", async () => {
    const admin2 = await createTestUser({
      name: "Second Admin",
      email: "second-admin@campus.edu",
      role: "admin",
    });

    const complaint = await createTestComplaint(student.user, {
      title: "Severe water pipe burst",
      category: "Water",
      priority: "High",
      hostel: "Hostel-A",
    });

    const job = {
      name: "complaint.created",
      data: {
        complaintId: complaint._id.toString(),
        title: complaint.title,
        category: complaint.category,
        priority: "High",
        hostel: "Hostel-A",
        studentId: student.user._id.toString(),
      },
    };

    const result = await processNotificationJob(job);
    assert.equal(result.processed, true);
    // 1 for student + 2 for admins = 3 notifications
    assert.equal(result.notificationsCreated, 3);

    const studentNotif = await Notification.findOne({
      recipient: student.user._id,
      title: "Complaint submitted",
    });
    assert.ok(studentNotif);

    const admin1Notif = await Notification.findOne({
      recipient: admin.user._id,
      title: "High priority complaint",
    });
    assert.ok(admin1Notif);
    assert.match(admin1Notif.message, /Severe water pipe burst/);

    const admin2Notif = await Notification.findOne({
      recipient: admin2.user._id,
      title: "High priority complaint",
    });
    assert.ok(admin2Notif);
  });

  it("worker successfully processes status and resolution update jobs", async () => {
    const complaint = await createTestComplaint(student.user, {
      title: "Internet port broken",
      category: "WiFi",
    });

    // Process status update job
    await processNotificationJob({
      name: "complaint.status_updated",
      data: {
        complaintId: complaint._id.toString(),
        title: complaint.title,
        status: "In Progress",
        note: "Technician dispatched",
        studentId: student.user._id.toString(),
      },
    });

    const statusNotif = await Notification.findOne({
      recipient: student.user._id,
      title: "Complaint status updated",
    });
    assert.ok(statusNotif);
    assert.match(statusNotif.message, /Technician dispatched/);

    // Process resolution job
    await processNotificationJob({
      name: "complaint.resolution_updated",
      data: {
        complaintId: complaint._id.toString(),
        title: complaint.title,
        resolution: "Port re-soldered and connectivity restored",
        studentId: student.user._id.toString(),
      },
    });

    const resNotif = await Notification.findOne({
      recipient: student.user._id,
      title: "Complaint resolved",
    });
    assert.ok(resNotif);
    assert.match(resNotif.message, /Port re-soldered/);
  });

  it("idempotency prevents duplicate notifications when jobs are retried or duplicated", async () => {
    const complaint = await createTestComplaint(student.user, {
      title: "Clogged sink drain",
      category: "Water",
    });

    const job = {
      name: "complaint.status_updated",
      data: {
        complaintId: complaint._id.toString(),
        title: complaint.title,
        status: "In Progress",
        note: "Plumber on way",
        studentId: student.user._id.toString(),
      },
    };

    // First execution
    const res1 = await processNotificationJob(job);
    assert.equal(res1.notificationsCreated, 1);

    const countAfterFirst = await Notification.countDocuments({
      recipient: student.user._id,
      title: "Complaint status updated",
    });
    assert.equal(countAfterFirst, 1);

    // Retry / Second execution with identical payload
    const res2 = await processNotificationJob(job);
    assert.equal(res2.notificationsCreated, 0); // Detected duplicate, skipped insertion

    const countAfterSecond = await Notification.countDocuments({
      recipient: student.user._id,
      title: "Complaint status updated",
    });
    assert.equal(countAfterSecond, 1); // Still exactly 1 notification
  });

  it("idempotency helper createNotificationIfNotExists returns existing doc without duplicating", async () => {
    const payload = {
      recipient: student.user._id,
      title: "Test title",
      message: "Test message body",
      type: "complaint",
      link: "/test/link",
    };

    const first = await createNotificationIfNotExists(payload);
    assert.equal(first.created, true);
    assert.ok(first.notification._id);

    const second = await createNotificationIfNotExists(payload);
    assert.equal(second.created, false);
    assert.equal(second.notification._id.toString(), first.notification._id.toString());

    const total = await Notification.countDocuments({ recipient: student.user._id });
    assert.equal(total, 1);
  });

  it("validates retry configuration with 3 attempts and exponential backoff", () => {
    assert.equal(DEFAULT_JOB_OPTIONS.attempts, 3);
    assert.equal(DEFAULT_JOB_OPTIONS.backoff.type, "exponential");
    assert.equal(DEFAULT_JOB_OPTIONS.backoff.delay, 1000);
  });

  it("worker safely handles and rejects malformed jobs for retry without unhandled crash", async () => {
    // Missing complaintId
    await assert.rejects(
      async () => {
        await processNotificationJob({
          name: "complaint.created",
          data: {},
        });
      },
      {
        message: "Job missing required complaintId",
      }
    );

    // Unknown event type does not throw or crash, completes safely
    const unknownRes = await processNotificationJob({
      name: "unknown.event_type",
      data: { complaintId: new mongoose.Types.ObjectId().toString() },
    });
    assert.equal(unknownRes.processed, true);
    assert.equal(unknownRes.notificationsCreated, 0);
  });
});
