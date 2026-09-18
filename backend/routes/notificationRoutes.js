const express = require("express");
const {
  getNotifications,
  getNotificationById,
  sendNotification,
  markAsRead,
  markAllAsRead,
} = require("../controller/notificationController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", getNotifications);
router.get("/:id", getNotificationById);
router.post("/", authorize("admin", "moderator"), sendNotification);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);

module.exports = router;
