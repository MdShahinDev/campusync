const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: [true, "University ID is required"],
    },
    courseCode: {
      type: String,
      required: [true, "Course code is required"],
      trim: true,
      maxlength: [50, "Course code cannot exceed 50 characters"],
    },
    courseTitle: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [200, "Course title cannot exceed 200 characters"],
    },
    normalizedCourseCode: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

courseSchema.index(
  { universityId: 1, normalizedCourseCode: 1 },
  { unique: true }
);

module.exports = mongoose.model("Course", courseSchema);
