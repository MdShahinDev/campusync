import api from "./axios";

/** Route each role's sidebar to its own messaging page. */
export const MESSAGING_PATHS = {
  student: "/student/messaging",
  moderator: "/moderator/messaging",
  admin: "/admin/messaging",
};

export function messagingPathFor(role) {
  return MESSAGING_PATHS[role] || MESSAGING_PATHS.student;
}

/**
 * Deep link used by the "Message" button on a user's details page.
 * `?user=<id>` makes the messaging page find-or-create that conversation.
 */
export function messagingHref(role, userId) {
  const base = messagingPathFor(role);
  return userId ? `${base}?user=${encodeURIComponent(userId)}` : base;
}

export const messagingApi = {
  config: () => api.get("/messages/config"),
  unreadCount: () => api.get("/messages/unread-count"),
  conversations: () => api.get("/messages/conversations"),
  searchUsers: (search) =>
    api.get("/messages/users", { params: search ? { search } : {} }),
  createConversation: (userId) =>
    api.post("/messages/conversations", { userId }),
  messages: (conversationId, { before, limit } = {}) =>
    api.get(`/messages/conversations/${conversationId}/messages`, {
      params: { ...(before ? { before } : {}), ...(limit ? { limit } : {}) },
    }),
  send: (conversationId, content, clientMessageId) =>
    api.post(`/messages/conversations/${conversationId}/messages`, {
      content,
      clientMessageId,
    }),
  markRead: (conversationId) =>
    api.put(`/messages/conversations/${conversationId}/read`),
};

/** "Md Rahim" -> "MR" */
export function initials(name) {
  if (!name) return "?";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function displayRole(role) {
  if (!role) return "";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function otherParticipantOf(conversation, userId) {
  if (!conversation?.participants?.length) return null;
  return (
    conversation.participants.find(
      (participant) => String(participant._id) !== String(userId)
    ) || null
  );
}

/** Compact list timestamp: "now", "5m ago", "3h ago", "Mon", "12 Mar". */
export function formatListTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Bubble timestamp: "10:24 AM" plus the date when it is not today. */
export function formatMessageTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  const time = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const isToday = new Date().toDateString() === date.toDateString();
  if (isToday) return time;
  return `${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}, ${time}`;
}

export function formatDaySeparator(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** Stable idempotency key for a single send attempt (retries reuse it). */
export function newClientMessageId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
