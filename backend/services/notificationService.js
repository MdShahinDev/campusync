const Notification = require("../model/Notification");
const User = require("../model/User");

const { NOTIFICATION_TYPES } = Notification;

// ---------------------------------------------------------------------------
// Low level helpers
//
// Notification creation must NEVER break the business operation that
// triggered it, so every write is wrapped and logged instead of thrown.
// ---------------------------------------------------------------------------

const isValidType = (type) => NOTIFICATION_TYPES.includes(type);

/**
 * Create a single notification.
 * Returns the created document, or null when the payload is invalid or the
 * write failed (never throws).
 */
async function createNotification({
  recipient,
  sender = null,
  type,
  title,
  message,
  relatedEntityType = null,
  relatedEntityId = null,
  metadata = {},
}) {
  if (!recipient) return null;
  if (!isValidType(type)) {
    console.error(`Notification skipped: invalid type "${type}"`);
    return null;
  }
  if (!title || !message) return null;

  try {
    return await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      relatedEntityType,
      relatedEntityId,
      metadata: metadata || {},
    });
  } catch (error) {
    console.error("Notification create error:", error.message);
    return null;
  }
}

/**
 * Create the same notification for several recipients (duplicates removed).
 * Used for "all admins" and "moderators of a university" fan-out.
 */
async function createNotifications(recipients, payload) {
  const unique = [
    ...new Set((recipients || []).filter(Boolean).map((id) => String(id))),
  ];
  if (unique.length === 0 || !isValidType(payload.type)) return null;

  try {
    const docs = unique.map((recipient) => ({
      recipient,
      sender: payload.sender || null,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      relatedEntityType: payload.relatedEntityType || null,
      relatedEntityId: payload.relatedEntityId || null,
      metadata: payload.metadata || {},
    }));
    return await Notification.insertMany(docs, { ordered: false });
  } catch (error) {
    console.error("Notification batch create error:", error.message);
    return null;
  }
}

async function notifyUser(recipientId, payload) {
  return createNotification({ ...payload, recipient: recipientId });
}

/** Every admin account receives platform level notifications. */
async function notifyAllAdmins(payload) {
  const admins = await User.find({ role: "admin" }).select("_id");
  return createNotifications(admins.map((a) => a._id), payload);
}

/**
 * Moderators of one university only.
 * `universityId` must come from authoritative backend data (user profile /
 * report document) — never from the request body supplied by the frontend.
 */
async function notifyModeratorsForUniversity(universityId, payload) {
  if (!universityId) return null;
  const moderators = await User.find({
    role: "moderator",
    university: universityId,
  }).select("_id");
  return createNotifications(moderators.map((m) => m._id), payload);
}

// ---------------------------------------------------------------------------
// Account / verification events
// ---------------------------------------------------------------------------

async function notifyAccountCreated(user) {
  if (!user) return null;
  return notifyUser(user._id, {
    type: "ACCOUNT_CREATED",
    title: "Account Created",
    message:
      "Your account Create Successfully, Complete Your Profile to get faster approve",
    relatedEntityType: "USER",
    relatedEntityId: user._id,
    metadata: {
      name: user.name,
      role: user.role,
      username: user.username || "",
      createdAt: user.createdAt || new Date(),
    },
  });
}

async function notifyAccountApproved({ user, actor = null }) {
  if (!user) return null;
  return notifyUser(user._id, {
    sender: actor,
    type: "ACCOUNT_APPROVED",
    title: "Account Approved",
    message: "Your account has been approved. You can now access all features.",
    relatedEntityType: "USER",
    relatedEntityId: user._id,
    metadata: { name: user.name, role: user.role },
  });
}

async function notifyAccountRejected({ user, feedback = "", actor = null }) {
  if (!user) return null;
  const trimmed = typeof feedback === "string" ? feedback.trim() : "";
  return notifyUser(user._id, {
    sender: actor,
    type: "ACCOUNT_REJECTED",
    title: "Account Rejected",
    message: trimmed
      ? `Your account has been rejected. Feedback: ${trimmed}`
      : "Your account has been rejected. Feedback: No feedback provided.",
    relatedEntityType: "USER",
    relatedEntityId: user._id,
    metadata: {
      name: user.name,
      role: user.role,
      feedback: trimmed || "",
      rejectedBy: actor || null,
      rejectedAt: new Date(),
    },
  });
}

/** Admin side: any newly registered user account (never to the new user). */
async function notifyNewUserRegistered(user) {
  if (!user) return null;
  const admins = await User.find({ role: "admin" }).select("_id");
  const recipients = admins
    .map((a) => a._id)
    .filter((id) => String(id) !== String(user._id));
  return createNotifications(recipients, {
    type: "NEW_USER_REGISTERED",
    title: "New User Registered",
    message: `New user account created: ${user.name} (${user.role || "user"}).`,
    relatedEntityType: "USER",
    relatedEntityId: user._id,
    metadata: {
      userId: user._id,
      name: user.name,
      role: user.role || "student",
      username: user.username || "",
      createdAt: user.createdAt || new Date(),
    },
  });
}

