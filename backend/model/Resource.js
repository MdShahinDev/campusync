const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    resource_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    course_code: {
      type: String,
      required: [true, "Course code is required"],
      trim: true,
    },
    course_title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
    },
    resource_type: {
      type: String,
      required: [true, "Resource type is required"],
      enum: ["PDF", "PPTX", "Image"],
    },
    file_path: {
      type: String,
      required: [true, "File path is required"],
    },
    file_name: {
      type: String,
      required: [true, "File name is required"],
    },
    uploader_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    uploader_name: {
      type: String,
      required: true,
    },
    uploader_role: {
      type: String,
      required: true,
      enum: ["student", "moderator", "admin"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);
