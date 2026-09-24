const mongoose = require("mongoose");

/**
 * User report — "this user should be reviewed".
 *
 * Kept deliberately small: it stores who reported whom and why, plus the
 * authoritative university of the reported user so moderator notifications and
 * moderator queries can be scoped without joining on every read.
 */
const userReportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reporter is required"],
    },
    reporterName: {
      type: String,
      default: "",
      trim: true,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reported user is required"],
    },
    reportedUserName: {
      type: String,
      default: "",
      trim: true,
    },
    reportedUserRole: {
      type: String,
      default: "",
    },
    reportedUniversity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      default: null,
    },
    reason: {
      type: String,
      required: [true, "Report reason is required"],
      trim: true,
      maxlength: 200,
    },
    details: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

userReportSchema.index({ reporter: 1, reportedUser: 1, status: 1 });
userReportSchema.index({ reportedUniversity: 1, createdAt: -1 });
userReportSchema.index({ createdAt: -1 });

module.exports = mongoose.model("UserReport", userReportSchema);
