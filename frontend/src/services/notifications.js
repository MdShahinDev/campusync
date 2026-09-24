import {
  User,
  UserCheck,
  UserX,
  Package,
  Inbox,
  UserPlus,
  Flag,
  GraduationCap,
  Mail,
  Bell,
} from "lucide-react";

/**
 * Shared helpers for the single canonical Notification system.
 * No JSX lives here so the file can be imported from any component.
 */

const DASHBOARD_PATHS = {
  student: "/student/dashboard",
  moderator: "/moderator/dashboard",
  admin: "/admin/dashboard",
};

export const NOTIFICATIONS_PATH = "/notifications";

export function dashboardPathFor(role) {
  return DASHBOARD_PATHS[role] || "/";
}

/** Human readable label for an explicit notification type. */
const TYPE_LABELS = {
  ACCOUNT_CREATED: "Account Created",
  ACCOUNT_APPROVED: "Account Approved",
  ACCOUNT_REJECTED: "Account Rejected",
  BORROW_REQUEST_RECEIVED: "New Borrow Request",
  BORROW_STATUS_CHANGED: "Borrow Status Changed",
  BORROW_REQUEST_STATUS_CHANGED: "Borrow Request Status",
  NEW_USER_REGISTERED: "New User Registered",
  USER_REPORTED: "User Reported",
  UNIVERSITY_NEW_STUDENT_REGISTERED: "New Student",
  UNIVERSITY_USER_REPORTED: "User Reported",
  ADMIN_MESSAGE: "Message",
  SYSTEM_MESSAGE: "System",
};

const TYPE_ICONS = {
  ACCOUNT_CREATED: User,
  ACCOUNT_APPROVED: UserCheck,
  ACCOUNT_REJECTED: UserX,
  BORROW_REQUEST_RECEIVED: Inbox,
  BORROW_STATUS_CHANGED: Package,
  BORROW_REQUEST_STATUS_CHANGED: Package,
  NEW_USER_REGISTERED: UserPlus,
  USER_REPORTED: Flag,
  UNIVERSITY_NEW_STUDENT_REGISTERED: GraduationCap,
  UNIVERSITY_USER_REPORTED: Flag,
  ADMIN_MESSAGE: Mail,
  SYSTEM_MESSAGE: Bell,
};

/** tone → tailwind classes used by the dropdown, list and details page. */
const TONE_CLASSES = {
  info: {
    chip: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    icon: "bg-blue-500/10 text-blue-500",
  },
  success: {
    chip: "bg-green-500/10 text-green-500 border-green-500/20",
    icon: "bg-green-500/10 text-green-500",
  },
  warning: {
    chip: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    icon: "bg-yellow-500/10 text-yellow-500",
  },
  danger: {
    chip: "bg-red-500/10 text-red-500 border-red-500/20",
    icon: "bg-red-500/10 text-red-500",
  },
  accent: {
    chip: "bg-accent-orange/10 text-accent-orange border-accent-orange/20",
    icon: "bg-accent-orange/10 text-accent-orange",
  },
  neutral: {
    chip: "bg-bg-secondary text-text-muted border-border-color",
    icon: "bg-bg-secondary text-text-muted",
  },
};

const TYPE_TONES = {
  ACCOUNT_CREATED: "success",
  ACCOUNT_APPROVED: "success",
  ACCOUNT_REJECTED: "danger",
  BORROW_REQUEST_RECEIVED: "accent",
  BORROW_STATUS_CHANGED: "accent",
  BORROW_REQUEST_STATUS_CHANGED: "accent",
  NEW_USER_REGISTERED: "info",
  USER_REPORTED: "warning",
  UNIVERSITY_NEW_STUDENT_REGISTERED: "info",
  UNIVERSITY_USER_REPORTED: "warning",
  ADMIN_MESSAGE: "info",
  SYSTEM_MESSAGE: "neutral",
};

const SEVERITY_TONES = {
  info: "info",
  warning: "warning",
  success: "success",
  alert: "danger",
};

export function notificationTypeMeta(notification) {
  const type = notification?.type || "SYSTEM_MESSAGE";
  const severity = notification?.metadata?.severity;
  const tone =
    type === "ADMIN_MESSAGE" && SEVERITY_TONES[severity]
      ? SEVERITY_TONES[severity]
      : TYPE_TONES[type] || "neutral";

  return {
    type,
    label: TYPE_LABELS[type] || "Notification",
    icon: TYPE_ICONS[type] || Bell,
    tone,
    toneClasses: TONE_CLASSES[tone] || TONE_CLASSES.neutral,
  };
}

/** Compact relative timestamp used by the dropdown and the list. */
export function formatNotificationTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

/** Long form timestamp for the details page. */
export function formatNotificationDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
