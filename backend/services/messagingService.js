const mongoose = require("mongoose");
const Conversation = require("../model/Conversation");
const Message = require("../model/Message");
const User = require("../model/User");

const MAX_MESSAGE_LENGTH = Message.MAX_MESSAGE_LENGTH;
const DEFAULT_PAGE_SIZE = 30;
const MAX_PAGE_SIZE = 100;
const MAX_CONVERSATIONS = 100;
const MAX_SEARCH_RESULTS = 20;

/** Request/authorization failure that the controller/socket layer maps to a status code. */
class MessagingError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "MessagingError";
    this.status = status;
  }
}

const isValidObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(String(value || ""));

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseLimit = (value, fallback, max) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
};

const otherParticipant = (conversation, userId) => {
  const other = (conversation.participants || []).find(
    (participant) => String(participant._id || participant) !== String(userId)
  );
  if (!other) throw new MessagingError("Conversation participant not found", 404);
  return other._id || other;
};

/** Text messages only: trim, reject empty and over-long payloads. */
const normalizeContent = (rawContent) => {
  if (typeof rawContent !== "string") {
    throw new MessagingError("Message content is required");
  }
  const content = rawContent.trim();
  if (!content) {
    throw new MessagingError("Message cannot be empty");
  }
  if (content.length > MAX_MESSAGE_LENGTH) {
    throw new MessagingError(
      `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`
    );
  }
  return content;
};

const userFields = "name username role avatar isVerified";

/**
 * Find the direct conversation between two users or create it.
 *
 * Both users must exist, a user cannot message themselves, and the unique
 * `participantKey` index makes this safe against concurrent clicks - if two
 * requests race, the loser catches the duplicate key error and returns the
 * conversation that won.
 */
const findOrCreateConversation = async (initiatorId, otherUserId) => {
  if (!isValidObjectId(otherUserId)) {
    throw new MessagingError("Invalid user id");
  }
  if (String(initiatorId) === String(otherUserId)) {
    throw new MessagingError("You cannot start a conversation with yourself", 400);
  }

  const other = await User.findById(otherUserId)
    .select(userFields)
    .lean();
  if (!other) {
    throw new MessagingError("User not found", 404);
  }

  const participantKey = Conversation.buildParticipantKey(initiatorId, otherUserId);

  const existing = await Conversation.findOne({ participantKey });
  if (existing) return hydrateConversation(existing);

  try {
    const [created] = await Conversation.create([
      {
        participants: [initiatorId, otherUserId],
        participantKey,
        lastMessage: { content: "", sender: null, createdAt: null },
        lastMessageAt: null,
      },
    ]);
    return hydrateConversation(created);
  } catch (error) {
    if (error && error.code === 11000) {
      const winner = await Conversation.findOne({ participantKey });
      if (winner) return hydrateConversation(winner);
    }
    throw error;
  }
};

/**
 * Load a conversation only when the caller is one of its two participants.
 * Anything else is reported as 404 so foreign conversation ids cannot be
 * probed.
 */
const getConversationForUser = async (conversationId, userId) => {
  if (!isValidObjectId(conversationId)) {
    throw new MessagingError("Conversation not found", 404);
  }
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });
  if (!conversation) {
    throw new MessagingError("Conversation not found", 404);
  }
  return conversation;
};

const hydrateConversation = (conversation) => {
  const plain =
    typeof conversation.toObject === "function"
      ? conversation.toObject()
      : { ...conversation };
  delete plain.participantKey;
  return plain;
};

const unreadFor = (conversation, userId) => {
  const counts = conversation.unreadCounts;
  if (!counts) return 0;
  const value = typeof counts.get === "function" ? counts.get(String(userId)) : counts[userId];
  return typeof value === "number" ? value : 0;
};

const serializeConversation = (conversation, userId) => ({
  _id: conversation._id,
  participants: conversation.participants,
  lastMessage: conversation.lastMessage || { content: "", sender: null, createdAt: null },
  lastMessageAt: conversation.lastMessageAt || null,
  unreadCount: unreadFor(conversation, userId),
  createdAt: conversation.createdAt,
  updatedAt: conversation.updatedAt,
});

/** Server-side user search for the chat list - never ships the whole user table. */
const searchUsers = async (currentUserId, { search = "", limit } = {}) => {
  const max = parseLimit(limit, MAX_SEARCH_RESULTS, MAX_SEARCH_RESULTS);
  const filter = { _id: { $ne: currentUserId } };
  const term = String(search || "").trim();

  if (term) {
    const pattern = new RegExp(escapeRegex(term), "i");
    filter.$or = [{ name: pattern }, { username: pattern }, { email: pattern }];
  }

  const users = await User.find(filter)
    .select(userFields)
    .collation({ locale: "en", strength: 2 })
    .sort({ name: 1, username: 1 })
    .limit(max)
    .lean();

  return users;
};

