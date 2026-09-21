const express = require("express");
const { body } = require("express-validator");
const { submitContactMessage } = require("../controller/contactController");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

const submitValidation = [
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
  body("subject")
    .trim()
    .notEmpty()
    .withMessage("Subject is required")
    .isLength({ min: 2, max: 200 })
    .withMessage("Subject must be between 2 and 200 characters"),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ min: 10, max: 5000 })
    .withMessage("Message must be between 10 and 5000 characters"),
];

router.post("/", optionalAuth, submitValidation, submitContactMessage);

module.exports = router;
