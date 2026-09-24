const BorrowRequest = require("../model/BorrowRequest");
const Component = require("../model/Component");
const Notification = require("../model/Notification");

exports.createBorrowRequest = async (req, res) => {
  try {
    if (req.user.role === "student" && !req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Your account is not verified. Please wait for verification by an administrator before borrowing components.",
      });
    }

    const { component_id, expected_return_date, purpose, notes, quantity } = req.body;

    if (!component_id) {
      return res.status(400).json({
        success: false,
        message: "Component ID is required",
      });
    }

    if (!expected_return_date) {
      return res.status(400).json({
        success: false,
        message: "Expected return date is required",
      });
    }

    const requestQuantity = parseInt(quantity, 10);
    if (!requestQuantity || requestQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer",
      });
    }

    const component = await Component.findById(component_id);
    if (!component) {
      return res.status(404).json({
        success: false,
        message: "Component not found",
      });
    }

    if (!component.is_active) {
      return res.status(400).json({
        success: false,
        message: "This component is no longer available",
      });
    }

    if (component.available_quantity < requestQuantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient availability. Only ${component.available_quantity} unit(s) available.`,
      });
    }

    if (component.owner_id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot borrow your own component",
      });
    }

    const existingRequest = await BorrowRequest.findOne({
      component_id,
      borrower_id: req.user._id,
      status: { $in: ["pending", "approved", "borrowed", "return_requested"] },
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "You already have an active request for this component",
      });
    }

    const borrowRequest = await BorrowRequest.create({
      component_id,
      component_name: component.name,
      component_image: component.image_url || "",
      component_category: component.category,
      owner_id: component.owner_id,
      owner_name: component.owner_name,
      owner_username: component.owner_username,
      borrower_id: req.user._id,
      borrower_name: req.user.name,
      borrower_username: req.user.username || "",
      quantity: requestQuantity,
      expected_return_date: new Date(expected_return_date),
      purpose: purpose || "",
      notes: notes || "",
      status: "pending",
    });

    try {
      await Notification.create({
        userId: component.owner_id,
        senderId: req.user._id,
        title: "New Borrow Request",
        message: `${req.user.name} wants to borrow "${component.name}" x${requestQuantity}`,
        type: "info",
      });
    } catch (notifError) {
      console.error("Notification error:", notifError);
    }

    res.status(201).json({
      success: true,
      message: "Borrow request created successfully",
      data: { borrowRequest },
    });
  } catch (error) {
    console.error("Create borrow request error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

exports.getMyBorrowingHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, search, page = 1, limit = 20 } = req.query;

    const filter = { borrower_id: userId };

    if (status && status !== "all") {
      if (status === "overdue") {
        filter.status = { $in: ["borrowed", "return_requested"] };
        filter.expected_return_date = { $lt: new Date() };
      } else if (status === "active") {
        filter.status = { $in: ["pending", "approved", "borrowed", "return_requested"] };
      } else {
        filter.status = status;
      }
    }

    if (search) {
      filter.$or = [
        { component_name: { $regex: search, $options: "i" } },
        { component_category: { $regex: search, $options: "i" } },
        { owner_name: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [requests, totalCount] = await Promise.all([
      BorrowRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      BorrowRequest.countDocuments(filter),
    ]);

    const now = new Date();
    const enriched = requests.map((req) => {
      const isOverdue =
        ["borrowed", "return_requested"].includes(req.status) &&
        req.expected_return_date &&
        new Date(req.expected_return_date) < now;

      let overdueDays = 0;
      if (isOverdue) {
        const diff = now - new Date(req.expected_return_date);
        overdueDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
      }

      let duration = null;
      if (req.status === "returned" && req.borrowed_date && req.returned_date) {
        const diff = new Date(req.returned_date) - new Date(req.borrowed_date);
        duration = Math.ceil(diff / (1000 * 60 * 60 * 24));
      } else if (
        ["borrowed", "return_requested"].includes(req.status) &&
        req.borrowed_date
      ) {
        const diff = now - new Date(req.borrowed_date);
        duration = Math.ceil(diff / (1000 * 60 * 60 * 24));
      }

      return {
        ...req,
        is_overdue: isOverdue,
        overdue_days: overdueDays,
        duration_days: duration,
      };
    });

    const activeCount = await BorrowRequest.countDocuments({
      borrower_id: userId,
      status: { $in: ["borrowed", "return_requested"] },
    });

    const returnedCount = await BorrowRequest.countDocuments({
      borrower_id: userId,
      status: "returned",
    });

    const overdueCount = await BorrowRequest.countDocuments({
      borrower_id: userId,
      status: { $in: ["borrowed", "return_requested"] },
      expected_return_date: { $lt: now },
    });

    const pendingCount = await BorrowRequest.countDocuments({
      borrower_id: userId,
      status: { $in: ["pending", "approved"] },
    });

    res.status(200).json({
      success: true,
      data: {
        requests: enriched,
        summary: {
          active: activeCount,
          returned: returnedCount,
          overdue: overdueCount,
          pending: pendingCount,
        },
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalCount,
          hasNext: pageNum * limitNum < totalCount,
          hasPrev: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get my borrowing history error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getBorrowRequestById = async (req, res) => {
  try {
    const request = await BorrowRequest.findById(req.params.id)
      .populate({
        path: "borrower_id",
        select: "name username email phone department avatar university",
        populate: { path: "university", select: "name" },
      })
      .populate({
        path: "owner_id",
        select: "name username department avatar university",
        populate: { path: "university", select: "name" },
      })
      .populate({
        path: "component_id",
        select:
          "name description category condition image_url location buyingDate quantity available_quantity is_active owner_id owner_name owner_username university",
        populate: { path: "university", select: "name" },
      });
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Borrow request not found",
      });
    }

    const userId = req.user._id.toString();
    // Resolve refs that may be populated documents or raw ObjectIds
    const ownerId = request.owner_id && request.owner_id._id ? request.owner_id._id : request.owner_id;
    const borrowerId =
      request.borrower_id && request.borrower_id._id ? request.borrower_id._id : request.borrower_id;
    const isOwner = Boolean(ownerId && ownerId.toString() === userId);
    const isBorrower = Boolean(borrowerId && borrowerId.toString() === userId);
    const isAdmin = req.user.role === "admin";

    // Context-aware access: owner flow vs borrower flow (both still require a real relationship)
    const context = req.query.context;
    if (context === "owner") {
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Only the component owner can view this request",
        });
      }
    } else if (context === "borrower") {
      if (!isBorrower && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Only the borrower can view this request",
        });
      }
    } else if (!isOwner && !isBorrower && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this request",
      });
    }

    const now = new Date();
    const isOverdue =
      ["borrowed", "return_requested"].includes(request.status) &&
      request.expected_return_date &&
      new Date(request.expected_return_date) < now;

    let overdueDays = 0;
    if (isOverdue) {
      const diff = now - new Date(request.expected_return_date);
      overdueDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    res.status(200).json({
      success: true,
      data: {
        request: {
          ...request.toObject(),
          is_overdue: isOverdue,
          overdue_days: overdueDays,
        },
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Borrow request not found",
      });
    }
    console.error("Get borrow request error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.approveBorrowRequest = async (req, res) => {
  try {
    const request = await BorrowRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Borrow request not found",
      });
    }

    if (request.owner_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the component owner can approve this request",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This request cannot be approved",
      });
    }

    const component = await Component.findById(request.component_id);
    if (!component || component.available_quantity < request.quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient availability to approve this request",
      });
    }

    request.status = "approved";
    request.approved_date = new Date();
    await request.save();

    try {
      await Notification.create({
        userId: request.borrower_id,
        senderId: req.user._id,
        title: "Borrow Request Approved",
        message: `Your request to borrow "${request.component_name}" x${request.quantity} has been approved`,
        type: "success",
      });
    } catch (notifError) {
      console.error("Notification error:", notifError);
    }

    res.status(200).json({
      success: true,
      message: "Borrow request approved",
      data: { request },
    });
  } catch (error) {
    console.error("Approve borrow request error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.rejectBorrowRequest = async (req, res) => {
  try {
    const request = await BorrowRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Borrow request not found",
      });
    }

    if (request.owner_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the component owner can reject this request",
      });
    }

    if (!["pending", "approved"].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: "This request cannot be rejected",
      });
    }

    request.status = "rejected";
    await request.save();

    try {
      await Notification.create({
        userId: request.borrower_id,
        senderId: req.user._id,
        title: "Borrow Request Rejected",
        message: `Your request to borrow "${request.component_name}" has been rejected`,
        type: "warning",
      });
    } catch (notifError) {
      console.error("Notification error:", notifError);
    }

    res.status(200).json({
      success: true,
      message: "Borrow request rejected",
      data: { request },
    });
  } catch (error) {
    console.error("Reject borrow request error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.markAsBorrowed = async (req, res) => {
  try {
    const request = await BorrowRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Borrow request not found",
      });
    }

    if (request.owner_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the component owner can confirm handover",
      });
    }

    if (request.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved requests can be marked as borrowed",
      });
    }

    const component = await Component.findById(request.component_id);
    if (!component) {
      return res.status(404).json({
        success: false,
        message: "Component not found",
      });
    }

    const borrowQty = request.quantity || 1;
    if (component.available_quantity < borrowQty) {
      return res.status(400).json({
        success: false,
        message: "Insufficient availability to complete handover",
      });
    }

    request.status = "borrowed";
    request.borrowed_date = new Date();
    await request.save();

    component.available_quantity = Math.max(0, component.available_quantity - borrowQty);
    await component.save();

    try {
      await Notification.create({
        userId: request.borrower_id,
        senderId: req.user._id,
        title: "Component Handed Over",
        message: `"${request.component_name}" x${borrowQty} has been handed over to you`,
        type: "info",
      });
    } catch (notifError) {
      console.error("Notification error:", notifError);
    }

    res.status(200).json({
      success: true,
      message: "Component marked as borrowed",
      data: { request },
    });
  } catch (error) {
    console.error("Mark as borrowed error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.requestReturn = async (req, res) => {
  try {
    const request = await BorrowRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Borrow request not found",
      });
    }

    if (request.borrower_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the borrower can request a return",
      });
    }

    if (!["borrowed", "return_requested"].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: "This request cannot have a return requested",
      });
    }

    request.status = "return_requested";
    await request.save();

    try {
      await Notification.create({
        userId: request.owner_id,
        senderId: req.user._id,
        title: "Return Requested",
        message: `${req.user.name} wants to return "${request.component_name}"`,
        type: "info",
      });
    } catch (notifError) {
      console.error("Notification error:", notifError);
    }

    res.status(200).json({
      success: true,
      message: "Return requested successfully",
      data: { request },
    });
  } catch (error) {
    console.error("Request return error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.confirmReturn = async (req, res) => {
  try {
    const request = await BorrowRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Borrow request not found",
      });
    }

    if (request.owner_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the component owner can confirm return",
      });
    }

    if (request.status !== "return_requested") {
      return res.status(400).json({
        success: false,
        message: "Only return-requested items can be confirmed as returned",
      });
    }

    request.status = "returned";
    request.returned_date = new Date();
    await request.save();

    const component = await Component.findById(request.component_id);
    if (component) {
      const returnQty = request.quantity || 1;
      component.available_quantity = Math.min(
        component.available_quantity + returnQty,
        component.quantity
      );
      await component.save();
    }

    try {
      await Notification.create({
        userId: request.borrower_id,
        senderId: req.user._id,
        title: "Return Confirmed",
        message: `Your return of "${request.component_name}" has been confirmed`,
        type: "success",
      });
    } catch (notifError) {
      console.error("Notification error:", notifError);
    }

    res.status(200).json({
      success: true,
      message: "Return confirmed successfully",
      data: { request },
    });
  } catch (error) {
    console.error("Confirm return error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.cancelBorrowRequest = async (req, res) => {
  try {
    const request = await BorrowRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Borrow request not found",
      });
    }

    if (request.borrower_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the borrower can cancel this request",
      });
    }

    if (!["pending", "approved"].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: "This request cannot be cancelled",
      });
    }

    request.status = "cancelled";
    await request.save();

    res.status(200).json({
      success: true,
      message: "Borrow request cancelled",
      data: { request },
    });
  } catch (error) {
    console.error("Cancel borrow request error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getReceivedRequests = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;

    const filter = {
      owner_id: req.user._id,
      status: { $in: ["pending", "approved", "borrowed", "return_requested"] },
    };

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { component_name: { $regex: search, $options: "i" } },
        { borrower_name: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [requests, totalCount] = await Promise.all([
      BorrowRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      BorrowRequest.countDocuments(filter),
    ]);

    const pendingCount = await BorrowRequest.countDocuments({
      owner_id: req.user._id,
      status: "pending",
    });
    const approvedCount = await BorrowRequest.countDocuments({
      owner_id: req.user._id,
      status: "approved",
    });
    const borrowedCount = await BorrowRequest.countDocuments({
      owner_id: req.user._id,
      status: "borrowed",
    });
    const returnRequestedCount = await BorrowRequest.countDocuments({
      owner_id: req.user._id,
      status: "return_requested",
    });

    res.status(200).json({
      success: true,
      data: {
        requests,
        summary: {
          pending: pendingCount,
          approved: approvedCount,
          borrowed: borrowedCount,
          returnRequested: returnRequestedCount,
        },
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalCount,
          hasNext: pageNum * limitNum < totalCount,
          hasPrev: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get received requests error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getOwnerHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, search, page = 1, limit = 20 } = req.query;

    const filter = { owner_id: userId };

    if (status && status !== "all") {
      if (status === "active") {
        filter.status = { $in: ["pending", "approved", "borrowed", "return_requested"] };
      } else {
        filter.status = status;
      }
    }

    if (search) {
      filter.$or = [
        { component_name: { $regex: search, $options: "i" } },
        { borrower_name: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [requests, totalCount] = await Promise.all([
      BorrowRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      BorrowRequest.countDocuments(filter),
    ]);

    const now = new Date();
    const enriched = requests.map((r) => {
      const isOverdue =
        ["borrowed", "return_requested"].includes(r.status) &&
        r.expected_return_date &&
        new Date(r.expected_return_date) < now;

      let overdueDays = 0;
      if (isOverdue) {
        const diff = now - new Date(r.expected_return_date);
        overdueDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
      }

      let duration = null;
      if (r.status === "returned" && r.borrowed_date && r.returned_date) {
        const diff = new Date(r.returned_date) - new Date(r.borrowed_date);
        duration = Math.ceil(diff / (1000 * 60 * 60 * 24));
      } else if (["borrowed", "return_requested"].includes(r.status) && r.borrowed_date) {
        const diff = now - new Date(r.borrowed_date);
        duration = Math.ceil(diff / (1000 * 60 * 60 * 24));
      }

      return {
        ...r,
        is_overdue: isOverdue,
        overdue_days: overdueDays,
        duration_days: duration,
      };
    });

    const summary = {
      pending: await BorrowRequest.countDocuments({ owner_id: userId, status: "pending" }),
      approved: await BorrowRequest.countDocuments({ owner_id: userId, status: "approved" }),
      borrowed: await BorrowRequest.countDocuments({ owner_id: userId, status: "borrowed" }),
      returned: await BorrowRequest.countDocuments({ owner_id: userId, status: "returned" }),
      rejected: await BorrowRequest.countDocuments({ owner_id: userId, status: "rejected" }),
    };

    res.status(200).json({
      success: true,
      data: {
        requests: enriched,
        summary,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalCount,
          hasNext: pageNum * limitNum < totalCount,
          hasPrev: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get owner history error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getMyActiveRequestForComponent = async (req, res) => {
  try {
    const { component_id } = req.query;

    if (!component_id) {
      return res.status(400).json({
        success: false,
        message: "Component ID is required",
      });
    }

    const activeRequest = await BorrowRequest.findOne({
      component_id,
      borrower_id: req.user._id,
      status: { $in: ["pending", "approved", "borrowed", "return_requested"] },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        request: activeRequest || null,
      },
    });
  } catch (error) {
    console.error("Get active request error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
