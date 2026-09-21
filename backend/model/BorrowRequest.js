const mongoose = require("mongoose");

const borrowRequestSchema = new mongoose.Schema(
  {
    component_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Component",
      required: true,
    },
    component_name: {
      type: String,
      required: true,
    },
    component_image: {
      type: String,
      default: "",
    },
    component_category: {
      type: String,
      default: "",
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
    borrower_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    borrower_name: {
      type: String,
      required: true,
    },
    borrower_username: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "borrowed", "return_requested", "returned", "rejected", "cancelled"],
      default: "pending",
    },
    request_date: {
      type: Date,
      default: Date.now,
    },
    approved_date: {
      type: Date,
    },
    borrowed_date: {
      type: Date,
    },
    expected_return_date: {
      type: Date,
    },
    returned_date: {
      type: Date,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    purpose: {
      type: String,
      default: "",
      maxlength: 500,
    },
    notes: {
      type: String,
      default: "",
      maxlength: 500,
    },
  },
  { timestamps: true }
);

borrowRequestSchema.index({ borrower_id: 1, createdAt: -1 });
borrowRequestSchema.index({ owner_id: 1, createdAt: -1 });
borrowRequestSchema.index({ component_id: 1 });
borrowRequestSchema.index({ status: 1 });

module.exports = mongoose.model("BorrowRequest", borrowRequestSchema);
