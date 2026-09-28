const express = require("express");
const multer = require("multer");
const { protect, requireVerifiedModerator, requireActiveUser } = require("../middleware/auth");
const {
  createComponent,
  getComponents,
  getComponentById,
  getMyComponents,
  updateComponent,
  deleteComponent,
  getComponentImage,
} = require("../controller/componentController");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const ext = require("path").extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = express.Router();

router.get("/public", getComponents);
router.get("/my", protect, getMyComponents);
// Writes require a verified account: unverified moderators keep read-only
// access (admins and students keep their existing per-controller rules).
router.post("/", protect, requireVerifiedModerator, requireActiveUser, upload.single("image"), createComponent);
router.get("/", protect, getComponents);
router.get("/:id/image", getComponentImage);
router.get("/:id", protect, getComponentById);
router.put("/:id", protect, requireVerifiedModerator, requireActiveUser, upload.single("image"), updateComponent);
router.delete("/:id", protect, requireVerifiedModerator, requireActiveUser, deleteComponent);

module.exports = router;
