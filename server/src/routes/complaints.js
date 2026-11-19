import express from "express";
import {
  createComplaint,
  listComplaints,
  getComplaintById,
  updateComplaintStatus,
  updateComplaintPriority,
  updateComplaintResolution,
  getComplaintAnalytics,
} from "../controllers/complaint.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  validateBody,
  validateObjectId,
  validateComplaintQuery,
  validateComplaintAnalyticsQuery,
} from "../middlewares/validate.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_PRIORITIES,
  COMPLAINT_STATUSES,
} from "../constants/index.js";

const router = express.Router();

router.use(verifyJWT);

router.post(
  "/",
  authorizeRoles("student"),
  upload.array("images", 5),
  validateBody({
    title: { required: true, minLength: 3, maxLength: 200 },
    description: { required: true, minLength: 10, maxLength: 5000 },
    category: { required: true, enum: COMPLAINT_CATEGORIES },
    priority: { required: false, enum: COMPLAINT_PRIORITIES },
    hostel: { required: false, maxLength: 100 },
    roomNumber: { required: false, maxLength: 50 },
  }),
  createComplaint
);

router.get(
  "/analytics",
  authorizeRoles("admin"),
  validateComplaintAnalyticsQuery,
  getComplaintAnalytics
);
router.get(
  "/admin/analytics",
  authorizeRoles("admin"),
  validateComplaintAnalyticsQuery,
  getComplaintAnalytics
);

router.get("/", validateComplaintQuery, listComplaints);
router.get("/:id", validateObjectId("id"), getComplaintById);

router.patch(
  "/:id/status",
  authorizeRoles("admin"),
  validateObjectId("id"),
  validateBody({
    status: { required: true, enum: COMPLAINT_STATUSES },
    note: { required: false, maxLength: 1000 },
  }),
  updateComplaintStatus
);

router.patch(
  "/:id/priority",
  authorizeRoles("admin"),
  validateObjectId("id"),
  validateBody({
    priority: { required: true, enum: COMPLAINT_PRIORITIES },
  }),
  updateComplaintPriority
);

router.patch(
  "/:id/resolution",
  authorizeRoles("admin"),
  validateObjectId("id"),
  validateBody({
    resolution: { required: true, minLength: 3, maxLength: 2000 },
  }),
  updateComplaintResolution
);

export default router;

