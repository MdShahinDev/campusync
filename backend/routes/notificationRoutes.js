const express = require("express");
const {
  getNotifications,
  getUnreadCount,
  getNotificationById,
  sendNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controller/notificationController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Every route is authenticated; the recipient is always derived from the
// session — no endpoint accepts an arbitrary recipient id for reading.
router.use(protect);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/read-all", markAllAsRead);
router.post("/", authorize("admin", "moderator"), sendNotification);

router.get("/:id", getNotificationById);
router.put("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

module.exports = router;
