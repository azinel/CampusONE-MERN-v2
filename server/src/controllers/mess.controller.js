import Mess from "../models/Mess.js";
import MessFeedback from "../models/MessFeedback.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { MEAL_TYPES, MEAL_DEFAULTS } from "../constants/index.js";

const todayString = () => new Date().toISOString().split("T")[0];

const round1 = (n) => Math.round(n * 10) / 10;

const formatMeal = (meal) => {
  const avgRating =
    meal.ratingCount > 0
      ? round1((meal.avgTaste + meal.avgHygiene + meal.avgQuantity) / 3)
      : 0;

  return {
    id: meal._id,
    type: meal.mealType,
    mealType: meal.mealType,
    time: meal.time,
    items: meal.items,
    date: meal.date,
    avgRating,
    avgTaste: meal.avgTaste,
    avgHygiene: meal.avgHygiene,
    avgQuantity: meal.avgQuantity,
    ratingCount: meal.ratingCount,
  };
};

const formatFeedback = (fb) => ({
  id: fb._id,
  studentId: fb.student?.toString?.() || fb.student,
  studentName: fb.studentName,
  mealId: fb.meal?.toString?.() || fb.meal,
  mealType: fb.mealType,
  date: fb.date || fb.createdAt,
  taste: fb.taste,
  hygiene: fb.hygiene,
  quantity: fb.quantity,
  comment: fb.comment || "",
  createdAt: fb.createdAt,
  updatedAt: fb.updatedAt,
});

const isValidRating = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 5;
};

const ensureMealsForDate = async (date) => {
  const existing = await Mess.find({ date }).lean();
  const existingTypes = new Set(existing.map((m) => m.mealType));
  const toCreate = MEAL_TYPES.filter((type) => !existingTypes.has(type)).map(
    (mealType) => ({
      date,
      mealType,
      time: MEAL_DEFAULTS[mealType].time,
      items: [...MEAL_DEFAULTS[mealType].items],
    })
  );

  if (toCreate.length) {
    await Mess.insertMany(toCreate, { ordered: false }).catch(() => {});
  }

  return Mess.find({ date }).sort({
    mealType: 1,
  });
};

const mealSortOrder = (type) => {
  const idx = MEAL_TYPES.indexOf(type);
  return idx === -1 ? 99 : idx;
};

const recalculateMealRatings = async (mealId) => {
  const feedbacks = await MessFeedback.find({ meal: mealId }).lean();
  const count = feedbacks.length;

  if (!count) {
    await Mess.findByIdAndUpdate(mealId, {
      avgTaste: 0,
      avgHygiene: 0,
      avgQuantity: 0,
      ratingCount: 0,
    });
    return;
  }

  const sum = feedbacks.reduce(
    (acc, fb) => {
      acc.taste += fb.taste;
      acc.hygiene += fb.hygiene;
      acc.quantity += fb.quantity;
      return acc;
    },
    { taste: 0, hygiene: 0, quantity: 0 }
  );

  await Mess.findByIdAndUpdate(mealId, {
    avgTaste: round1(sum.taste / count),
    avgHygiene: round1(sum.hygiene / count),
    avgQuantity: round1(sum.quantity / count),
    ratingCount: count,
  });
};

export const getTodayMenu = asyncHandler(async (req, res) => {
  const date = req.query.date || todayString();
  const meals = await ensureMealsForDate(date);
  const sorted = [...meals].sort(
    (a, b) => mealSortOrder(a.mealType) - mealSortOrder(b.mealType)
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        date,
        meals: sorted.map(formatMeal),
      },
      "Mess menu fetched successfully"
    )
  );
});

