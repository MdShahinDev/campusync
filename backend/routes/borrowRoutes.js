const express = require("express");
const { protect, authorize, requireVerifiedModerator, requireActiveUser } = require("../middleware/auth");
const {
  createBorrowRequest,
  getMyBorrowingHistory,
  getBorrowRequestById,
  approveBorrowRequest,
  rejectBorrowRequest,
  markAsBorrowed,
  requestReturn,
  confirmReturn,
  cancelBorrowRequest,
  getReceivedRequests,
  getOwnerHistory,
  getMyActiveRequestForComponent,
  generateReturnQR,
  confirmReturnByToken,
  getBorrowHistory,
  getBorrowHistoryById,
  deleteBorrowHistoryRecord,
} = require("../controller/borrowController");

const router = express.Router();

// Public — QR scan confirmation (no auth; POST-only mutation)
router.post("/return/confirm", confirmReturnByToken);

router.use(protect);

router.get("/my-history", getMyBorrowingHistory);
router.get("/received", getReceivedRequests);
router.get("/owner-history", getOwnerHistory);
router.get("/active-request", getMyActiveRequestForComponent);

// Admin / Moderator centralized borrow history management (must be declared
// before "/:id" so "history" is never treated as a request id)
router.get("/history", authorize("admin", "moderator"), getBorrowHistory);
router.get(
  "/history/:id",
  authorize("admin", "moderator"),
  getBorrowHistoryById
);
router.delete(
  "/history/:id",
  authorize("admin", "moderator"),
  requireVerifiedModerator,
  requireActiveUser,
  deleteBorrowHistoryRecord
);

router.post("/", requireActiveUser, createBorrowRequest);
router.get("/:id", getBorrowRequestById);
router.put("/:id/approve", requireActiveUser, approveBorrowRequest);
router.put("/:id/reject", requireActiveUser, rejectBorrowRequest);
router.put("/:id/borrowed", requireActiveUser, markAsBorrowed);
router.put("/:id/return-request", requireActiveUser, requestReturn);
router.put("/:id/confirm-return", requireActiveUser, confirmReturn);
router.put("/:id/generate-return-qr", requireActiveUser, generateReturnQR);
router.put("/:id/cancel", requireActiveUser, cancelBorrowRequest);

module.exports = router;
