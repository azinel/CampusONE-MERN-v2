import express from "express";
import {
  getTodayMenu,
  upsertMeal,
  listFeedback,
  submitFeedback,
  getAnalytics,
} from "../controllers/mess.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { MEAL_TYPES } from "../constants/index.js";

const router = express.Router();

router.use(verifyJWT);

router.get("/menu", getTodayMenu);

router.post(
  "/meals",
  authorizeRoles("admin"),
  validateBody({
    mealType: { required: true, enum: MEAL_TYPES },
    date: { required: false },
    time: { required: false },
  }),
  upsertMeal
);

router.get("/feedback", listFeedback);

router.post(
  "/feedback",
  authorizeRoles("student"),
  validateBody({
    mealType: { required: true, enum: MEAL_TYPES },
    taste: { required: true },
    hygiene: { required: true },
    quantity: { required: true },
    comment: { required: false },
    date: { required: false },
  }),
  submitFeedback
);

router.get("/analytics", authorizeRoles("admin"), getAnalytics);

export default router;
