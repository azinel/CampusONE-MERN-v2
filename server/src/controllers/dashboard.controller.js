import Complaint from "../models/Complaint.js";
import Event from "../models/Event.js";
import Mess from "../models/Mess.js";
import MessFeedback from "../models/MessFeedback.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  CAMPUS_INFO,
  COMPLAINT_CATEGORIES,
  COMPLAINT_PRIORITIES,
  COMPLAINT_STATUSES,
  MEAL_DEFAULTS,
  MEAL_TYPES,
} from "../constants/index.js";

const todayString = () => new Date().toISOString().split("T")[0];
const round1 = (n) => Math.round(n * 10) / 10;

const formatComplaint = (complaint) => ({
  id: complaint._id,
  title: complaint.title,
  description: complaint.description,
  category: complaint.category,
  status: complaint.status,
  priority: complaint.priority,
  studentId: complaint.student?.toString?.() || complaint.student,
  studentName: complaint.studentName,
  studentEmail: complaint.studentEmail,
  hostel: complaint.hostel,
  roomNumber: complaint.roomNumber,
  images: complaint.images,
  assignedTo: complaint.assignedTo,
  resolution: complaint.resolution,
  timeline: complaint.timeline,
  createdAt: complaint.createdAt,
  updatedAt: complaint.updatedAt,
});

const formatEvent = (event) => {
  const startIso = event.startsAt
    ? new Date(event.startsAt).toISOString()
    : null;

  return {
    id: event._id,
    title: event.title,
    description: event.description,
    date: event.date,
    time: event.time,
    venue: event.venue,
    location: event.venue,
    organizer: event.organizer,
    category: event.category,
    image: event.image || null,
    banner: event.image || null,
    startDate: startIso,
    endDate: event.endsAt ? new Date(event.endsAt).toISOString() : startIso,
    maxCapacity: event.maxCapacity ?? 100,
    registeredCount: event.registeredCount ?? 0,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
};

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

const mealSortOrder = (type) => {
  const idx = MEAL_TYPES.indexOf(type);
  return idx === -1 ? 99 : idx;
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

  const meals = await Mess.find({ date });
  return [...meals].sort(
    (a, b) => mealSortOrder(a.mealType) - mealSortOrder(b.mealType)
  );
};

const buildComplaintAnalytics = async () => {
  const [
    total,
    unresolved,
    highPriority,
    byStatusAgg,
    byPriorityAgg,
    byCategoryAgg,
    resolutionAgg,
    trendAgg,
  ] = await Promise.all([
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: { $ne: "Resolved" } }),
    Complaint.countDocuments({ priority: "High", status: { $ne: "Resolved" } }),
    Complaint.aggregate([
      { $group: { _id: "$status", value: { $sum: 1 } } },
    ]),
    Complaint.aggregate([
      { $group: { _id: "$priority", value: { $sum: 1 } } },
    ]),
    Complaint.aggregate([
      { $group: { _id: "$category", value: { $sum: 1 } } },
    ]),
    Complaint.aggregate([
      { $match: { status: "Resolved" } },
      {
        $project: {
          days: {
            $divide: [{ $subtract: ["$updatedAt", "$createdAt"] }, 86400000],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgDays: { $avg: "$days" },
          count: { $sum: 1 },
        },
      },
    ]),
    Complaint.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]),
  ]);

  const statusMap = Object.fromEntries(
    byStatusAgg.map((row) => [row._id, row.value])
  );
  const priorityMap = Object.fromEntries(
    byPriorityAgg.map((row) => [row._id, row.value])
  );
  const categoryMap = Object.fromEntries(
    byCategoryAgg.map((row) => [row._id, row.value])
  );

  const byStatus = COMPLAINT_STATUSES.map((name) => ({
    name,
    value: statusMap[name] || 0,
  })).filter((row) => row.value > 0);

  const byPriority = COMPLAINT_PRIORITIES.map((name) => ({
    name,
    value: priorityMap[name] || 0,
  })).filter((row) => row.value > 0);

  const byCategory = COMPLAINT_CATEGORIES.map((name) => ({
    name,
    value: categoryMap[name] || 0,
  })).filter((row) => row.value > 0);

  const avgResolutionDays = resolutionAgg[0]?.avgDays
    ? round1(resolutionAgg[0].avgDays)
    : 0;

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const trend = trendAgg.map((row) => ({
    month: monthNames[(row._id.month || 1) - 1],
    count: row.count,
  }));

  return {
    total,
    unresolved,
    highPriority,
    avgResolutionDays,
    byStatus,
    byPriority,
    byCategory,
    trend,
  };
};

