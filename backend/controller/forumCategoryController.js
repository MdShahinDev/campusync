const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const ForumCategory = require("../model/ForumCategory");
const ForumIssue = require("../model/ForumIssue");

const UNCATEGORISED_NAME = ForumCategory.UNCATEGORISED_NAME;
const COLLATION = { locale: "en", strength: 2 };

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

/**
 * Idempotently guarantees the canonical "UnCategorised" category exists.
 * The case-insensitive unique index (plus the E11000 retry) makes it
 * impossible to end up with two of them, even under concurrent requests.
 */
const ensureUncategorised = async () => {
  const existing = await ForumCategory.findOne({
    name: UNCATEGORISED_NAME,
  }).collation(COLLATION);
  if (existing) return existing;

  try {
    return await ForumCategory.create({
      name: UNCATEGORISED_NAME,
      description: "Fallback category for issues without a specific category.",
      isSystem: true,
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return ForumCategory.findOne({ name: UNCATEGORISED_NAME }).collation(
        COLLATION
      );
    }
    throw error;
  }
};

const isUncategorised = (category) =>
  Boolean(category && (category.isSystem || category.name === UNCATEGORISED_NAME));

/*
 * GET /api/forum/categories
 * Every read makes sure the fallback category exists, so the category
 * dropdown always has at least one valid option.
 */
exports.getForumCategories = async (req, res) => {
  try {
    await ensureUncategorised();

    const categories = await ForumCategory.find()
      .collation(COLLATION)
      .sort({ isSystem: -1, name: 1 })
      .lean();

    const counts = await ForumIssue.aggregate([
      { $group: { _id: "$category", issueCount: { $sum: 1 } } },
    ]);
    const countByCategory = new Map(
      counts.map((entry) => [String(entry._id), entry.issueCount])
    );

    const items = categories.map((category) => ({
      ...category,
      issueCount: countByCategory.get(String(category._id)) || 0,
    }));

    res.status(200).json({ success: true, data: { categories: items } });
  } catch (error) {
    console.error("Get forum categories error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// POST /api/forum/categories — admin/moderator only
exports.createForumCategory = async (req, res) => {
  try {
    if (validationFailed(req, res)) return;

    const name = req.body.name;
    const description = req.body.description || "";

    const existing = await ForumCategory.findOne({ name }).collation(COLLATION);
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "A category with this name already exists" });
    }

    const category = await ForumCategory.create({ name, description });
    res
      .status(201)
      .json({ success: true, message: "Category created successfully", data: { category } });
  } catch (error) {
    if (error && error.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "A category with this name already exists" });
    }
    console.error("Create forum category error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// PUT /api/forum/categories/:id — admin/moderator only
exports.updateForumCategory = async (req, res) => {
  try {
    if (validationFailed(req, res)) return;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const category = await ForumCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const name = req.body.name;
    const description =
      req.body.description !== undefined ? req.body.description : category.description;

    // The canonical fallback may only have its display description edited —
    // renaming it would break the guaranteed "UnCategorised" contract.
    if (isUncategorised(category) && name !== category.name) {
      return res.status(400).json({
        success: false,
        message: "The UnCategorised category name cannot be changed",
      });
    }

    const duplicate = await ForumCategory.findOne({ name })
      .collation(COLLATION)
      .where("_id")
      .ne(category._id);
    if (duplicate) {
      return res
        .status(409)
        .json({ success: false, message: "A category with this name already exists" });
    }

    category.name = name;
    category.description = description;
    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: { category },
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "A category with this name already exists" });
    }
    console.error("Update forum category error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/*
 * DELETE /api/forum/categories/:id — admin/moderator only
 *
 * Issues are never deleted with their category: they are reassigned to
 * "UnCategorised" first, inside a transaction when the deployment supports
 * one (Atlas replica sets do; a standalone mongod falls back to the same two
 * writes in order, which still leaves every issue with a valid category).
 */
exports.deleteForumCategory = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const category = await ForumCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    if (isUncategorised(category)) {
      return res.status(400).json({
        success: false,
        message: "The UnCategorised category cannot be deleted",
      });
    }

    const fallback = await ensureUncategorised();
    let reassigned = 0;

    try {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const result = await ForumIssue.updateMany(
          { category: category._id },
          { $set: { category: fallback._id } },
          { session }
        );
        await ForumCategory.deleteOne({ _id: category._id }, { session });
        await session.commitTransaction();
        reassigned = result.modifiedCount;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } catch (error) {
      const unsupported =
        error.code === 20 ||
        error.codeName === "IllegalOperation" ||
        /transaction numbers/i.test(error.message || "");
      if (!unsupported) throw error;

      const result = await ForumIssue.updateMany(
        { category: category._id },
        { $set: { category: fallback._id } }
      );
      reassigned = result.modifiedCount;
      await ForumCategory.deleteOne({ _id: category._id });
    }

    res.status(200).json({
      success: true,
      message:
        reassigned > 0
          ? `Category deleted. ${reassigned} issue${reassigned === 1 ? "" : "s"} moved to UnCategorised.`
          : "Category deleted successfully",
      data: { reassigned },
    });
  } catch (error) {
    console.error("Delete forum category error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.ensureUncategorised = ensureUncategorised;
