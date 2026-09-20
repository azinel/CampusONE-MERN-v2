import express from "express";
import {
  createComplaint,
  listComplaints,
  getComplaintById,
  updateComplaintStatus,
  updateComplaintPriority,
  updateComplaintResolution,
} from "../controllers/complaint.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { COMPLAINT_CATEGORIES } from "../constants/index.js";

const router = express.Router();

router.use(verifyJWT);

router.post(
  "/",
  authorizeRoles("student"),
  upload.array("images", 5),
  validateBody({
    title: { required: true, minLength: 3 },
    description: { required: true, minLength: 10 },
    category: { required: true, enum: COMPLAINT_CATEGORIES },
    priority: { required: false },
    hostel: { required: false },
    roomNumber: { required: false },
  }),
  createComplaint
);

router.get("/", listComplaints);
router.get("/:id", getComplaintById);

router.patch(
  "/:id/status",
  authorizeRoles("admin"),
  validateBody({
    status: { required: true },
    note: { required: false },
  }),
  updateComplaintStatus
);

router.patch(
  "/:id/priority",
  authorizeRoles("admin"),
  validateBody({
    priority: { required: true },
  }),
  updateComplaintPriority
);

router.patch(
  "/:id/resolution",
  authorizeRoles("admin"),
  validateBody({
    resolution: { required: true, minLength: 3 },
  }),
  updateComplaintResolution
);

export default router;
