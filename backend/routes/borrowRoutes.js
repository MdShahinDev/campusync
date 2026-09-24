const express = require("express");
const { protect } = require("../middleware/auth");
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
} = require("../controller/borrowController");

const router = express.Router();

// Public — QR scan confirmation (no auth; POST-only mutation)
router.post("/return/confirm", confirmReturnByToken);

router.use(protect);

router.get("/my-history", getMyBorrowingHistory);
router.get("/received", getReceivedRequests);
router.get("/owner-history", getOwnerHistory);
router.get("/active-request", getMyActiveRequestForComponent);
router.post("/", createBorrowRequest);
router.get("/:id", getBorrowRequestById);
router.put("/:id/approve", approveBorrowRequest);
router.put("/:id/reject", rejectBorrowRequest);
router.put("/:id/borrowed", markAsBorrowed);
router.put("/:id/return-request", requestReturn);
router.put("/:id/confirm-return", confirmReturn);
router.put("/:id/generate-return-qr", generateReturnQR);
router.put("/:id/cancel", cancelBorrowRequest);

module.exports = router;
