const express = require("express");
const { body } = require("express-validator");
const {
  protect,
  authorize,
  requireVerifiedModerator,
  requireActiveUser,
} = require("../middleware/auth");
const Ticket = require("../model/Ticket");
const {
  createTicket,
  getTickets,
  getTicketById,
  getTicketMessages,
  addTicketMessage,
  updateTicketStatus,
} = require("../controller/ticketController");

const router = express.Router();

// The whole report system is authenticated-only — reading included.
router.use(protect);

const createTicketRules = [
  body("subject")
    .trim()
    .notEmpty()
    .withMessage("Subject is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Subject must be between 5 and 200 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 5, max: 8000 })
    .withMessage("Description must be between 5 and 8000 characters"),
  body("category")
    .optional({ values: "falsy" })
    .isIn(Ticket.TICKET_CATEGORIES)
    .withMessage("Invalid report type"),
];

const messageRules = [
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message cannot be empty")
    .isLength({ max: 4000 })
    .withMessage("Message cannot exceed 4000 characters"),
];

const statusRules = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(Ticket.TICKET_STATUSES)
    .withMessage("Invalid report status"),
];

/* ------------------------------ Reports ------------------------------ */
router.post("/", requireActiveUser, createTicketRules, createTicket);
router.get("/", getTickets);
router.get("/:ticketId", getTicketById);

/* ---------------------------- Conversation --------------------------- */
router.get("/:ticketId/messages", getTicketMessages);
// Replied-to reports: the reporter is locked out by status in the controller;
// unverified moderators keep the same read-only rule as the rest of the app.
router.post(
  "/:ticketId/messages",
  requireVerifiedModerator,
  requireActiveUser,
  messageRules,
  addTicketMessage
);

/* --------------------------- Status control -------------------------- */
router.patch(
  "/:ticketId/status",
  authorize("admin", "moderator"),
  requireVerifiedModerator,
  requireActiveUser,
  statusRules,
  updateTicketStatus
);

module.exports = router;
