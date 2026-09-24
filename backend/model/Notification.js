const mongoose = require("mongoose");

/**
 * Canonical notification types.
 *
 * Every notification created anywhere in the backend MUST use one of these
 * explicit types — never free text or random strings.
 *
 * Student:
 *   ACCOUNT_CREATED, ACCOUNT_APPROVED, ACCOUNT_REJECTED,
 *   BORROW_REQUEST_RECEIVED, BORROW_STATUS_CHANGED,
 *   BORROW_REQUEST_STATUS_CHANGED
 *
 * Admin:
 *   NEW_USER_REGISTERED, USER_REPORTED
 *
 * Moderator (university scoped):
 *   UNIVERSITY_NEW_STUDENT_REGISTERED, UNIVERSITY_USER_REPORTED
 *
 * Other:
 *   ADMIN_MESSAGE  — direct message sent by an admin/moderator to a user
 *   SYSTEM_MESSAGE — legacy records migrated from the old notification system
 */
const NOTIFICATION_TYPES = [
  // Student
  "ACCOUNT_CREATED",
  "ACCOUNT_APPROVED",
  "ACCOUNT_REJECTED",
  "BORROW_REQUEST_RECEIVED",
  "BORROW_STATUS_CHANGED",
  "BORROW_REQUEST_STATUS_CHANGED",
  // Admin
  "NEW_USER_REGISTERED",
  "USER_REPORTED",
  // Moderator (university scoped)
  "UNIVERSITY_NEW_STUDENT_REGISTERED",
  "UNIVERSITY_USER_REPORTED",
  // Misc
  "ADMIN_MESSAGE",
  "SYSTEM_MESSAGE",
];

/** Entities a notification can point at (used by the details page). */
const RELATED_ENTITY_TYPES = ["USER", "BORROW", "REPORT", "COMPONENT"];

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Notification recipient is required"],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    type: {
      type: String,
      enum: {
        values: NOTIFICATION_TYPES,
        message: "`{VALUE}` is not a supported notification type",
      },
      required: [true, "Notification type is required"],
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      maxlength: 1000,
    },
    relatedEntityType: {
      type: String,
      enum: {
        values: [...RELATED_ENTITY_TYPES, null],
        message: "`{VALUE}` is not a supported related entity type",
      },
      default: null,
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Query patterns: inbox listing, unread badge and related-entity lookups.
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ relatedEntityId: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

Notification.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
Notification.RELATED_ENTITY_TYPES = RELATED_ENTITY_TYPES;

module.exports = Notification;
