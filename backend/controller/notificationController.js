const Notification = require("../model/Notification");
const User = require("../model/User");

const NOTIFICATION_SORT = { createdAt: -1, _id: -1 };

const parsePositiveInt = (value, fallback, max) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
};

const handleCastError = (res, error) => {
  if (error.name === "CastError") {
    res.status(404).json({ success: false, message: "Notification not found" });
    return true;
  }
  return false;
};

/**
 * GET /api/notifications
 * Inbox of the authenticated user only — the recipient is always taken from
 * the session, never from the query string.
 */
exports.getNotifications = async (req, res) => {
  try {
    const page = parsePositiveInt(req.query.page, 1, 10000);
    const limit = parsePositiveInt(req.query.limit, 20, 50);

    const filter = { recipient: req.user._id };
    if (req.query.unreadOnly === "true") filter.isRead = false;

    const [notifications, totalCount, unreadCount] = await Promise.all([
      Notification.find(filter)
        .populate("sender", "name username role avatar")
        .sort(NOTIFICATION_SORT)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasPrev: page > 1,
          hasNext: page < totalPages,
        },
      },
    });
  } catch (error) {
    if (handleCastError(res, error)) return;
    console.error("GetNotifications error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/** GET /api/notifications/unread-count — cheap badge counter. */
exports.getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });
    res.status(200).json({ success: true, data: { unreadCount } });
  } catch (error) {
    console.error("GetUnreadCount error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/notifications/:id
 * Read-only: opening the details page marks the notification as read through
 * PUT /:id/read so the unread count is only ever changed deliberately.
 * Another user's notification is reported as 404 so ids cannot be probed.
 */
exports.getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    })
      .populate("sender", "name username role avatar")
      .lean();

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, data: { notification } });
  } catch (error) {
    if (handleCastError(res, error)) return;
    console.error("GetNotificationById error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/** PUT /api/notifications/:id/read — only the recipient may flip the flag. */
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }

    res.status(200).json({
      success: true,
      data: { notification: notification.toObject() },
    });
  } catch (error) {
    if (handleCastError(res, error)) return;
    console.error("MarkAsRead error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/** PUT /api/notifications/read-all — explicit "mark all as read" action only. */
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: { modifiedCount: result.modifiedCount || 0 },
    });
  } catch (error) {
    console.error("MarkAllAsRead error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/** DELETE /api/notifications/:id — remove one of the user's own notifications. */
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted",
      data: { notification },
    });
  } catch (error) {
    if (handleCastError(res, error)) return;
    console.error("DeleteNotification error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * POST /api/notifications (admin/moderator only)
 * Direct message from an admin or moderator to one user. The moderator may
 * only message users of their own university.
 */
exports.sendNotification = async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: "userId, title, and message are required",
      });
    }

    const target = await User.findById(userId).select("_id name university role");
    if (!target) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (req.user.role === "moderator") {
      if (
        !req.user.university ||
        String(target.university) !== String(req.user.university)
      ) {
        return res.status(403).json({
          success: false,
          message: "You can only send notifications to users of your university",
        });
      }
    }

    const severities = ["info", "warning", "success", "alert"];
    const severity = severities.includes(type) ? type : "info";

    const notification = await Notification.create({
      recipient: target._id,
      sender: req.user._id,
      type: "ADMIN_MESSAGE",
      title: String(title).trim(),
      message: String(message).trim(),
      relatedEntityType: "USER",
      relatedEntityId: target._id,
      metadata: { severity, senderRole: req.user.role },
    });

    const populated = await Notification.findById(notification._id).populate(
      "sender",
      "name username role avatar"
    );

    res.status(201).json({
      success: true,
      message: "Notification sent successfully",
      data: { notification: populated },
    });
  } catch (error) {
    console.error("SendNotification error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
