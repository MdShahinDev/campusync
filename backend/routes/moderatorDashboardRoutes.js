const express = require("express");
const {
  getModeratorDashboardStats,
  getModeratorPendingUsers,
  moderatorApproveUser,
  moderatorRejectUser,
} = require("../controller/moderatorDashboardController");
const { protect, authorize, requireVerifiedModerator } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.use(authorize("moderator"));

// Read-only for unverified moderators
router.get("/dashboard/stats", getModeratorDashboardStats);
router.get("/pending-users", getModeratorPendingUsers);

// Moderation actions require a verified account
router.put("/users/:id/approve", requireVerifiedModerator, moderatorApproveUser);
router.put("/users/:id/reject", requireVerifiedModerator, moderatorRejectUser);

module.exports = router;
