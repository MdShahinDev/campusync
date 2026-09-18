const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/auth");
const {
  createComponent,
  getComponents,
  getComponentById,
  getMyComponents,
  updateComponent,
  deleteComponent,
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
router.post("/", protect, upload.single("image"), createComponent);
router.get("/", protect, getComponents);
router.get("/:id", protect, getComponentById);
router.put("/:id", protect, upload.single("image"), updateComponent);
router.delete("/:id", protect, deleteComponent);

module.exports = router;
