export const COMPLAINT_CATEGORIES = ['Water', 'Electricity', 'WiFi', 'Cleaning', 'Other'];
export const COMPLAINT_STATUSES = ['Pending', 'In Progress', 'Resolved'];
export const COMPLAINT_PRIORITIES = ['Low', 'Medium', 'High'];
export const USER_ROLES = ['student', 'admin'];
export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
export const EVENT_CATEGORIES = ['Academic', 'Cultural', 'Sports', 'Workshop', 'Other'];

/** @deprecated Use STATUS_BADGE_CLASS — kept for any legacy className usage */
export const STATUS_COLORS = {
  Pending: 'co-badge-status-pending',
  'In Progress': 'co-badge-status-progress',
  Resolved: 'co-badge-status-resolved',
};

export const STATUS_BADGE_CLASS = {
  Pending: 'co-badge-status-pending',
  'In Progress': 'co-badge-status-progress',
  Resolved: 'co-badge-status-resolved',
};

export const PRIORITY_COLORS = {
  Low: 'bg-muted text-muted-foreground',
  Medium: 'bg-accent-amber-muted text-warning',
  High: 'bg-destructive/15 text-destructive',
};

export const CATEGORY_ICONS = {
  Water: 'Droplets',
  Electricity: 'Zap',
  WiFi: 'Wifi',
  Cleaning: 'Sparkles',
  Other: 'MoreHorizontal',
};
