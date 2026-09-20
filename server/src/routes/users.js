import express from "express";
import {
  listUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
} from "../controllers/user.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { USER_ROLES } from "../constants/index.js";

const router = express.Router();

router.use(verifyJWT);
router.use(authorizeRoles("admin"));

router.get("/", listUsers);
router.get("/:id", getUserById);

router.patch(
  "/:id/role",
  validateBody({
    role: { required: true, enum: USER_ROLES },
  }),
  updateUserRole
);

router.patch(
  "/:id/status",
  validateBody({
    isActive: { required: true },
  }),
  updateUserStatus
);

export default router;
