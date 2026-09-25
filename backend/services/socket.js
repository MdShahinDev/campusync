const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const User = require("../model/User");
const Conversation = require("../model/Conversation");
const allowedOrigins = require("../config/allowedOrigins");
const messagingService = require("./messagingService");
const { serializeConversation } = messagingService;

const PARTICIPANT_FIELDS = "name username role avatar isVerified";

let io = null;

/**
 * In-memory presence: userId -> Set(socketId).
 *
 * Presence is deliberately never persisted - a crashed/restarted server must
 * not leave anybody permanently "online". Multiple tabs of the same user are
 * tracked by socket id so the user only goes offline when the last tab closes.
 */
const presence = new Map();

const isOnline = (userId) => {
  const sockets = presence.get(String(userId));
  return !!(sockets && sockets.size > 0);
};

const addPresence = (userId, socketId) => {
  const key = String(userId);
  let sockets = presence.get(key);
  if (!sockets) {
    sockets = new Set();
    presence.set(key, sockets);
  }
  const wasOffline = sockets.size === 0;
  sockets.add(socketId);
  return wasOffline;
};

const removePresence = (userId, socketId) => {
  const key = String(userId);
  const sockets = presence.get(key);
  if (!sockets) return false;
  sockets.delete(socketId);
  if (sockets.size === 0) {
    presence.delete(key);
    return true;
  }
  return false;
};

const serializeForParticipant = async (conversation, participantId) => {
  const raw = typeof conversation.toObject === "function"
    ? conversation.toObject()
    : conversation;
  const needsPopulate =
    !raw.participants ||
    raw.participants.some((p) => !p || typeof p.name === "undefined");

  const hydrated = needsPopulate
    ? await Conversation.findById(raw._id)
        .populate("participants", PARTICIPANT_FIELDS)
        .lean()
    : raw;

  return serializeConversation(hydrated, participantId);
};

/** Broadcast to every connected tab of a user. No-op when sockets are off. */
const emitToUser = (userId, event, payload) => {
  if (!io || userId === undefined || userId === null) return;
  io.to(`user:${String(userId)}`).emit(event, payload);
};

const notifyPresence = async (userId, online) => {
  if (!io) return;
  try {
    const contacts = await messagingService.getContactIds(userId);
    for (const contactId of contacts) {
      emitToUser(contactId, "presence:update", {
        userId: String(userId),
        online,
      });
    }
  } catch (error) {
    console.error("Presence broadcast error:", error.message);
  }
};

/** message:new + the refreshed conversation for each participant's list. */
const notifyMessageNew = async (message, conversation) => {
  if (!io || !conversation) return;
  try {
    const participantIds = (conversation.participants || []).map((p) =>
      String(p._id || p)
    );
    for (const participantId of participantIds) {
      const serialized = await serializeForParticipant(conversation, participantId);
      emitToUser(participantId, "message:new", {
        message,
        conversation: serialized,
      });
    }
  } catch (error) {
    console.error("Broadcast message error:", error.message);
  }
};

/** A conversation that did not exist for the recipient until now. */
const notifyConversationNew = async (conversation, initiatorId) => {
  if (!io || !conversation) return;
  try {
    const participantIds = (conversation.participants || []).map((p) =>
      String(p._id || p)
    );
    for (const participantId of participantIds) {
      if (participantId === String(initiatorId)) continue;
      const serialized = await serializeForParticipant(conversation, participantId);
      emitToUser(participantId, "conversation:new", { conversation: serialized });
    }
  } catch (error) {
    console.error("Broadcast conversation error:", error.message);
  }
};

/** Read receipt for the sender of the messages that were just read. */
const notifyRead = (conversationId, otherUserId, readerId, readAt) => {
  emitToUser(otherUserId, "message:read", {
    conversationId: String(conversationId),
    readerId: String(readerId),
    readAt,
  });
};

/** Authoritative total unread badge value for one user. */
const notifyUnread = (userId, total) => {
  emitToUser(userId, "unread:update", { total });
};

// ---------------------------------------------------------------------------
// Socket.IO setup
// ---------------------------------------------------------------------------

const authenticate = async (socket, next) => {
  try {
    const handshake =
      socket.handshake.auth && typeof socket.handshake.auth === "object"
        ? socket.handshake.auth
        : {};
    let token = handshake.token || socket.handshake.query?.token;

    if (typeof token === "string" && token.startsWith("Bearer ")) {
      token = token.slice(7);
    }

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select(
      "name username role avatar"
    );

    if (!user) {
      return next(new Error("Authentication failed"));
    }

    socket.data.user = {
      _id: String(user._id),
      name: user.name,
      username: user.username,
      role: user.role,
      avatar: user.avatar || "",
    };
    next();
  } catch (error) {
    next(new Error("Authentication failed"));
  }
};

