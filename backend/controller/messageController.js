const { validationResult } = require("express-validator");
const {
  MessagingError,
  findOrCreateConversation,
  getConversationForUser,
  serializeConversation,
  searchUsers,
  listConversations,
  listMessages,
  sendMessage,
  markConversationRead,
  getTotalUnread,
  otherParticipant,
} = require("../services/messagingService");
const socketService = require("../services/socket");

/** Presence is held in memory by the socket layer and never persisted. */
const withPresence = (user) => ({
  ...user,
  online: socketService.isOnline(user._id),
});

const conversationWithPresence = (conversation, userId) => ({
  ...conversation,
  online: socketService.isOnline(otherParticipant(conversation, userId)),
});

/** Shared error mapping: authorization/lookup failures keep their status. */
const respondError = (res, error, label) => {
  if (error instanceof MessagingError) {
    return res
      .status(error.status)
      .json({ success: false, message: error.message });
  }
  if (error && error.name === "CastError") {
    return res
      .status(404)
      .json({ success: false, message: "Not found" });
  }
  if (error && error.name === "ValidationError") {
    return res.status(400).json({ success: false, message: error.message });
  }
  console.error(label, error);
  return res
    .status(500)
    .json({ success: false, message: "Internal server error" });
};

const validationFailed = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;
  res.status(400).json({
    success: false,
    message: "Validation failed",
    errors: errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    })),
  });
  return true;
};

/**
 * GET /api/messages/config
 * Tells the client whether this deployment can hold Socket.IO connections.
 * On serverless hosts (Vercel) the same REST API is used and the UI shows
 * that realtime delivery is unavailable instead of silently degrading.
 */
exports.getConfig = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { realTime: socketService.isEnabled() },
  });
};

/**
 * GET /api/messages/users?search=
 * Server-side search over the existing User collection. The caller is always
 * taken from the session and is excluded from their own results; only the
 * fields required to render a chat list are returned.
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await searchUsers(req.user._id, {
      search: req.query.search,
      limit: req.query.limit,
    });
    res.status(200).json({
      success: true,
      data: { users: users.map(withPresence) },
    });
  } catch (error) {
    respondError(res, error, "Search messaging users error:");
  }
};

/** GET /api/messages/conversations - inbox of the authenticated user. */
exports.getConversations = async (req, res) => {
  try {
    const conversations = await listConversations(req.user._id, {
      limit: req.query.limit,
    });
    res.status(200).json({
      success: true,
      data: {
        conversations: conversations.map((conversation) =>
          conversationWithPresence(conversation, req.user._id)
        ),
      },
    });
  } catch (error) {
    respondError(res, error, "Get conversations error:");
  }
};

/**
 * POST /api/messages/conversations { userId }
 * Find-or-create the single direct conversation with another user.
 * Enforced server side by the unique participantKey index - never by the UI.
 */
exports.createConversation = async (req, res) => {
  if (validationFailed(req, res)) return;
  try {
    const conversation = await findOrCreateConversation(
      req.user._id,
      req.body.userId
    );
    const serialized = conversationWithPresence(
      serializeConversation(conversation, req.user._id),
      req.user._id
    );

    // Let the other participant learn about a brand new conversation.
    socketService.notifyConversationNew(conversation, req.user._id);

    res.status(200).json({ success: true, data: { conversation: serialized } });
  } catch (error) {
    respondError(res, error, "Create conversation error:");
  }
};

/**
 * GET /api/messages/conversations/:id/messages?before=&limit=
 * Cursor paginated history, only for participants.
 */
exports.getMessages = async (req, res) => {
  if (validationFailed(req, res)) return;
  try {
    const data = await listMessages(req.params.id, req.user._id, {
      before: req.query.before,
      limit: req.query.limit,
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
    respondError(res, error, "Get messages error:");
  }
};

/**
 * POST /api/messages/conversations/:id/messages { content, clientMessageId? }
 * Persistence endpoint used when Socket.IO is unavailable (serverless hosts)
 * and as the reliable fallback path. Sender identity comes from the session.
 */
exports.postMessage = async (req, res) => {
  if (validationFailed(req, res)) return;
  try {
    const conversation = await getConversationForUser(
      req.params.id,
      req.user._id
    );

    const result = await sendMessage({
      conversation,
      senderId: req.user._id,
      rawContent: req.body.content,
      clientMessageId: req.body.clientMessageId,
    });

    const payload = {
      message: result.message,
      conversation: conversationWithPresence(
        serializeConversation(result.conversation || conversation, req.user._id),
        req.user._id
      ),
    };

    if (!result.duplicate) {
      const receiverId = String(result.receiverId);
      await socketService.notifyMessageNew(payload.message, result.conversation || conversation);
      const total = await getTotalUnread(receiverId);
      socketService.notifyUnread(receiverId, total);
    }

    res.status(result.duplicate ? 200 : 201).json({
      success: true,
      data: payload,
    });
  } catch (error) {
    respondError(res, error, "Send message error:");
  }
};

/**
 * PUT /api/messages/conversations/:id/read
 * Only flips messages addressed to the caller; the sender is notified so the
 * UI can move from "Delivered" to "Read".
 */
exports.readConversation = async (req, res) => {
  if (validationFailed(req, res)) return;
  try {
    const result = await markConversationRead(req.params.id, req.user._id);

    socketService.notifyRead(
      result.conversationId,
      result.otherUserId,
      req.user._id,
      result.readAt
    );
    const total = await getTotalUnread(req.user._id);
    socketService.notifyUnread(req.user._id, total);

    res.status(200).json({
      success: true,
      data: {
        updatedCount: result.updatedCount,
        readAt: result.readAt,
        unreadTotal: total,
      },
    });
  } catch (error) {
    respondError(res, error, "Mark conversation read error:");
  }
};

/** GET /api/messages/unread-count - badge counter for the sidebar. */
exports.getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await getTotalUnread(req.user._id);
    res.status(200).json({ success: true, data: { unreadCount } });
  } catch (error) {
    respondError(res, error, "Get unread count error:");
  }
};
