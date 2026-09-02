const express = require("express");
const { protect } = require("../middleware/auth");
const University = require("../model/University");
const Course = require("../model/Course");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const universities = await University.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: { universities },
    });
  } catch (error) {
    console.error("Get universities error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/:universityId/courses", protect, async (req, res) => {
  try {
    const { universityId } = req.params;
    const courses = await Course.find({ universityId }).sort({ courseCode: 1 });
    res.status(200).json({
      success: true,
      data: { courses },
    });
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