const buildMessAnalytics = async () => {
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

  return {
    mealStats,
    overallAvg,
    lowRated,
    feedbackCount: feedback.length,
  };
};

const buildActivity = async ({ studentId = null, limit = 10 } = {}) => {
  const activities = [];

  const complaintFilter = studentId ? { student: studentId } : {};
  const recentComplaints = await Complaint.find(complaintFilter)
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();

  recentComplaints.forEach((c) => {
    activities.push({
      id: `complaint-${c._id}-${c.updatedAt?.getTime?.() || Date.now()}`,
      type: "complaint",
      message: `${c.category} complaint "${c.title}" is ${c.status}`,
      timestamp: c.updatedAt || c.createdAt,
      user: c.studentName || "Student",
    });
  });

  const eventFilter = studentId
    ? { startsAt: { $gte: new Date() } }
    : {};
  const recentEvents = await Event.find(eventFilter)
    .sort(studentId ? { startsAt: 1 } : { createdAt: -1 })
    .limit(limit)
    .lean();

  recentEvents.forEach((e) => {
    activities.push({
      id: `event-${e._id}`,
      type: "event",
      message: studentId
        ? `Upcoming: ${e.title}`
        : `Event "${e.title}" · ${e.registeredCount || 0} registered`,
      timestamp: e.createdAt || e.startsAt,
      user: e.organizer || "System",
    });
  });

  const feedbackFilter = studentId ? { student: studentId } : {};
  const recentFeedback = await MessFeedback.find(feedbackFilter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  recentFeedback.forEach((fb) => {
    activities.push({
      id: `mess-${fb._id}`,
      type: "mess",
      message: studentId
        ? `You rated ${fb.mealType}: taste ${fb.taste}/5`
        : `${fb.studentName || "Student"} rated ${fb.mealType}: ${fb.taste}/5 taste`,
      timestamp: fb.createdAt,
      user: fb.studentName || "Student",
    });
  });

  if (studentId) {
    const notifications = await Notification.find({ recipient: studentId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    notifications.forEach((n) => {
      activities.push({
        id: `notif-${n._id}`,
        type: n.type || "system",
        message: n.message,
        timestamp: n.createdAt,
        user: "System",
      });
    });
  }

  return activities
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit)
    .map((a) => ({
      ...a,
      id: String(a.id),
      timestamp: a.timestamp,
    }));
};

export const getCampusInfo = asyncHandler(async (_req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, CAMPUS_INFO, "Campus info fetched successfully"));
});

export const getRecentActivity = asyncHandler(async (req, res) => {
  const studentId = req.user.role === "student" ? req.user._id : null;
  const activity = await buildActivity({ studentId, limit: 12 });

  return res
    .status(200)
    .json(new ApiResponse(200, activity, "Recent activity fetched successfully"));
});