const listConversations = async (userId, { limit } = {}) => {
  const max = parseLimit(limit, MAX_CONVERSATIONS, MAX_CONVERSATIONS);
  const conversations = await Conversation.find({ participants: userId })
    .populate("participants", "name username role avatar isVerified")
    .sort({ lastMessageAt: -1, createdAt: -1 })
    .limit(max)
    .lean();

  return conversations.map((conversation) =>
    serializeConversation(conversation, userId)
  );
};

/**
 * Cursor based history: returns the newest `limit` messages older than the
 * `before` cursor, oldest first, so the browser never receives the whole
 * conversation at once.
 */
const listMessages = async (conversationId, userId, { before, limit } = {}) => {
  await getConversationForUser(conversationId, userId);

  const max = parseLimit(limit, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const filter = { conversationId };

  if (before) {
    if (!isValidObjectId(before)) {
      throw new MessagingError("Invalid pagination cursor");
    }
    filter._id = { $lt: before };
  }

  const [messages, remaining] = await Promise.all([
    Message.find(filter)
      .sort({ _id: -1 })
      .limit(max + 1)
      .lean(),
    Message.countDocuments(
      before ? { conversationId, _id: { $lt: before } } : { conversationId }
    ),
  ]);

  const hasMore = messages.length > max;
  const page = hasMore ? messages.slice(0, max) : messages;
  page.reverse();

  return {
    messages: page,
    hasMore,
    nextCursor: hasMore && page.length ? page[0]._id : null,
    total: remaining,
  };
};

/**
 * Persist a message for an already authorized conversation.
 * Never trusts a caller supplied sender/receiver - both come from the
 * conversation document plus the authenticated identity.
 */
const sendMessage = async ({ conversation, senderId, rawContent, clientMessageId }) => {
  const content = normalizeContent(rawContent);
  const receiverId = otherParticipant(conversation, senderId);

  if (clientMessageId) {
    const existing = await Message.findOne({ senderId, clientMessageId }).lean();
    if (existing) return { message: existing, duplicate: true };
  }

  let message;
  try {
    message = await Message.create({
      conversationId: conversation._id,
      senderId,
      receiverId,
      content,
      messageType: "text",
      clientMessageId: clientMessageId || undefined,
    });
  } catch (error) {
    if (error && error.code === 11000 && clientMessageId) {
      const existing = await Message.findOne({ senderId, clientMessageId }).lean();
      if (existing) return { message: existing, duplicate: true };
    }
    throw error;
  }

  const updated = await Conversation.findByIdAndUpdate(
    conversation._id,
    {
      $set: {
        lastMessage: {
          content,
          sender: senderId,
          createdAt: message.createdAt,
        },
        lastMessageAt: message.createdAt,
      },
      $inc: { [`unreadCounts.${String(receiverId)}`]: 1 },
    },
    { new: true }
  ).lean();

  return { message, duplicate: false, conversation: updated, receiverId };
};

/**
 * Mark every message the reader received in this conversation as read.
 * Only messages addressed to the reader can ever be flipped.
 */
const markConversationRead = async (conversationId, readerId) => {
  const conversation = await getConversationForUser(conversationId, readerId);
  const readAt = new Date();

  const [result] = await Promise.all([
    Message.updateMany(
      { conversationId: conversation._id, receiverId: readerId, isRead: false },
      { $set: { isRead: true, readAt } }
    ),
    Conversation.updateOne(
      { _id: conversation._id },
      { $set: { [`unreadCounts.${String(readerId)}`]: 0 } }
    ),
  ]);

  return {
    conversationId: conversation._id,
    otherUserId: otherParticipant(conversation, readerId),
    updatedCount: result.modifiedCount || 0,
    readAt,
  };
};

/** Total unread messages addressed to the authenticated user. */
const getTotalUnread = (userId) =>
  Message.countDocuments({ receiverId: userId, isRead: false });

/** Users this account shares at least one conversation with (presence targets). */
const getContactIds = async (userId) => {
  const ids = await Conversation.distinct("participants", { participants: userId });
  return ids.map(String).filter((id) => id !== String(userId));
};

module.exports = {
  MessagingError,
  MAX_MESSAGE_LENGTH,
  normalizeContent,
  isValidObjectId,
  otherParticipant,
  findOrCreateConversation,
  getConversationForUser,
  serializeConversation,
  searchUsers,
  listConversations,
  listMessages,
  sendMessage,
  markConversationRead,
  getTotalUnread,
  getContactIds,
  parseLimit,
};
