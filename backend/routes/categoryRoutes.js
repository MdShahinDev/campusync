const express = require("express");
const { protect, authorize, requireVerifiedModerator, requireActiveUser } = require("../middleware/auth");
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
  requireActiveUser,
  createCategory
);
router.put(
  "/:id",
  protect,
  authorize("admin", "moderator"),
  requireVerifiedModerator,
  requireActiveUser,
  updateCategory
);
router.delete(
  "/:id",
  protect,
  authorize("admin", "moderator"),
  requireVerifiedModerator,
  requireActiveUser,
  deleteCategory
);

module.exports = router;
