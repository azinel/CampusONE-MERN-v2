import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app.js";
import { getRedisClient, closeRedisConnection } from "./config/redis.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempUploadDir = path.join(__dirname, "../public/temp");

if (!fs.existsSync(tempUploadDir)) {
  fs.mkdirSync(tempUploadDir, { recursive: true });
}

const requiredEnv = ["ACCESS_TOKEN_SECRET", "REFRESH_TOKEN_SECRET"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const port = process.env.PORT || 5001;

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/campusone")
  .then(() => {
    console.log("MongoDB connected");

    // Initialize Redis in background without blocking API startup
    getRedisClient();

    const server = app.listen(port, () => {
      console.log(`CampusONE API listening on http://localhost:${port}`);
    });

    const shutdown = async (signal) => {
      console.log(`Received ${signal}. Shutting down API server gracefully...`);
      server.close(async () => {
        await closeRedisConnection();
        await mongoose.disconnect();
        console.log("API server stopped cleanly.");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  })
  .catch((error) => {
    console.error("Mongo connection error", error);
    process.exit(1);
  });
