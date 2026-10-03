const express = require("express");

const {
  createCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createCustomer);
router.get("/", protect, getCustomers);
router.put("/:customerId", protect, updateCustomer);
router.delete("/:customerId", protect, deleteCustomer);

module.exports = router;