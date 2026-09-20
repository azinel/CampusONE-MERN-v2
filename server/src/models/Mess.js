import mongoose from "mongoose";
import { MEAL_TYPES } from "../constants/index.js";

const messSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      trim: true,
    },
    mealType: {
      type: String,
      enum: MEAL_TYPES,
      required: true,
    },
    items: {
      type: [String],
      default: [],
    },
    time: {
      type: String,
      trim: true,
      default: "",
    },
    avgTaste: {
      type: Number,
      default: 0,
    },
    avgHygiene: {
      type: Number,
      default: 0,
    },
    avgQuantity: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

messSchema.index({ date: 1, mealType: 1 }, { unique: true });

export default mongoose.model("Mess", messSchema);
