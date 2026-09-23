const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controller/categoryController");

const router = express.Router();

router.get("/", getCategories);
router.post("/", protect, authorize("admin", "moderator"), createCategory);
router.put("/:id", protect, authorize("admin", "moderator"), updateCategory);
router.delete("/:id", protect, authorize("admin", "moderator"), deleteCategory);

module.exports = router;
