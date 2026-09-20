import express from "express";
import {
  getCampusInfo,
  getRecentActivity,
  getStudentDashboard,
  getAdminDashboard,
  getAnalytics,
} from "../controllers/dashboard.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT);

router.get("/campus-info", getCampusInfo);
router.get("/activity", getRecentActivity);
router.get("/student", authorizeRoles("student"), getStudentDashboard);
router.get("/admin", authorizeRoles("admin"), getAdminDashboard);
router.get("/analytics", authorizeRoles("admin"), getAnalytics);

export default router;
