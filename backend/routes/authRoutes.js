const express = require("express");
const path = require("path");
const multer = require("multer");
const { body } = require("express-validator");
const {
  signup,
  login,
  getMe,
  adminSignup,
  updateProfile,
  updateAvatar,
  removeAvatar,
  getUserAvatar,
  getAllUsers,
  getUserById,
  getUserByUsername,
  approveUser,
  rejectUser,
  deleteUser,
  suspendUser,
  unsuspendUser,
} = require("../controller/authController");
const {
  protect,
  authorize,
  requireVerifiedModerator,
  requireActiveUser,
} = require("../middleware/auth");

const AVATAR_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (!AVATAR_EXTENSIONS.includes(ext) || !AVATAR_MIME_TYPES.includes(file.mimetype)) {
      cb(new Error("Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed."), false);
      return;
    }

    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 },
});

// Convert multer errors into the API's usual JSON error shape.
const handleAvatarUpload = (req, res, next) => {
  avatarUpload.single("avatar")(req, res, (err) => {
    if (err) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "Profile photo must be 2MB or smaller"
          : err.message || "Invalid image upload";
      return res.status(400).json({ success: false, message });
    }
    next();
  });
};

const router = express.Router();

const signupValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .optional()
    .isIn(["student", "moderator"])
    .withMessage("Invalid role"),
  body("university")
    .trim()
    .notEmpty()
    .withMessage("University is required")
    .isMongoId()
    .withMessage("Invalid university selection"),
  body("studentId")
    .if(body("role").equals("student"))
    .trim()
    .notEmpty()
    .withMessage("Student ID is required for students"),
  body("department")
    .if(body("role").equals("student"))
    .trim()
    .notEmpty()
    .withMessage("Department is required for students"),
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

const adminSignupValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

router.get("/user/:username", protect, getUserByUsername);

router.post("/signup", signupValidation, signup);
router.post("/admin/signup", adminSignupValidation, adminSignup);
router.post("/login", loginValidation, login);
router.get("/me", protect, getMe);
router.put("/profile", protect, requireActiveUser, updateProfile);
router.put(
  "/avatar",
  protect,
  requireActiveUser,
  handleAvatarUpload,
  updateAvatar
);
router.delete("/avatar", protect, requireActiveUser, removeAvatar);
router.get("/users", protect, authorize("admin", "moderator"), getAllUsers);
// Public stream, same as GET /components/:id/image — <img> tags cannot carry a
// Bearer header, and profile photos are not access-controlled data.
router.get("/users/:id/avatar", getUserAvatar);
router.get("/users/:id", protect, authorize("admin", "moderator"), getUserById);
router.put(
  "/users/:id/approve",
  protect,
  authorize("admin"),
  requireActiveUser,
  approveUser
);
router.put(
  "/users/:id/reject",
  protect,
  authorize("admin"),
  requireActiveUser,
  rejectUser
);
router.delete(
  "/users/:id",
  protect,
  authorize("admin"),
  requireActiveUser,
  deleteUser
);

// Suspension — admin or a verified moderator, scoped by the controller
// (admins: global, moderators: students of their own university only).
router.put(
  "/users/:id/suspend",
  protect,
  authorize("admin", "moderator"),
  requireVerifiedModerator,
  requireActiveUser,
  suspendUser
);
router.put(
  "/users/:id/unsuspend",
  protect,
  authorize("admin", "moderator"),
  requireVerifiedModerator,
  requireActiveUser,
  unsuspendUser
);

module.exports = router;
