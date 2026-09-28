const mongoose = require("mongoose");

// Canonical fallback category. Exactly one of these may exist and it can
// never be deleted, so every issue always has a valid category.
const UNCATEGORISED_NAME = "UnCategorised";

const forumCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [60, "Category name must be 60 characters or less"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Category description must be 200 characters or less"],
      default: "",
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Case-insensitive uniqueness: "UnCategorised", "uncategorised" and
// "UNCATEGORISED" can never coexist.
forumCategorySchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

const ForumCategory = mongoose.model("ForumCategory", forumCategorySchema);
ForumCategory.UNCATEGORISED_NAME = UNCATEGORISED_NAME;

module.exports = ForumCategory;
