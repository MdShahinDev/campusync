const mongoose = require("mongoose");

// One collection for both comments and replies. A reply is simply a comment
// whose parentComment points at the comment it answers, which keeps the
// relationship intact for any nesting depth.
const forumCommentSchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumIssue",
      required: [true, "Issue is required"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    content: {
      type: String,
      required: [true, "Comment cannot be empty"],
      trim: true,
      maxlength: [4000, "Comment must be 4000 characters or less"],
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumComment",
      default: null,
    },
  },
  { timestamps: true }
);

// Thread reads: top-level comments of an issue, then the replies of those.
forumCommentSchema.index({ issue: 1, parentComment: 1, createdAt: 1 });
forumCommentSchema.index({ issue: 1, createdAt: -1 });
forumCommentSchema.index({ parentComment: 1 });

module.exports = mongoose.model("ForumComment", forumCommentSchema);
