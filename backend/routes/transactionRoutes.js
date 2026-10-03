const express = require("express");

const {
  createTransaction,
  getTransactions,
  getTransactionSummary,
  updateTransaction,
  deleteTransaction,
  getRecentTransactions,
} = require("../controllers/transactionController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createTransaction);

router.get("/summary", protect, getTransactionSummary);

router.get("/recent", protect, getRecentTransactions);

router.put("/:transactionId", protect, updateTransaction);

router.delete("/:transactionId", protect, deleteTransaction);

router.get("/:customerId", protect, getTransactions);

module.exports = router;