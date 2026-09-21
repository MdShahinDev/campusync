const express = require("express");
const {
  getModeratorDashboardStats,
  getModeratorPendingUsers,
  moderatorApproveUser,
  moderatorRejectUser,
} = require("../controller/moderatorDashboardController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.use(authorize("moderator"));

router.get("/dashboard/stats", getModeratorDashboardStats);
router.get("/pending-users", getModeratorPendingUsers);
router.put("/users/:id/approve", moderatorApproveUser);
router.put("/users/:id/reject", moderatorRejectUser);

module.exports = router;
