const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/auth");
const {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  uploadAttachment,
  getUnreadCount,
} = require("../controller/messageController");

const router = express.Router();

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"), false);
  }
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 },
});

router.use(protect);

router.post("/conversations", getOrCreateConversation);
router.get("/conversations", getConversations);
router.get("/conversations/:conversationId", getMessages);
router.post("/conversations/:conversationId/messages", sendMessage);
router.put("/conversations/:conversationId/read", markAsRead);
router.post("/upload", upload.single("file"), uploadAttachment);
router.get("/unread", getUnreadCount);

module.exports = router;
