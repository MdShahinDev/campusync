const express = require("express");
const { protect, authorize, requireVerifiedModerator } = require("../middleware/auth");
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controller/categoryController");

const router = express.Router();

router.get("/", getCategories);
router.post(
  "/",
  protect,
  authorize("admin", "moderator"),
  requireVerifiedModerator,
  createCategory
);
router.put(
  "/:id",
  protect,
  authorize("admin", "moderator"),
  requireVerifiedModerator,
  updateCategory
);
router.delete(
  "/:id",
  protect,
  authorize("admin", "moderator"),
  requireVerifiedModerator,
  deleteCategory
);

module.exports = router;
