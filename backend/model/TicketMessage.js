const mongoose = require("mongoose");

/**
 * One reply inside a support report conversation.
 *
 * The report itself owns the original description; every entry here is a
 * follow-up message from the reporter or from an authorized admin/moderator.
 * Only user references are stored — profiles are populated at read time.
 */
const ticketMessageSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: [true, "Report reference is required"],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [4000, "Message cannot exceed 4000 characters"],
    },
  },
  { timestamps: true }
);

// Conversation reads are always scoped to one report and oldest-first.
ticketMessageSchema.index({ ticket: 1, createdAt: 1 });

module.exports = mongoose.model("TicketMessage", ticketMessageSchema);
