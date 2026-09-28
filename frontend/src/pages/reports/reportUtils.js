// Shared helpers for the support Report pages. The Report system is used by
// every role, so status/category metadata and role rules live here once.

export { dashboardRoutes, excerpt, formatFullDate, formatTimeAgo, roleLabel } from "../forum/forumUtils";

export const REPORT_STATUSES = [
  {
    value: "open",
    label: "Open",
    text: "text-blue-500",
    chip: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    dot: "bg-blue-500",
  },
  {
    value: "in_progress",
    label: "In Progress",
    text: "text-yellow-500",
    chip: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    dot: "bg-yellow-500",
  },
  {
    value: "solved",
    label: "Solved",
    text: "text-green-500",
    chip: "bg-green-500/10 text-green-500 border-green-500/20",
    dot: "bg-green-500",
  },
  {
    value: "reject",
    label: "Reject",
    text: "text-red-500",
    chip: "bg-red-500/10 text-red-500 border-red-500/20",
    dot: "bg-red-500",
  },
];

export const REPORT_CATEGORIES = [
  { value: "account", label: "Account & Profile" },
  { value: "components", label: "Components" },
  { value: "borrowing", label: "Borrowing & Returns" },
  { value: "resources", label: "Resources" },
  { value: "messaging", label: "Messaging" },
  { value: "forum", label: "Community Forum" },
  { value: "bug", label: "Bug & Errors" },
  { value: "other", label: "Other" },
];

const FALLBACK_STATUS = {
  value: "open",
  label: "Open",
  text: "text-text-muted",
  chip: "bg-bg-secondary text-text-muted border-border-color",
  dot: "bg-text-muted",
};

export function statusMeta(status) {
  return REPORT_STATUSES.find((entry) => entry.value === status) || FALLBACK_STATUS;
}

export function categoryLabel(value) {
  const found = REPORT_CATEGORIES.find((entry) => entry.value === value);
  return found ? found.label : "Other";
}

export function isStaff(role) {
  return role === "admin" || role === "moderator";
}

/**
 * Only "Solved" locks the reporter out. Staff can always keep the
 * conversation going, exactly like the backend rule.
 */
export function canReply(report, user) {
  if (!report || !user) return false;
  if (isStaff(user.role)) return true;
  if (String(report.reporter?._id || report.reporter) !== String(user._id)) return false;
  return report.status !== "solved";
}

export const REPORT_SORT_OPTIONS = [
  { value: "latest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "activity", label: "Recent activity" },
];