/** Moderator side: new student in the moderator's own university only. */
async function notifyUniversityNewStudent(user) {
  if (!user || user.role !== "student" || !user.university) return null;
  return notifyModeratorsForUniversity(user.university, {
    type: "UNIVERSITY_NEW_STUDENT_REGISTERED",
    title: "New Student Registered",
    message: `A new student account has been created at your university: ${user.name}`,
    relatedEntityType: "USER",
    relatedEntityId: user._id,
    metadata: {
      userId: user._id,
      name: user.name,
      role: "student",
      university: user.university,
      createdAt: user.createdAt || new Date(),
    },
  });
}

// ---------------------------------------------------------------------------
// Borrow events
// ---------------------------------------------------------------------------

const BORROW_STATUS_TITLE = {
  approved: "Borrow Request Approved",
  rejected: "Borrow Request Rejected",
  borrowed: "Component Handed Over",
  return_requested: "Return Requested",
  returned: "Return Confirmed",
  cancelled: "Borrow Request Cancelled",
};

const BORROW_STATUS_TEXT = {
  approved: "approved",
  rejected: "rejected",
  borrowed: "handed over",
  return_requested: "return requested",
  returned: "returned",
  cancelled: "cancelled",
};

/** Owner receives a brand new borrow request for one of their components. */
async function notifyBorrowRequestReceived({ request, requester = null }) {
  if (!request) return null;
  const requesterName =
    (requester && requester.name) || request.borrower_name || "Someone";

  return notifyUser(request.owner_id, {
    sender: request.borrower_id || (requester && requester._id) || null,
    type: "BORROW_REQUEST_RECEIVED",
    title: "New Borrow Request",
    message: `You have received a new borrow request for ${request.component_name} from ${requesterName}.`,
    relatedEntityType: "BORROW",
    relatedEntityId: request._id,
    metadata: {
      componentName: request.component_name,
      componentId: request.component_id,
      quantity: request.quantity || 1,
      borrowerName: request.borrower_name || requesterName,
      ownerName: request.owner_name || "",
      status: request.status,
    },
  });
}

/**
 * Borrow lifecycle transition.
 *
 * Creates TWO separate notifications — one for the borrower
 * (BORROW_STATUS_CHANGED) and one for the owner
 * (BORROW_REQUEST_STATUS_CHANGED) — because one notification can never serve
 * both users. Nothing is created when the status did not actually change,
 * which is what keeps repeated/retried status updates from duplicating.
 */
async function notifyBorrowStatusChange({ request, previousStatus, actor = null }) {
  if (!request) return null;

  const newStatus = request.status;
  if (!newStatus) return null;
  if (previousStatus && previousStatus === newStatus) return null; // no-op update

  const title = BORROW_STATUS_TITLE[newStatus] || "Borrow Request Updated";
  const text = BORROW_STATUS_TEXT[newStatus] || newStatus;
  const componentName = request.component_name || "component";

  const shared = {
    sender: actor || null,
    relatedEntityType: "BORROW",
    relatedEntityId: request._id,
    metadata: {
      componentName,
      componentId: request.component_id,
      quantity: request.quantity || 1,
      status: newStatus,
      previousStatus: previousStatus || null,
      borrowerName: request.borrower_name || "",
      ownerName: request.owner_name || "",
    },
  };

  const payloads = [
    {
      recipient: request.borrower_id,
      type: "BORROW_STATUS_CHANGED",
      title,
      message: `Your borrow request for "${componentName}" has been ${text}.`,
      ...shared,
    },
    {
      recipient: request.owner_id,
      type: "BORROW_REQUEST_STATUS_CHANGED",
      title,
      message: `The borrow request for "${componentName}" has been ${text}.`,
      ...shared,
    },
  ];

  const results = [];
  const seen = new Set();
  for (const payload of payloads) {
    const key = payload.recipient ? String(payload.recipient) : null;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    results.push(await createNotification(payload));
  }
  return results;
}

// ---------------------------------------------------------------------------
// Report events
// ---------------------------------------------------------------------------

async function notifyUserReported({ report, reporter, reportedUser }) {
  if (!report) return null;

  const reporterName =
    (reporter && reporter.name) || report.reporterName || "A user";

  const adminPayload = {
    type: "USER_REPORTED",
    title: "User Reported",
    message: `${reporterName} reported a user.`,
    relatedEntityType: "REPORT",
    relatedEntityId: report._id,
    metadata: {
      reportId: report._id,
      reporterId: report.reporter,
      reporterName,
      reportedUserId: report.reportedUser,
      reportedUserName:
        (reportedUser && reportedUser.name) || report.reportedUserName || "",
      reason: report.reason || "",
      status: report.status || "pending",
    },
  };

  // Admins always get it.
  await notifyAllAdmins(adminPayload);

  // Moderators only for the reported user's university (authoritative id
  // stored on the report document at creation time).
  const universityId = report.reportedUniversity;
  if (universityId) {
    await notifyModeratorsForUniversity(universityId, {
      ...adminPayload,
      type: "UNIVERSITY_USER_REPORTED",
      title: "User Reported",
      message: `${reporterName} reported a user at your university.`,
      metadata: { ...adminPayload.metadata, university: universityId },
    });
  }
}

module.exports = {
  createNotification,
  createNotifications,
  notifyUser,
  notifyAllAdmins,
  notifyModeratorsForUniversity,
  notifyAccountCreated,
  notifyAccountApproved,
  notifyAccountRejected,
  notifyNewUserRegistered,
  notifyUniversityNewStudent,
  notifyBorrowRequestReceived,
  notifyBorrowStatusChange,
  notifyUserReported,
};
