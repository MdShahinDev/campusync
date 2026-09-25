const mongoose = require("mongoose");

/**
 * A direct (1:1) conversation between exactly two users.
 *
 * `participantKey` is the pair of participant ids in a stable (sorted) order
 * and carries a unique index, so the DATABASE - not the frontend - is what
 * guarantees that a given pair of users can never end up with two separate
 * conversations.
 *
 * `unreadCounts` is a denormalised per-participant counter so the conversation
 * list and the sidebar badge can be rendered without scanning messages.
 */
const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      ],
      validate: {
        validator: (participants) => participants.length === 2,
        message: "A direct conversation must have exactly two participants",
      },
    },
    participantKey: {
      type: String,
      required: true,
      unique: true,
    },
    lastMessage: {
      content: {
        type: String,
        default: "",
        maxlength: 2000,
      },
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      createdAt: {
        type: Date,
        default: null,
      },
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

// Conversation inbox: participants + newest activity first.
conversationSchema.index({ participants: 1, lastMessageAt: -1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

/** Stable key for a pair of user ids - order independent. */
Conversation.buildParticipantKey = (a, b) =>
  [String(a), String(b)].sort().join("_");

module.exports = Conversation;
