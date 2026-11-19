import dotenv from "dotenv";
import mongoose from "mongoose";
import {
  startNotificationWorker,
  stopNotificationWorker,
} from "./workers/notification.worker.js";

dotenv.config();

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/campusone";

async function main() {
  console.log("Starting CampusONE Notification Worker process...");

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB for background worker");

  const worker = startNotificationWorker();
  if (worker) {
    console.log("Notification worker is actively listening for jobs");
  } else {
    console.warn("Notification worker could not start. Check Redis configuration.");
  }

  const shutdown = async (signal) => {
    console.log(`Received ${signal}. Shutting down worker gracefully...`);
    await stopNotificationWorker();
    await mongoose.disconnect();
    console.log("Worker process stopped cleanly.");
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("Worker process failed:", err);
  process.exit(1);
});
