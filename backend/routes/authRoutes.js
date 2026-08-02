const express = require("express");
const { body } = require("express-validator");
const {
  signup,
  login,
  getMe,
  adminSignup,
  updateProfile,
} = require("../controller/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

const signupValidation = [
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
  body("role")
    .optional()
    .isIn(["student", "moderator"])
    .withMessage("Invalid role"),
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

router.post("/signup", signupValidation, signup);
router.post("/admin/signup", adminSignupValidation, adminSignup);
router.post("/login", loginValidation, login);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

module.exports = router;
