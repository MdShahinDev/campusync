const express = require("express");
const {
  createReport,
  getReports,
  getReportById,
} = require("../controller/reportController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.post("/", createReport);
router.get("/", getReports);
router.get("/:id", getReportById);

module.exports = router;
