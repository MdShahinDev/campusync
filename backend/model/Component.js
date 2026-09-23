const mongoose = require("mongoose");

const componentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Component name is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner_name: {
      type: String,
      required: true,
    },
    owner_username: {
      type: String,
      default: "",
    },
    quantity: {
      type: Number,
      default: 1,
      min: 0,
    },
    available_quantity: {
      type: Number,
      default: 1,
      min: 0,
    },
    condition: {
      type: String,
      enum: ["New", "Excellent", "Good", "Fair", "Poor"],
      default: "Good",
    },
    image_url: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    buyingDate: {
      type: Date,
      default: null,
    },
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

componentSchema.index({ owner_id: 1 });
componentSchema.index({ category: 1 });
componentSchema.index({ university: 1 });
componentSchema.index({ name: "text", category: "text" });

module.exports = mongoose.model("Component", componentSchema);
