const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Ticket = require("../model/Ticket");
const TicketMessage = require("../model/TicketMessage");
const User = require("../model/User");
const {
  notifyTicketCreated,
  notifyTicketReply,
  notifyTicketStatusChange,
} = require("../services/notificationService");

// Only the identity fields the UI needs — never passwords or credentials.
const USER_FIELDS = "name username role avatar";
const PREVIEW_LENGTH = 160;

const validationFailed = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;
  res.status(400).json({
    success: false,
    message: "Validation failed",
    errors: errors.array().map((err) => ({ field: err.path, message: err.msg })),
  });
  return true;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parsePositiveInt = (value, fallback, max) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
};

const SORTS = {
  latest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  activity: { lastActivityAt: -1, createdAt: -1 },
};

const LIST_POPULATE = [
  { path: "reporter", select: USER_FIELDS },
  { path: "handledBy", select: USER_FIELDS },
  { path: "lastMessageBy", select: USER_FIELDS },
];

const DETAIL_POPULATE = [
  { path: "reporter", select: USER_FIELDS },
  { path: "handledBy", select: USER_FIELDS },
  { path: "lastMessageBy", select: USER_FIELDS },
  { path: "statusHistory.changedBy", select: USER_FIELDS },
];

const reporterIdOf = (ticket) =>
  ticket.reporter && (ticket.reporter._id || ticket.reporter);

const isReporterOf = (ticket, user) => {
  const reporterId = reporterIdOf(ticket);
  return Boolean(reporterId && String(reporterId) === String(user._id));
};

/**
 * Server-side authorization for every single-report endpoint.
 *
 * admin     → all reports
 * reporter  → their own report
 * moderator → only reports whose reporter snapshot university matches their own
 * everyone else → 403 (never a 404 leak of which ids exist)
 */
const resolveTicketAccess = async (ticketId, user) => {
  if (!mongoose.isValidObjectId(ticketId)) {
    return { status: 404, message: "Report not found" };
  }

  const ticket = await Ticket.findById(ticketId)
    .populate(DETAIL_POPULATE)
    .lean();

  if (!ticket) return { status: 404, message: "Report not found" };
  if (user.role === "admin") return { ticket };
  if (isReporterOf(ticket, user)) return { ticket };

  if (user.role === "moderator") {
    const inScope =
      ticket.reporterUniversity &&
      user.university &&
      String(ticket.reporterUniversity) === String(user.university);
    if (inScope) return { ticket };
  }

  return { status: 403, message: "You are not authorized to access this report" };
};

/** List scope — mirrors resolveTicketAccess, applied as a query filter. */
const scopeFilterFor = (user) => {
  if (user.role === "admin") return {};
  if (user.role === "moderator") {
    // A moderator without a university can never be in scope for anything.
    if (!user.university) return { _id: { $in: [] } };
    return { reporterUniversity: user.university };
  }
  return { reporter: user._id };
};

/*
 * POST /api/tickets
 * Any authenticated user opens a report. Identity, university snapshot and the
 * default status always come from the backend — never from the request body.
 */
