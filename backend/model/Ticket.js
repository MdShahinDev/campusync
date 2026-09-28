const mongoose = require("mongoose");

/**
 * Support report statuses — exactly the four workflow states the product
 * defines. Nothing else is ever written to this field.
 */
const TICKET_STATUSES = ["open", "in_progress", "solved", "reject"];

/**
 * Report types. The component Category model belongs to the component catalog
 * and does not fit support reports, so the type list lives as a fixed enum
 * here instead of inventing another category collection.
 */
const TICKET_CATEGORIES = [
  "account",
  "components",
  "borrowing",
  "resources",
  "messaging",
  "forum",
  "bug",
  "other",
];

/**
 * A support report ("ticket") opened by any authenticated user.
 *
 * Only references to other documents are stored — never copies of user data:
 *   reporter    → User  (the report owner)
 *   handledBy   → User  (last admin/moderator who replied or changed status)
 *   reporterUniversity → University (snapshot of the reporter's university so
 *                        moderator scoping stays correct even if the reporter
 *                        later changes profile data)
 */
const ticketSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      minlength: [5, "Subject must be at least 5 characters"],
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [5, "Description must be at least 5 characters"],
      maxlength: [8000, "Description cannot exceed 8000 characters"],
    },
    category: {
      type: String,
      enum: {
        values: TICKET_CATEGORIES,
        message: "`{VALUE}` is not a supported report type",
      },
      default: "other",
    },
    status: {
      type: String,
      enum: {
        values: TICKET_STATUSES,
        message: "`{VALUE}` is not a supported report status",
      },
      default: "open",
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reporter is required"],
    },
    reporterUniversity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      default: null,
    },
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    handledAt: {
      type: Date,
      default: null,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    // Denormalised preview of the newest reply so list pages never need to
    // walk every message of every ticket.
    lastMessagePreview: {
      type: String,
      default: "",
      maxlength: 200,
    },
    lastMessageBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: TICKET_STATUSES,
          required: true,
        },
        previous: {
          type: String,
          default: null,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Listing patterns: "my reports", staff queue by status/activity and the
// university scoped moderator queue.
ticketSchema.index({ reporter: 1, createdAt: -1 });
ticketSchema.index({ status: 1, createdAt: -1 });
ticketSchema.index({ reporterUniversity: 1, status: 1, createdAt: -1 });
ticketSchema.index({ lastActivityAt: -1 });

const Ticket = mongoose.model("Ticket", ticketSchema);

Ticket.TICKET_STATUSES = TICKET_STATUSES;
Ticket.TICKET_CATEGORIES = TICKET_CATEGORIES;

module.exports = Ticket;