const registerHandlers = (socket) => {
  const currentUser = socket.data.user;
  const userId = currentUser._id;
  socket.join(`user:${userId}`);

  if (addPresence(userId, socket.id)) {
    notifyPresence(userId, true);
  }

  socket.data.joinedConversations = new Set();

  socket.on("conversation:join", async (payload, ack) => {
    try {
      const conversationId =
        typeof payload === "string" ? payload : payload?.conversationId;
      const conversation = await messagingService.getConversationForUser(
        conversationId,
        userId
      );

      await socket.join(`conversation:${String(conversation._id)}`);
      socket.data.joinedConversations.add(String(conversation._id));

      const otherId = String(
        messagingService.otherParticipant(conversation, userId)
      );

      if (typeof ack === "function") {
        ack({ ok: true, online: isOnline(otherId) });
      }
    } catch (error) {
      if (typeof ack === "function") {
        ack({
          ok: false,
          error: error.message || "Not authorized for this conversation",
          status: error.status || 400,
        });
      }
    }
  });

  socket.on("conversation:leave", (payload) => {
    const conversationId =
      typeof payload === "string" ? payload : payload?.conversationId;
    if (!conversationId) return;
    socket.leave(`conversation:${String(conversationId)}`);
    socket.data.joinedConversations?.delete(String(conversationId));
  });

  socket.on("message:send", async (payload, ack) => {
    const respond = (value) => {
      if (typeof ack === "function") ack(value);
    };

    try {
      if (!payload || typeof payload !== "object") {
        throw new messagingService.MessagingError("Malformed payload");
      }

      const conversation = await messagingService.getConversationForUser(
        payload.conversationId,
        userId
      );

      const result = await messagingService.sendMessage({
        conversation,
        senderId: userId,
        rawContent: payload.content,
        clientMessageId:
          typeof payload.clientMessageId === "string"
            ? payload.clientMessageId.slice(0, 64)
            : undefined,
      });

      if (!result.duplicate) {
        const receiverId = String(result.receiverId);
        await notifyMessageNew(result.message, result.conversation || conversation);
        const total = await messagingService.getTotalUnread(receiverId);
        notifyUnread(receiverId, total);
      }

      respond({
        ok: true,
        duplicate: !!result.duplicate,
        message: result.message,
      });
    } catch (error) {
      respond({
        ok: false,
        error: error.message || "Failed to send message",
        status: error.status || 400,
      });
    }
  });

  socket.on("typing:start", async (payload) => {
    const conversationId = payload?.conversationId;
    if (!conversationId) return;
    const key = String(conversationId);
    if (!socket.data.joinedConversations?.has(key)) return;

    socket.to(`conversation:${key}`).emit("typing:start", {
      conversationId: key,
      user: { _id: userId, name: currentUser.name },
    });
  });

  socket.on("typing:stop", (payload) => {
    const conversationId = payload?.conversationId;
    if (!conversationId) return;
    const key = String(conversationId);
    socket.to(`conversation:${key}`).emit("typing:stop", {
      conversationId: key,
      user: { _id: userId },
    });
  });

  socket.on("message:read", async (payload, ack) => {
    const respond = (value) => {
      if (typeof ack === "function") ack(value);
    };
    try {
      const conversationId = payload?.conversationId;
      const result = await messagingService.markConversationRead(
        conversationId,
        userId
      );

      notifyRead(
        result.conversationId,
        result.otherUserId,
        userId,
        result.readAt
      );
      const total = await messagingService.getTotalUnread(userId);
      notifyUnread(userId, total);

      respond({ ok: true, updatedCount: result.updatedCount });
    } catch (error) {
      respond({
        ok: false,
        error: error.message || "Failed to mark as read",
        status: error.status || 400,
      });
    }
  });

  socket.on("presence:query", (payload, ack) => {
    const ids = Array.isArray(payload?.userIds) ? payload.userIds.slice(0, 50) : [];
    if (typeof ack === "function") {
      ack({
        ok: true,
        online: Object.fromEntries(
          ids.map((id) => [String(id), isOnline(String(id))])
        ),
      });
    }
  });

  socket.on("disconnect", () => {
    const joined = socket.data.joinedConversations;
    if (joined) {
      for (const conversationId of joined) {
        socket.to(`conversation:${conversationId}`).emit("typing:stop", {
          conversationId,
          user: { _id: userId },
        });
      }
    }

    if (removePresence(userId, socket.id)) {
      notifyPresence(userId, false);
    }
  });
};

/**
 * Attach Socket.IO to the EXISTING http server created from the same Express
 * app - no second backend, no separate messaging service.
 *
 * Returns false when realtime is intentionally disabled (serverless hosts
 * such as Vercel cannot hold long lived websocket connections); the REST API
 * keeps working and the client is told about it through GET /messages/config.
 */
const initSocketServer = (httpServer) => {
  if (!httpServer) return false;

  io = new Server(httpServer, {
    path: "/socket.io",
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, origin || "*");
        } else {
          callback(new Error("Origin not allowed"));
        }
      },
      credentials: true,
      methods: ["GET", "POST"],
    },
    // Reconnection friendly defaults for flaky campus networks.
    pingTimeout: 20000,
    pingInterval: 25000,
  });

  io.use(authenticate);
  io.on("connection", registerHandlers);

  return true;
};

module.exports = {
  initSocketServer,
  isEnabled: () => !!io,
  getIO: () => io,
  isOnline,
  notifyMessageNew,
  notifyConversationNew,
  notifyRead,
  notifyUnread,
};
