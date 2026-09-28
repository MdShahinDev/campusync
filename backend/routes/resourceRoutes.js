const express = require("express");
const multer = require("multer");
const { protect, requireVerifiedModerator, requireActiveUser } = require("../middleware/auth");
const {
  uploadResource,
  getResources,
  getResourceById,
  deleteResource,
  downloadResource,
} = require("../controller/resourceController");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [".pdf", ".pptx", ".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const ext = require("path").extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, PPTX, and Image files are allowed."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

const router = express.Router();

// Writes require a verified account: unverified moderators keep read-only
// access (admins and students keep their existing per-controller rules).
router.post("/", protect, requireVerifiedModerator, requireActiveUser, upload.single("file"), uploadResource);
router.get("/", protect, getResources);
router.get("/:id", protect, getResourceById);
router.get("/:id/download", protect, requireActiveUser, downloadResource);
router.delete("/:id", protect, requireVerifiedModerator, requireActiveUser, deleteResource);

module.exports = router;
