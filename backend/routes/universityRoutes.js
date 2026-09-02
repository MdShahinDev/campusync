const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const csvUpload = require("../middleware/upload");
const {
  createUniversity,
  importCSV,
  getAllUniversities,
  getUniversitiesWithCourses,
  getCoursesByUniversity,
  deleteUniversity,
  deleteCourse,
  bulkDeleteCourses,
} = require("../controller/universityController");

const router = express.Router();

router.get("/", protect, authorize("admin"), getAllUniversities);
router.get("/with-courses", protect, authorize("admin"), getUniversitiesWithCourses);
router.post("/", protect, authorize("admin"), createUniversity);
router.post("/import", protect, authorize("admin"), csvUpload.single("file"), importCSV);
router.post("/courses/bulk-delete", protect, authorize("admin"), bulkDeleteCourses);
router.delete("/courses/:courseId", protect, authorize("admin"), deleteCourse);
router.get("/:universityId/courses", protect, authorize("admin"), getCoursesByUniversity);
router.delete("/:universityId", protect, authorize("admin"), deleteUniversity);

module.exports = router;
