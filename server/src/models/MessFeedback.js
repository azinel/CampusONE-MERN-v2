import mongoose from "mongoose";
import { MEAL_TYPES } from "../constants/index.js";

const messFeedbackSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    meal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },
    mealType: {
      type: String,
      enum: MEAL_TYPES,
      required: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    taste: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    hygiene: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

messFeedbackSchema.index({ student: 1, meal: 1 }, { unique: true });

export default mongoose.model("MessFeedback", messFeedbackSchema);
