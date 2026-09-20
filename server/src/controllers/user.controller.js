import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { USER_ROLES } from "../constants/index.js";

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  hostel: user.hostel || "",
  room: user.room || "",
  roomNumber: user.room || "",
  department: user.department || "",
  course: user.course || "",
  phone: user.phone || "",
  isActive: user.isActive !== false,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const USER_SAFE_SELECT = "-passwordHash -refreshToken -password";

export const listUsers = asyncHandler(async (req, res) => {
  const { search, role, isActive } = req.query;
  const filter = {};

  if (role) {
    if (!USER_ROLES.includes(role)) {
      throw new ApiError(400, `role must be one of: ${USER_ROLES.join(", ")}`);
    }
    filter.role = role;
  }

  if (isActive === "true" || isActive === true) {
    filter.isActive = { $ne: false };
  } else if (isActive === "false" || isActive === false) {
    filter.isActive = false;
  }

  if (search) {
    const q = String(search).trim();
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { hostel: { $regex: q, $options: "i" } },
      { department: { $regex: q, $options: "i" } },
      { course: { $regex: q, $options: "i" } },
    ];
  }

  const users = await User.find(filter)
    .select(USER_SAFE_SELECT)
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, users.map(formatUser), "Users fetched successfully"));
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(USER_SAFE_SELECT);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, formatUser(user), "User fetched successfully"));
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!USER_ROLES.includes(role)) {
    throw new ApiError(400, `role must be one of: ${USER_ROLES.join(", ")}`);
  }

  const user = await User.findById(req.params.id).select(USER_SAFE_SELECT);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user._id.toString() === req.user._id.toString() && role !== "admin") {
    throw new ApiError(400, "You cannot remove your own admin role");
  }

  if (user.role === "admin" && role !== "admin") {
    const adminCount = await User.countDocuments({ role: "admin", isActive: true });
    if (adminCount <= 1) {
      throw new ApiError(400, "Cannot demote the last active admin");
    }
  }

  user.role = role;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, formatUser(user), "User role updated successfully"));
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    throw new ApiError(400, "isActive must be a boolean");
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user._id.toString() === req.user._id.toString() && isActive === false) {
    throw new ApiError(400, "You cannot deactivate your own account");
  }

  if (user.role === "admin" && isActive === false) {
    const adminCount = await User.countDocuments({ role: "admin", isActive: true });
    if (adminCount <= 1) {
      throw new ApiError(400, "Cannot deactivate the last active admin");
    }
  }

  user.isActive = isActive;
  if (!isActive) {
    user.refreshToken = undefined;
  }
  await user.save();

  const safeUser = await User.findById(user._id).select(USER_SAFE_SELECT);

  return res.status(200).json(
    new ApiResponse(
      200,
      formatUser(safeUser),
      isActive ? "User activated successfully" : "User deactivated successfully"
    )
  );
});
