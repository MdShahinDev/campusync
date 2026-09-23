const Category = require("../model/Category");
const Component = require("../model/Component");

const SYSTEM_CATEGORY = "Uncategory";

const ensureSystemCategory = async () => {
  let sys = await Category.findOne({ name: SYSTEM_CATEGORY });
  if (!sys) {
    sys = await Category.create({ name: SYSTEM_CATEGORY, isSystem: true });
  }
  return sys;
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { categories } });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const trimmed = name.trim();
    const existing = await Category.findOne({ name: { $regex: `^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }

    const category = await Category.create({ name: trimmed });
    res.status(201).json({ success: true, message: "Category created successfully", data: { category } });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const trimmed = name.trim();
    const duplicate = await Category.findOne({
      _id: { $ne: id },
      name: { $regex: `^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });
    if (duplicate) {
      return res.status(400).json({ success: false, message: "Category name already exists" });
    }

    const oldName = category.name;
    category.name = trimmed;
    await category.save();

    await Component.updateMany({ category: oldName }, { category: trimmed });

    res.status(200).json({ success: true, message: "Category updated successfully", data: { category } });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    if (category.name === SYSTEM_CATEGORY) {
      return res.status(400).json({ success: false, message: "Cannot delete the system fallback category" });
    }

    const sysCategory = await ensureSystemCategory();

    await Component.updateMany({ category: category.name }, { category: sysCategory.name });

    await Category.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};
