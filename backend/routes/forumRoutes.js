const express = require("express");
const { body } = require("express-validator");
const { protect, authorize, requireVerifiedModerator, requireActiveUser } = require("../middleware/auth");
const {
  getForumCategories,
  createForumCategory,
  updateForumCategory,
  deleteForumCategory,
} = require("../controller/forumCategoryController");
const {
  getForumIssues,
  getForumIssue,
  createForumIssue,
  getIssueComments,
  createIssueComment,
} = require("../controller/forumController");

const router = express.Router();

// The whole Community Forum is authenticated-only — reading included.
router.use(protect);

const categoryNameRules = body("name")
  .trim()
  .notEmpty()
  .withMessage("Category name is required")
  .isLength({ min: 2, max: 60 })
  .withMessage("Category name must be between 2 and 60 characters");

const categoryDescriptionRules = body("description")
  .optional({ values: "falsy" })
  .trim()
  .isLength({ max: 200 })
  .withMessage("Category description must be 200 characters or less");

const createCategoryValidation = [categoryNameRules, categoryDescriptionRules];
const updateCategoryValidation = [categoryNameRules, categoryDescriptionRules];

const createIssueValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 5, max: 8000 })
    .withMessage("Description must be between 5 and 8000 characters"),
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Invalid category"),
];

const createCommentValidation = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Comment cannot be empty")
    .isLength({ max: 4000 })
    .withMessage("Comment must be 4000 characters or less"),
  body("parentComment")
    .optional({ values: "falsy" })
    .trim()
    .isMongoId()
    .withMessage("Invalid parent comment"),
];

/* ------------------------- Forum categories ------------------------- */
router.get("/categories", getForumCategories);
router.post(
  "/categories",
  authorize("admin", "moderator"),
  requireVerifiedModerator,
  requireActiveUser,
  createCategoryValidation,
  createForumCategory
);
router.put(
  "/categories/:id",
  authorize("admin", "moderator"),
  requireVerifiedModerator,
  requireActiveUser,
  updateCategoryValidation,
  updateForumCategory
);
router.delete(
  "/categories/:id",
  authorize("admin", "moderator"),
  requireVerifiedModerator,
  requireActiveUser,
  deleteForumCategory
);

/* ----------------------------- Issues ------------------------------- */
router.get("/issues", getForumIssues);
router.post("/issues", requireActiveUser, createIssueValidation, createForumIssue);
router.get("/issues/:issueId", getForumIssue);

/* --------------------------- Comments ------------------------------- */
router.get("/issues/:issueId/comments", getIssueComments);
router.post(
  "/issues/:issueId/comments",
  requireActiveUser,
  createCommentValidation,
  createIssueComment
);

module.exports = router;
