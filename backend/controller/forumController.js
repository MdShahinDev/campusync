const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const ForumIssue = require("../model/ForumIssue");
const ForumComment = require("../model/ForumComment");
const ForumCategory = require("../model/ForumCategory");

// Only the fields the Forum needs, and never anything sensitive.
const USER_FIELDS = "name username role avatar";
const MAX_COMMENT_DEPTH = 20;

const validationFailed = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;
  res.status(400).json({
    success: false,
    message: "Validation failed",
    errors: errors.array().map((err) => ({ field: err.path, message: err.msg })),
  });
  return true;
};

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parsePositiveInt = (value, fallback, max) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
};

const SORTS = {
  latest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  discussed: { commentCount: -1, createdAt: -1 },
  activity: { lastActivityAt: -1, createdAt: -1 },
};

const ISSUE_POPULATE = [
  { path: "creator", select: USER_FIELDS },
  { path: "category", select: "name isSystem" },
];

// GET /api/forum/issues?page&limit&search&category&sort
exports.getForumIssues = async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const category = (req.query.category || "").trim();
    const sort = req.query.sort || "latest";
    const page = parsePositiveInt(req.query.page, 1, 100000);
    const limit = parsePositiveInt(req.query.limit, 10, 50);
    const skip = (page - 1) * limit;

    const filter = {};
    if (category) {
      if (!mongoose.isValidObjectId(category)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid category filter" });
      }
      filter.category = category;
    }
    if (search) {
      filter.title = { $regex: escapeRegex(search), $options: "i" };
    }

    const sortSpec = SORTS[sort] || SORTS.latest;

    const [issues, totalCount] = await Promise.all([
      ForumIssue.find(filter)
        .populate(ISSUE_POPULATE)
        .sort(sortSpec)
        .skip(skip)
        .limit(limit)
        .lean(),
      ForumIssue.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    res.status(200).json({
      success: true,
      data: {
        issues,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext: page * limit < totalCount,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get forum issues error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/forum/issues/:issueId
exports.getForumIssue = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.issueId)) {
      return res.status(404).json({ success: false, message: "Issue not found" });
    }

    const issue = await ForumIssue.findById(req.params.issueId)
      .populate(ISSUE_POPULATE)
      .lean();

    if (!issue) {
      return res.status(404).json({ success: false, message: "Issue not found" });
    }

    res.status(200).json({ success: true, data: { issue } });
  } catch (error) {
    console.error("Get forum issue error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// POST /api/forum/issues — any authenticated user; identity comes from the
// session only, so a client can never post as somebody else.
exports.createForumIssue = async (req, res) => {
  try {
    if (validationFailed(req, res)) return;

    const category = await ForumCategory.findById(req.body.category);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Selected category does not exist",
      });
    }

    const issue = await ForumIssue.create({
      title: req.body.title,
      description: req.body.description,
      category: category._id,
      creator: req.user._id,
      lastActivityAt: new Date(),
    });

    await issue.populate(ISSUE_POPULATE);

    res.status(201).json({
      success: true,
      message: "Issue posted successfully",
      data: { issue },
    });
  } catch (error) {
    console.error("Create forum issue error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/forum/issues/:issueId/comments?page&limit
// Paginates top-level comments and loads the replies of each page in one
// extra query, then rebuilds the thread tree.
exports.getIssueComments = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.issueId)) {
      return res.status(404).json({ success: false, message: "Issue not found" });
    }

    const issue = await ForumIssue.findById(req.params.issueId)
      .select("_id")
      .lean();
    if (!issue) {
      return res.status(404).json({ success: false, message: "Issue not found" });
    }

    const page = parsePositiveInt(req.query.page, 1, 100000);
    const limit = parsePositiveInt(req.query.limit, 20, 50);
    const skip = (page - 1) * limit;

    const [topLevel, totalCount] = await Promise.all([
      ForumComment.find({ issue: issue._id, parentComment: null })
        .populate("author", USER_FIELDS)
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ForumComment.countDocuments({ issue: issue._id, parentComment: null }),
    ]);

    // Load the rest of each thread level by level: children of the page's
    // top-level comments, then their children, and so on. One query per
    // depth level keeps deep threads correct without loading unrelated
    // threads or the whole issue at once.
    const replies = [];
    let parentIds = topLevel.map((comment) => comment._id);
    let depthLevel = 0;
    while (parentIds.length > 0 && depthLevel < MAX_COMMENT_DEPTH) {
      const batch = await ForumComment.find({
        issue: issue._id,
        parentComment: { $in: parentIds },
      })
        .populate("author", USER_FIELDS)
        .sort({ createdAt: 1 })
        .lean();
      if (batch.length === 0) break;
      replies.push(...batch);
      parentIds = batch.map((comment) => comment._id);
      depthLevel += 1;
    }

    const childrenByParent = new Map();
    for (const reply of replies) {
      const key = String(reply.parentComment);
      if (!childrenByParent.has(key)) childrenByParent.set(key, []);
      childrenByParent.get(key).push(reply);
    }

    const buildTree = (comment, depth) => {
      const node = { ...comment, depth, replies: [] };
      if (depth < MAX_COMMENT_DEPTH) {
        const children = childrenByParent.get(String(comment._id)) || [];
        node.replies = children.map((child) => buildTree(child, depth + 1));
      }
      return node;
    };

    const comments = topLevel.map((comment) => buildTree(comment, 0));
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    res.status(200).json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext: page * limit < totalCount,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get issue comments error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// POST /api/forum/issues/:issueId/comments — comment or reply
exports.createIssueComment = async (req, res) => {
  try {
    if (validationFailed(req, res)) return;

    if (!mongoose.isValidObjectId(req.params.issueId)) {
      return res.status(404).json({ success: false, message: "Issue not found" });
    }

    const issue = await ForumIssue.findById(req.params.issueId).select("_id");
    if (!issue) {
      return res.status(404).json({ success: false, message: "Issue not found" });
    }

    let parentComment = null;
    if (req.body.parentComment) {
      if (!mongoose.isValidObjectId(req.body.parentComment)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid parent comment" });
      }
      const parent = await ForumComment.findById(req.body.parentComment)
        .select("issue")
        .lean();
      if (!parent) {
        return res
          .status(400)
          .json({ success: false, message: "Parent comment not found" });
      }
      if (String(parent.issue) !== String(issue._id)) {
        return res.status(400).json({
          success: false,
          message: "Parent comment does not belong to this issue",
        });
      }
      parentComment = parent._id;
    }

    const comment = await ForumComment.create({
      issue: issue._id,
      author: req.user._id,
      content: req.body.content,
      parentComment,
    });

    await Promise.all([
      ForumIssue.updateOne(
        { _id: issue._id },
        { $inc: { commentCount: 1 }, $set: { lastActivityAt: new Date() } }
      ),
      comment.populate({ path: "author", select: USER_FIELDS }),
    ]);

    res.status(201).json({
      success: true,
      message: parentComment ? "Reply posted successfully" : "Comment posted successfully",
      data: { comment },
    });
  } catch (error) {
    console.error("Create issue comment error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