export const upsertMeal = asyncHandler(async (req, res) => {
  const { date = todayString(), mealType, items, time } = req.body;

  if (!MEAL_TYPES.includes(mealType)) {
    throw new ApiError(400, `mealType must be one of: ${MEAL_TYPES.join(", ")}`);
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "items must be a non-empty array");
  }

  const normalizedItems = items.map((item) => String(item).trim()).filter(Boolean);
  if (!normalizedItems.length) {
    throw new ApiError(400, "items must contain at least one value");
  }

  const meal = await Mess.findOneAndUpdate(
    { date, mealType },
    {
      $set: {
        items: normalizedItems,
        time: time || MEAL_DEFAULTS[mealType]?.time || "",
      },
      $setOnInsert: {
        date,
        mealType,
        avgTaste: 0,
        avgHygiene: 0,
        avgQuantity: 0,
        ratingCount: 0,
      },
    },
    { upsert: true, new: true, runValidators: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, formatMeal(meal), "Meal menu saved successfully"));
});

export const listFeedback = asyncHandler(async (req, res) => {
  const { mealType, date } = req.query;
  const filter = {};

  if (req.user.role === "student") {
    filter.student = req.user._id;
  }

  if (mealType) {
    if (!MEAL_TYPES.includes(mealType)) {
      throw new ApiError(400, `mealType must be one of: ${MEAL_TYPES.join(", ")}`);
    }
    filter.mealType = mealType;
  }

  if (date) {
    filter.date = date;
  }

  const feedback = await MessFeedback.find(filter).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, feedback.map(formatFeedback), "Feedback fetched successfully"));
});

export const submitFeedback = asyncHandler(async (req, res) => {
  const { mealType, taste, hygiene, quantity, comment, date } = req.body;
  const mealDate = date || todayString();

  if (!MEAL_TYPES.includes(mealType)) {
    throw new ApiError(400, `mealType must be one of: ${MEAL_TYPES.join(", ")}`);
  }

  if (![taste, hygiene, quantity].every(isValidRating)) {
    throw new ApiError(400, "taste, hygiene, and quantity must be integers from 1 to 5");
  }

  await ensureMealsForDate(mealDate);

  const meal = await Mess.findOne({ date: mealDate, mealType });
  if (!meal) {
    throw new ApiError(404, "Meal menu not found for the selected date");
  }

  const existing = await MessFeedback.findOne({
    student: req.user._id,
    meal: meal._id,
  });

  if (existing) {
    throw new ApiError(409, "You have already submitted feedback for this meal");
  }

  let feedback;
  try {
    feedback = await MessFeedback.create({
      student: req.user._id,
      studentName: req.user.name,
      meal: meal._id,
      mealType,
      date: mealDate,
      taste: Number(taste),
      hygiene: Number(hygiene),
      quantity: Number(quantity),
      comment: comment?.trim?.() || "",
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(409, "You have already submitted feedback for this meal");
    }
    throw err;
  }

  await recalculateMealRatings(meal._id);

  return res
    .status(201)
    .json(new ApiResponse(201, formatFeedback(feedback), "Feedback submitted successfully"));
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const feedback = await MessFeedback.find().sort({ createdAt: -1 }).lean();

  const byMeal = {};
  for (const type of MEAL_TYPES) {
    byMeal[type] = { taste: [], hygiene: [], quantity: [] };
  }

  feedback.forEach((fb) => {
    if (!byMeal[fb.mealType]) {
      byMeal[fb.mealType] = { taste: [], hygiene: [], quantity: [] };
    }
    byMeal[fb.mealType].taste.push(fb.taste);
    byMeal[fb.mealType].hygiene.push(fb.hygiene);
    byMeal[fb.mealType].quantity.push(fb.quantity);
  });

  const avg = (arr) =>
    arr.length ? round1(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const mealStats = MEAL_TYPES.map((meal) => {
    const ratings = byMeal[meal];
    return {
      meal,
      taste: avg(ratings.taste),
      hygiene: avg(ratings.hygiene),
      quantity: avg(ratings.quantity),
      count: ratings.taste.length,
    };
  }).filter((m) => m.count > 0);

  const allTaste = feedback.map((f) => f.taste);
  const overallAvg = allTaste.length ? avg(allTaste) : 0;
  const lowRated = mealStats.filter((m) => m.taste > 0 && m.taste < 3.5);
  const recent = feedback.slice(0, 5).map(formatFeedback);

  return res.status(200).json(
    new ApiResponse(
      200,
      { mealStats, overallAvg, lowRated, recent },
      "Mess analytics fetched successfully"
    )
  );
});
