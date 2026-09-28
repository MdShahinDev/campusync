const express = require("express");
const {
  createReport,
  getReports,
  getReportById,
} = require("../controller/reportController");
const { protect, requireActiveUser } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.post("/", requireActiveUser, createReport);
router.get("/", getReports);
router.get("/:id", getReportById);

module.exports = router;
