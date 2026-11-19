import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
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

const app = express();

const clientOrigins = process.env.CLIENT_URL || process.env.CORS_ORIGIN;
const allowedOrigins = clientOrigins
  ? clientOrigins.split(",").map((o) => o.trim())
  : true;

app.use(cors({ origin: allowedOrigins, credentials: true }));
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

export default app;
