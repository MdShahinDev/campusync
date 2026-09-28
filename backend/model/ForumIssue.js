const mongoose = require("mongoose");

const forumIssueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Issue title is required"],
      trim: true,
      maxlength: [200, "Issue title must be 200 characters or less"],
    },
    description: {
      type: String,
      required: [true, "Issue description is required"],
      trim: true,
      maxlength: [8000, "Issue description must be 8000 characters or less"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumCategory",
      required: [true, "Category is required"],
    },
    // Reference to the existing User model — never a copy of the profile.
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Maintained on every comment so "recent activity" sorting stays cheap.
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Forum list queries: newest / oldest / category page / by creator.
forumIssueSchema.index({ createdAt: -1 });
forumIssueSchema.index({ lastActivityAt: -1 });
forumIssueSchema.index({ category: 1, createdAt: -1 });
forumIssueSchema.index({ creator: 1, createdAt: -1 });

module.exports = mongoose.model("ForumIssue", forumIssueSchema);