export const getStudentDashboard = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const now = new Date();
  const date = todayString();

  const [
    complaints,
    statusAgg,
    upcomingEvents,
    upcomingEventsCount,
    meals,
    myFeedback,
    feedbackAvgAgg,
    activity,
  ] = await Promise.all([
    Complaint.find({ student: studentId }).sort({ updatedAt: -1 }),
    Complaint.aggregate([
      { $match: { student: studentId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Event.find({ startsAt: { $gte: now } }).sort({ startsAt: 1 }).limit(5),
    Event.countDocuments({ startsAt: { $gte: now } }),
    ensureMealsForDate(date),
    MessFeedback.countDocuments({ student: studentId }),
    MessFeedback.aggregate([
      { $match: { student: studentId } },
      {
        $group: {
          _id: null,
          avgTaste: { $avg: "$taste" },
          avgHygiene: { $avg: "$hygiene" },
          avgQuantity: { $avg: "$quantity" },
          count: { $sum: 1 },
        },
      },
    ]),
    buildActivity({ studentId, limit: 8 }),
  ]);

  const statusCounts = Object.fromEntries(
    statusAgg.map((row) => [row._id, row.count])
  );
  const pending = statusCounts.Pending || 0;
  const inProgress = statusCounts["In Progress"] || 0;
  const resolved = statusCounts.Resolved || 0;
  const active = pending + inProgress;

  const formattedComplaints = complaints.map(formatComplaint);
  const activeComplaints = formattedComplaints
    .filter((c) => c.status !== "Resolved")
    .slice(0, 5);

  const feedbackAvg = feedbackAvgAgg[0];
  const messSummary = {
    feedbackCount: myFeedback,
    avgRating: feedbackAvg
      ? round1(
          (feedbackAvg.avgTaste + feedbackAvg.avgHygiene + feedbackAvg.avgQuantity) /
            3
        )
      : 0,
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        campusInfo: CAMPUS_INFO,
        complaints: {
          total: complaints.length,
          active,
          pending,
          inProgress,
          resolved,
          activeItems: activeComplaints,
          recent: formattedComplaints.slice(0, 5),
        },
        events: {
          upcomingCount: upcomingEventsCount,
          upcoming: upcomingEvents.map(formatEvent),
        },
        mess: {
          todayMenu: {
            date,
            meals: meals.map(formatMeal),
          },
          summary: messSummary,
        },
        activity,
      },
      "Student dashboard fetched successfully"
    )
  );
});

export const getAdminDashboard = asyncHandler(async (req, res) => {
  const now = new Date();

  const [
    totalStudents,
    complaintAnalytics,
    messAnalytics,
    upcomingEventsCount,
    totalEvents,
    highPriorityComplaints,
    pendingComplaints,
    activity,
  ] = await Promise.all([
    User.countDocuments({ role: "student" }),
    buildComplaintAnalytics(),
    buildMessAnalytics(),
    Event.countDocuments({ startsAt: { $gte: now } }),
    Event.countDocuments(),
    Complaint.find({ priority: "High", status: { $ne: "Resolved" } })
      .sort({ updatedAt: -1 })
      .limit(5),
    Complaint.find({ status: "Pending" }).sort({ createdAt: -1 }).limit(5),
    buildActivity({ limit: 10 }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        students: { total: totalStudents },
        complaints: {
          ...complaintAnalytics,
          highPriorityItems: highPriorityComplaints.map(formatComplaint),
          pendingItems: pendingComplaints.map(formatComplaint),
        },
        mess: messAnalytics,
        events: {
          total: totalEvents,
          upcomingCount: upcomingEventsCount,
        },
        activity,
      },
      "Admin dashboard fetched successfully"
    )
  );
});

export const getAnalytics = asyncHandler(async (_req, res) => {
  const now = new Date();

  const [
    totalStudents,
    complaintAnalytics,
    messAnalytics,
    upcomingEventsCount,
    totalEvents,
    activity,
  ] = await Promise.all([
    User.countDocuments({ role: "student" }),
    buildComplaintAnalytics(),
    buildMessAnalytics(),
    Event.countDocuments({ startsAt: { $gte: now } }),
    Event.countDocuments(),
    buildActivity({ limit: 12 }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        students: { total: totalStudents },
        total: complaintAnalytics.total,
        unresolved: complaintAnalytics.unresolved,
        highPriority: complaintAnalytics.highPriority,
        avgResolutionDays: complaintAnalytics.avgResolutionDays,
        byStatus: complaintAnalytics.byStatus,
        byPriority: complaintAnalytics.byPriority,
        byCategory: complaintAnalytics.byCategory,
        trend: complaintAnalytics.trend,
        mess: messAnalytics,
        overallAvg: messAnalytics.overallAvg,
        mealStats: messAnalytics.mealStats,
        lowRated: messAnalytics.lowRated,
        events: {
          total: totalEvents,
          upcomingCount: upcomingEventsCount,
        },
        activity,
      },
      "Analytics fetched successfully"
    )
  );
});
