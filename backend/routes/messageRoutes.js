const express = require("express");
const { body, param } = require("express-validator");
const {
  getConfig,
  getUsers,
  getConversations,
  createConversation,
  getMessages,
  postMessage,
  readConversation,
  getUnreadCount,
} = require("../controller/messageController");
const { protect } = require("../middleware/auth");

const router = express.Router();

const MAX_MESSAGE_LENGTH = 2000;

// Every messaging route is authenticated; identity always comes from the
// session (req.user) - no route accepts a sender/recipient id from the client.
router.use(protect);

router.get("/config", getConfig);
router.get("/unread-count", getUnreadCount);
router.get("/users", getUsers);
router.get("/conversations", getConversations);

router.post(
  "/conversations",
  [
    body("userId")
      .isMongoId()
      .withMessage("A valid user id is required"),
  ],
  createConversation
);

router.get(
  "/conversations/:id/messages",
  [param("id").isMongoId().withMessage("Invalid conversation id")],
  getMessages
);

router.post(
  "/conversations/:id/messages",
  [
    param("id").isMongoId().withMessage("Invalid conversation id"),
    body("content")
      .isString()
      .withMessage("Message content must be text")
      .bail()
      .trim()
      .notEmpty()
      .withMessage("Message cannot be empty")
      .bail()
      .isLength({ max: MAX_MESSAGE_LENGTH })
      .withMessage(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`),
    body("clientMessageId")
      .optional({ values: "falsy" })
      .isString()
      .withMessage("Invalid idempotency key")
      .bail()
      .isLength({ max: 64 })
      .withMessage("Invalid idempotency key"),
  ],
  postMessage
);

router.put(
  "/conversations/:id/read",
  [param("id").isMongoId().withMessage("Invalid conversation id")],
  readConversation
);

module.exports = router;
