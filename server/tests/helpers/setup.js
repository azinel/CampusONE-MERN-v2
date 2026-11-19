import http from "node:http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "../../src/app.js";
import User from "../../src/models/User.js";
import Complaint from "../../src/models/Complaint.js";
import { closeRedisConnection } from "../../src/config/redis.js";
import {
  setNotificationQueue,
  closeNotificationQueue,
} from "../../src/queues/notification.queue.js";
import { MockQueue } from "./mockQueue.js";

dotenv.config();
process.env.NODE_ENV = "test";

process.env.ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "test_access_secret_campusone_123456";
process.env.REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "test_refresh_secret_campusone_123456";

const TEST_MONGO_URI =
  process.env.TEST_MONGO_URI || "mongodb://127.0.0.1:27017/campusone_test";

let server = null;
let baseUrl = "";

export async function setupTestEnv() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_MONGO_URI);
  }

  setNotificationQueue(new MockQueue());

  if (!server) {
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, "127.0.0.1", () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  }

  return { baseUrl };
}

export async function teardownTestEnv() {
  await closeNotificationQueue();
  await closeRedisConnection();
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    server = null;
  }
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.connection.db.dropDatabase();
    } catch {
      // ignore
    }
    await mongoose.disconnect();
  }
}

export async function clearDatabase() {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
}

export async function createTestUser({
  name = "Test Student",
  email = "student@test.edu",
  password = "password123",
  role = "student",
  hostel = "H1",
  room = "101",
} = {}) {
  const user = new User({
    name,
    email: email.toLowerCase(),
    role,
    hostel,
    room,
  });
  await user.setPassword(password);
  await user.save();
  const token = user.generateAccessToken();
  return { user, token };
}

export async function createTestComplaint(user, data = {}) {
  const status = data.status || "Pending";
  const priority = data.priority || "Medium";
  const category = data.category || "Water";
  const createdAt = data.createdAt || new Date();
  const updatedAt = data.updatedAt || createdAt;

  const defaultTimeline = [
    {
      status,
      note: "Complaint submitted",
      timestamp: createdAt,
      actor: user.name,
    },
  ];

  if (status === "Resolved" && !data.timeline) {
    defaultTimeline.push({
      status: "Resolved",
      note: "Issue has been resolved",
      timestamp: updatedAt,
      actor: "Admin",
    });
  }

  return await Complaint.create({
    title: data.title || "Leaking tap in bathroom",
    description:
      data.description ||
      "The bathroom tap has been leaking water constantly for two days.",
    category,
    status,
    priority,
    student: user._id,
    studentName: user.name,
    studentEmail: user.email,
    hostel: data.hostel || user.hostel || "H1",
    roomNumber: data.roomNumber || user.room || "101",
    images: data.images || [],
    assignedTo: data.assignedTo || null,
    resolution: data.resolution || (status === "Resolved" ? "Fixed" : null),
    timeline: data.timeline || defaultTimeline,
    createdAt,
    updatedAt,
  });
}

export async function apiRequest(
  path,
  { method = "GET", headers = {}, body = null, token = null } = {}
) {
  const reqHeaders = { ...headers };
  if (token) {
    reqHeaders["Authorization"] = `Bearer ${token}`;
  }

  let reqBody = null;
  if (body !== null && body !== undefined) {
    if (typeof body === "object") {
      reqHeaders["Content-Type"] = "application/json";
      reqBody = JSON.stringify(body);
    } else {
      reqBody = String(body);
    }
  }

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: reqHeaders,
    body: reqBody,
  });

  let responseData;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    responseData = await res.json();
  } else {
    responseData = await res.text();
  }

  return {
    status: res.status,
    headers: res.headers,
    body: responseData,
  };
}
