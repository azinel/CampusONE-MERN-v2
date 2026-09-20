export const USER_ROLES = ["student", "admin"];

export const COMPLAINT_CATEGORIES = [
  "Water",
  "Electricity",
  "WiFi",
  "Cleaning",
  "Other",
];

export const COMPLAINT_STATUSES = ["Pending", "In Progress", "Resolved"];

export const COMPLAINT_PRIORITIES = ["Low", "Medium", "High"];

export const MEAL_TYPES = ["Breakfast", "Lunch", "Snacks", "Dinner"];

export const MEAL_DEFAULTS = {
  Breakfast: {
    time: "7:00 AM – 9:00 AM",
    items: ["Poha", "Bread & Butter", "Boiled Eggs", "Tea/Coffee", "Seasonal Fruit"],
  },
  Lunch: {
    time: "12:00 PM – 2:30 PM",
    items: ["Dal Tadka", "Paneer Butter Masala", "Jeera Rice", "Roti", "Salad", "Curd"],
  },
  Snacks: {
    time: "4:00 PM – 5:30 PM",
    items: ["Samosa", "Tea", "Biscuits"],
  },
  Dinner: {
    time: "7:00 PM – 9:30 PM",
    items: ["Vegetable Biryani", "Raita", "Papad", "Pickle", "Ice Cream"],
  },
};

export const EVENT_CATEGORIES = [
  "Academic",
  "Cultural",
  "Sports",
  "Workshop",
  "Other",
];

export const CAMPUS_INFO = {
  announcement:
    "Semester examinations begin March 15. Quiet hours enforced in all hostels from 10 PM.",
  waterSchedule: "Water supply: 6 AM – 9 AM, 12 PM – 2 PM, 6 PM – 9 PM",
  messTimings: "Breakfast 7–9 AM | Lunch 12–2:30 PM | Dinner 7–9:30 PM",
  emergencyContact: "+91 1800-CAMPUS-1",
};
