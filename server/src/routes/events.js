import express from "express";
import {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
} from "../controllers/event.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { EVENT_CATEGORIES } from "../constants/index.js";

const router = express.Router();

router.use(verifyJWT);

router.get("/", listEvents);
router.get("/:id", getEventById);

router.post(
  "/",
  authorizeRoles("admin"),
  upload.single("image"),
  validateBody({
    title: { required: true, minLength: 3 },
    description: { required: true, minLength: 10 },
    category: { required: true, enum: EVENT_CATEGORIES },
    organizer: { required: true },
  }),
  createEvent
);

router.patch(
  "/:id",
  authorizeRoles("admin"),
  upload.single("image"),
  updateEvent
);

router.put(
  "/:id",
  authorizeRoles("admin"),
  upload.single("image"),
  updateEvent
);

router.delete("/:id", authorizeRoles("admin"), deleteEvent);

router.post(
  "/:id/register",
  authorizeRoles("student"),
  registerForEvent
);

export default router;