exports.createTicket = async (req, res) => {
  try {
    if (validationFailed(req, res)) return;

    const category = Ticket.TICKET_CATEGORIES.includes(req.body.category)
      ? req.body.category
      : "other";

    const ticket = await Ticket.create({
      subject: req.body.subject,
      description: req.body.description,
      category,
      status: "open",
      reporter: req.user._id,
      reporterUniversity: req.user.university || null,
      lastActivityAt: new Date(),
    });

    // Notifications only after the document actually exists.
    await notifyTicketCreated({ ticket, reporter: req.user });

    const populated = await Ticket.findById(ticket._id)
      .populate(DETAIL_POPULATE)
      .lean();

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      data: { ticket: populated },
    });
  } catch (error) {
    console.error("CreateTicket error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/*
 * GET /api/tickets?status&search&sort&page&limit
 * Scope, filtering, search and pagination are all done in the backend.
 */
exports.getTickets = async (req, res) => {
  try {
    const status = (req.query.status || "").trim();
    const search = (req.query.search || "").trim();
    const sort = req.query.sort || "latest";
    const page = parsePositiveInt(req.query.page, 1, 100000);
    const limit = parsePositiveInt(req.query.limit, 10, 50);
    const skip = (page - 1) * limit;

    const filter = scopeFilterFor(req.user);

    if (status) {
      if (!Ticket.TICKET_STATUSES.includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid status filter" });
      }
      filter.status = status;
    }

    if (search) {
      const pattern = { $regex: escapeRegex(search), $options: "i" };
      const matchingUsers = await User.find({ name: pattern })
        .select("_id")
        .limit(50)
        .lean();
      const clauses = [{ subject: pattern }];
      if (matchingUsers.length > 0) {
        clauses.push({ reporter: { $in: matchingUsers.map((u) => u._id) } });
      }
      filter.$or = clauses;
    }

    const sortSpec = SORTS[sort] || SORTS.latest;

    const [tickets, totalCount] = await Promise.all([
      Ticket.find(filter)
        .populate(LIST_POPULATE)
        .sort(sortSpec)
        .skip(skip)
        .limit(limit)
        .lean(),
      Ticket.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    res.status(200).json({
      success: true,
      data: {
        tickets,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext: page * limit < totalCount,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("GetTickets error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/*
 * GET /api/tickets/:ticketId
 */
exports.getTicketById = async (req, res) => {
  try {
    const resolved = await resolveTicketAccess(req.params.ticketId, req.user);
    if (resolved.status) {
      return res
        .status(resolved.status)
        .json({ success: false, message: resolved.message });
    }

    res.status(200).json({
      success: true,
      data: { ticket: resolved.ticket },
    });
  } catch (error) {
    console.error("GetTicketById error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/*
 * GET /api/tickets/:ticketId/messages?page&limit
 * Oldest first so the conversation always reads top to bottom.
 */
exports.getTicketMessages = async (req, res) => {
  try {
    const resolved = await resolveTicketAccess(req.params.ticketId, req.user);
    if (resolved.status) {
      return res
        .status(resolved.status)
        .json({ success: false, message: resolved.message });
    }

    const page = parsePositiveInt(req.query.page, 1, 100000);
    const limit = parsePositiveInt(req.query.limit, 20, 50);
    const skip = (page - 1) * limit;

    const [messages, totalCount] = await Promise.all([
      TicketMessage.find({ ticket: resolved.ticket._id })
        .populate("sender", USER_FIELDS)
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TicketMessage.countDocuments({ ticket: resolved.ticket._id }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext: page * limit < totalCount,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("GetTicketMessages error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/*
 * POST /api/tickets/:ticketId/messages
 *
 * - reporter replies only while the status is not "solved" (403 otherwise)
 * - admins and in-scope moderators may always reply
 * - a staff reply becomes the current handler and notifies the reporter
 */
exports.addTicketMessage = async (req, res) => {
  try {
    if (validationFailed(req, res)) return;

    const resolved = await resolveTicketAccess(req.params.ticketId, req.user);
    if (resolved.status) {
      return res
        .status(resolved.status)
        .json({ success: false, message: resolved.message });
    }

    const ticket = resolved.ticket;
    const isReporter = isReporterOf(ticket, req.user);

    if (isReporter && ticket.status === "solved") {
      return res.status(403).json({
        success: false,
        message: "This report has been solved. Further replies are disabled.",
      });
    }

    const content = req.body.message;
    const created = await TicketMessage.create({
      ticket: ticket._id,
      sender: req.user._id,
      message: content,
    });

    const isStaff =
      req.user.role === "admin" || req.user.role === "moderator";

    const update = {
      lastActivityAt: new Date(),
      lastMessagePreview: content.slice(0, PREVIEW_LENGTH),
      lastMessageBy: req.user._id,
    };
    if (isStaff) {
      update.handledBy = req.user._id;
      update.handledAt = new Date();
    }

    await Ticket.updateOne(
      { _id: ticket._id },
      { $inc: { messageCount: 1 }, $set: update }
    );

    if (isStaff) {
      await notifyTicketReply({ ticket, sender: req.user });
    }

    await created.populate({ path: "sender", select: USER_FIELDS });

    res.status(201).json({
      success: true,
      message: "Reply sent successfully",
      data: { message: created },
    });
  } catch (error) {
    console.error("AddTicketMessage error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/*
 * PATCH /api/tickets/:ticketId/status
 * Admin/moderator only (route level), scoped like every other endpoint.
 * The reporter is notified of the transition and the history entry records
 * who changed what and when.
 */
exports.updateTicketStatus = async (req, res) => {
  try {
    if (validationFailed(req, res)) return;

    const resolved = await resolveTicketAccess(req.params.ticketId, req.user);
    if (resolved.status) {
      return res
        .status(resolved.status)
        .json({ success: false, message: resolved.message });
    }

    const ticket = resolved.ticket;
    const nextStatus = req.body.status;

    if (nextStatus === ticket.status) {
      return res.status(200).json({
        success: true,
        message: "Report status updated",
        data: { ticket },
      });
    }

    const now = new Date();
    const updated = await Ticket.findByIdAndUpdate(
      ticket._id,
      {
        $set: {
          status: nextStatus,
          handledBy: req.user._id,
          handledAt: now,
          lastActivityAt: now,
        },
        $push: {
          statusHistory: {
            status: nextStatus,
            previous: ticket.status,
            changedBy: req.user._id,
            changedAt: now,
          },
        },
      },
      { new: true }
    )
      .populate(DETAIL_POPULATE)
      .lean();

    await notifyTicketStatusChange({
      ticket: { ...ticket, status: nextStatus },
      previousStatus: ticket.status,
      actor: req.user,
    });

    res.status(200).json({
      success: true,
      message: "Report status updated",
      data: { ticket: updated },
    });
  } catch (error) {
    console.error("UpdateTicketStatus error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
