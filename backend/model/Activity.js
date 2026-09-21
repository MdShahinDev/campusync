const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "USER_REGISTERED",
        "USER_APPROVED",
        "USER_REJECTED",
        "COMPONENT_CREATED",
        "COMPONENT_DELETED",
        "RESOURCE_UPLOADED",
        "RESOURCE_DELETED",
      ],
    },
    actor: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: { type: String },
      role: { type: String },
    },
    target: {
      id: { type: mongoose.Schema.Types.ObjectId },
      name: { type: String },
      model: { type: String, enum: ["User", "Component", "Resource"] },
    },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

activitySchema.index({ createdAt: -1 });

module.exports = mongoose.model("Activity", activitySchema);
