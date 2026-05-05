export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  SIDEBAR_COLLAPSED: "sidebar_collapsed",
  THEME: "theme",
  REMEMBERED_PHONE: "remembered_phone",
  LAST_ACTIVITY: "last_activity",
} as const;

export const RIDE_STATUS_COLORS: Record<string, string> = {
  SEARCHING: "text-yellow-400 bg-yellow-400/10",
  MATCHED: "text-blue-400 bg-blue-400/10",
  DRIVER_EN_ROUTE: "text-blue-400 bg-blue-400/10",
  ARRIVED_AT_PICKUP: "text-purple-400 bg-purple-400/10",
  IN_PROGRESS: "text-primary bg-primary/10",
  COMPLETED: "text-amber-400 bg-amber-400/10",
  CANCELLED: "text-destructive bg-destructive/10",
};

export const RIDE_STATUS_COLORS_BORDERED: Record<string, string> = {
  SEARCHING: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  MATCHED: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  DRIVER_EN_ROUTE: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  ARRIVED_AT_PICKUP: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  IN_PROGRESS: "text-primary bg-primary/10 border-primary/20",
  COMPLETED: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  CANCELLED: "text-destructive bg-destructive/10 border-destructive/20",
};
