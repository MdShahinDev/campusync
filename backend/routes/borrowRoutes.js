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
} = require("../controller/borrowController");

const router = express.Router();

router.use(protect);

router.get("/my-history", getMyBorrowingHistory);
router.get("/received", getReceivedRequests);
router.post("/", createBorrowRequest);
router.get("/:id", getBorrowRequestById);
router.put("/:id/approve", approveBorrowRequest);
router.put("/:id/reject", rejectBorrowRequest);
router.put("/:id/borrowed", markAsBorrowed);
router.put("/:id/return-request", requestReturn);
router.put("/:id/confirm-return", confirmReturn);
router.put("/:id/cancel", cancelBorrowRequest);

module.exports = router;
