import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import postRoutes from "./routes/posts.js";
import eventRoutes from "./routes/events.js";
import notificationRoutes from "./routes/notifications.js";
import dashboardRoutes from "./routes/dashboard.js";
import commentRoutes from "./routes/comments.js";
import authRoutes from "./routes/auth.js";
import complaintRoutes from "./routes/complaints.js";
import messRoutes from "./routes/mess.js";
import userRoutes from "./routes/users.js";
import { errorHandler } from "./middlewares/error.middleware.js";

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

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "campusone-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/mess", messRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/comments", commentRoutes);

app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/campusone")
  .then(() => {
    console.log("MongoDB connected");

    app.listen(port, () => {
      console.log(`CampusONE API listening on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Mongo connection error", error);
    process.exit(1);
  });
