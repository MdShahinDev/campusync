const Conversation = require("../model/Conversation");
const Message = require("../model/Message");
const User = require("../model/User");
const { put } = require("@vercel/blob");

exports.getOrCreateConversation = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot create conversation with yourself",
      });
    }

    const targetUser = await User.findById(userId).select("name username role avatar");
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, userId], $size: 2 },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, userId],
      });
    }

    const otherUser = await User.findById(userId).select("name username role avatar");
    const currentUser = await User.findById(req.user._id).select("name username role avatar");

    const participantIds = conversation.participants.map((p) => p.toString());
    const otherUserId = participantIds.find((id) => id !== req.user._id.toString());

    const other = await User.findById(otherUserId).select("name username role avatar");

    const unreadCount = await Message.countDocuments({
      conversationId: conversation._id,
      senderId: { $ne: req.user._id },
      readBy: { $ne: req.user._id },
    });

    res.status(200).json({
      success: true,
      data: {
        conversation: {
          _id: conversation._id,
          otherUser: other,
          lastMessage: conversation.lastMessage,
          lastMessageAt: conversation.lastMessageAt,
          unreadCount,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("GetOrCreateConversation error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    }).sort({ lastMessageAt: -1 });

    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = conv.participants.find(
          (p) => p.toString() !== req.user._id.toString()
        );
        const other = await User.findById(otherUserId).select("name username role avatar");

        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          senderId: { $ne: req.user._id },
          readBy: { $ne: req.user._id },
        });

        return {
          _id: conv._id,
          otherUser: other,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          unreadCount,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        };
      })
    );

    const totalUnread = conversationsWithDetails.reduce(
      (sum, c) => sum + c.unreadCount,
      0
    );

    res.status(200).json({
      success: true,
      data: {
        conversations: conversationsWithDetails,
        totalUnread,
      },
    });
  } catch (error) {
    console.error("GetConversations error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this conversation",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const totalMessages = await Message.countDocuments({ conversationId });

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("senderId", "name username role avatar");

    res.status(200).json({
      success: true,
      data: {
        messages: messages.reverse(),
        pagination: {
          page,
          limit,
          total: totalMessages,
          pages: Math.ceil(totalMessages / limit),
          hasMore: skip + messages.length < totalMessages,
        },
      },
    });
  } catch (error) {
    console.error("GetMessages error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, attachments } = req.body;

    const trimmedContent = content ? content.trim() : "";

    if (!trimmedContent && (!attachments || attachments.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Message content or attachment is required",
      });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this conversation",
      });
    }

    const message = await Message.create({
      conversationId,
      senderId: req.user._id,
      content: trimmedContent,
      attachments: attachments || [],
      readBy: [req.user._id],
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: trimmedContent || (attachments && attachments.length > 0 ? "[Attachment]" : ""),
      lastMessageAt: new Date(),
    });

    const populatedMessage = await Message.findById(message._id).populate(
      "senderId",
      "name username role avatar"
    );

    res.status(201).json({
      success: true,
      data: { message: populatedMessage },
    });
  } catch (error) {
    console.error("SendMessage error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this conversation",
      });
    }

    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: req.user._id },
        readBy: { $ne: req.user._id },
      },
      { $addToSet: { readBy: req.user._id } }
    );

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("MarkAsRead error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({
        success: false,
        message: "File storage not configured",
      });
    }

    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const ext = require("path").extname(req.file.originalname).toLowerCase();
    const blobName = `messages/${timestamp}-${random}${ext}`;

    const blob = await put(blobName, req.file.buffer, {
      contentType: req.file.mimetype,
      access: "public",
    });

    res.status(201).json({
      success: true,
      data: {
        attachment: {
          url: blob.url,
          fileName: req.file.originalname,
          fileType: req.file.mimetype,
          fileSize: req.file.size,
        },
      },
    });
  } catch (error) {
    console.error("UploadAttachment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload attachment",
    });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    });

    let totalUnread = 0;
    for (const conv of conversations) {
      const count = await Message.countDocuments({
        conversationId: conv._id,
        senderId: { $ne: req.user._id },
        readBy: { $ne: req.user._id },
      });
      totalUnread += count;
    }

    res.status(200).json({
      success: true,
      data: { unreadCount: totalUnread },
    });
  } catch (error) {
    console.error("GetUnreadCount error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
