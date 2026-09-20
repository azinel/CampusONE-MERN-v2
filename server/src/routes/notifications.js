import express from "express";
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
} from "../controllers/notification.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { NOTIFICATION_TYPES } from "../models/Notification.js";

const router = express.Router();

router.use(verifyJWT);

router.get("/", listNotifications);

router.patch("/read-all", markAllAsRead);

router.patch("/:id/read", markAsRead);

router.post(
  "/",
  authorizeRoles("admin"),
  validateBody({
    title: { required: true, minLength: 1 },
    message: { required: true, minLength: 1 },
    type: { required: false, enum: NOTIFICATION_TYPES },
    link: { required: false },
    recipientId: { required: false },
    userId: { required: false },
    role: { required: false },
  }),
  createNotification
);

export default router;
