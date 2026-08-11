const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/auth");
const {
  uploadResource,
  getResources,
  getResourceById,
  deleteResource,
  getPublicResources,
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

router.get("/public", getPublicResources);
router.post("/", protect, upload.single("file"), uploadResource);
router.get("/", protect, getResources);
router.get("/:id", protect, getResourceById);
router.get("/:id/download", protect, downloadResource);
router.delete("/:id", protect, deleteResource);

module.exports = router;
