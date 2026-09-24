const UserReport = require("../model/UserReport");
const User = require("../model/User");
const { notifyUserReported } = require("../services/notificationService");

const handleCastError = (res, error) => {
  if (error.name === "CastError") {
    res.status(404).json({ success: false, message: "Report not found" });
    return true;
  }
  return false;
};

/**
 * POST /api/reports
 * Any authenticated user can report another user. Notifications are created
 * here — only after the report document has actually been saved:
 *   - admins            → USER_REPORTED
 *   - moderators of the reported user's university → UNIVERSITY_USER_REPORTED
 *
 * The university used for moderator scoping always comes from the reported
 * user's stored profile, never from the request body.
 */
exports.createReport = async (req, res) => {
  try {
    const { reportedUser, reason, details } = req.body;

    if (!reportedUser || !reason || !String(reason).trim()) {
      return res.status(400).json({
        success: false,
        message: "reportedUser and reason are required",
      });
    }

    if (String(reportedUser) === String(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot report yourself",
      });
    }

    const target = await User.findById(reportedUser).select(
      "_id name role university"
    );
    if (!target) {
      return res
        .status(404)
        .json({ success: false, message: "Reported user not found" });
    }

    // Duplicate prevention: one open report per reporter/user pair.
    const existing = await UserReport.findOne({
      reporter: req.user._id,
      reportedUser: target._id,
      status: { $in: ["pending", "reviewed"] },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already reported this user",
      });
    }

    const report = await UserReport.create({
      reporter: req.user._id,
      reporterName: req.user.name || "",
      reportedUser: target._id,
      reportedUserName: target.name || "",
      reportedUserRole: target.role || "",
      reportedUniversity: target.university || null,
      reason: String(reason).trim(),
      details: details ? String(details).trim() : "",
    });

    // Business operation succeeded → now (and only now) create notifications.
    await notifyUserReported({
      report,
      reporter: req.user,
      reportedUser: target,
    });

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      data: { report },
    });
  } catch (error) {
    if (handleCastError(res, error)) return;
    console.error("CreateReport error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/reports
 * admin        → every report
 * moderator    → reports whose reported user belongs to their university
 * anyone else  → only their own reports
 */
exports.getReports = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "moderator") {
      if (!req.user.university) {
        return res.status(400).json({
          success: false,
          message: "Moderator is not associated with any university",
        });
      }
      filter.reportedUniversity = req.user.university;
    } else if (req.user.role !== "admin") {
      filter.reporter = req.user._id;
    }

    const reports = await UserReport.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.status(200).json({ success: true, data: { reports } });
  } catch (error) {
    console.error("GetReports error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/** GET /api/reports/:id — same scoping rules as the list endpoint. */
exports.getReportById = async (req, res) => {
  try {
    const report = await UserReport.findById(req.params.id).lean();
    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    }

    const isAdmin = req.user.role === "admin";
    const isReporter = String(report.reporter) === String(req.user._id);
    const isScopedModerator =
      req.user.role === "moderator" &&
      Boolean(req.user.university) &&
      String(report.reportedUniversity) === String(req.user.university);

    if (!isAdmin && !isReporter && !isScopedModerator) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    }

    res.status(200).json({ success: true, data: { report } });
  } catch (error) {
    if (handleCastError(res, error)) return;
    console.error("GetReportById error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
