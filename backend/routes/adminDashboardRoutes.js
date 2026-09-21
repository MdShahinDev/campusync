const express = require("express");
const router = express.Router();
const { getAdminDashboardStats } = require("../controller/adminDashboardController");
const { protect, authorize } = require("../middleware/auth");

router.get("/stats", protect, authorize("admin"), getAdminDashboardStats);

module.exports = router;
