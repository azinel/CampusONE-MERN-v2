import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  refreshAccessToken,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";

const router = express.Router();

router.post(
  "/register",
  validateBody({
    name: { required: true, minLength: 2 },
    email: { required: true, type: "email" },
    password: { required: true, minLength: 6 },
    hostel: { required: false },
    room: { required: false },
  }),
  register
);

router.post(
  "/login",
  validateBody({
    email: { required: true, type: "email" },
    password: { required: true, minLength: 1 },
  }),
  login
);

router.post("/logout", verifyJWT, logout);
router.get("/me", verifyJWT, getMe);
router.post("/refresh-token", refreshAccessToken);

export default router;
