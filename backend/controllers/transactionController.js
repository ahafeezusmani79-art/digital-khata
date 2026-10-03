const Transaction = require("../models/Transaction");
const Customer = require("../models/Customer");

const createTransaction = async (req, res) => {
  try {
    const { customerId, type, amount, note } = req.body;

    if (!customerId || !type || !amount) {
      return res.status(400).json({
        message: "Customer, type, and amount are required",
      });
    }

    const customer = await Customer.findOne({
      _id: customerId,
      shopkeeperId: req.shopkeeperId,
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    if (!["GAVE", "GOT"].includes(type)) {
      return res.status(400).json({
        message: "Transaction type must be GAVE or GOT",
      });
    }

    if (
      type === "GAVE" &&
      customer.currentBalance + Number(amount) > customer.creditLimit
    ) {
      return res.status(400).json({
        message: "Credit limit exceeded",
      });
    }

    const transaction = await Transaction.create({
      customerId,
      shopkeeperId: req.shopkeeperId,
      type,
      amount,
      note,
    });

    if (type === "GAVE") {
      customer.currentBalance += Number(amount);
    } else {
      customer.currentBalance -= Number(amount);
    }

    await customer.save();

    res.status(201).json({
      message: "Transaction created successfully",
      transaction,
      currentBalance: customer.currentBalance,
    });
  } catch (error) {
    console.error("Create transaction error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getTransactions = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findOne({
      _id: customerId,
      shopkeeperId: req.shopkeeperId,
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const transactions = await Transaction.find({
      customerId,
      shopkeeperId: req.shopkeeperId,
    }).sort({ date: -1 });

    res.status(200).json({
      transactions,
    });
  } catch (error) {
    console.error("Get transactions error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getTransactionSummary = async (req, res) => {
  try {
    const mongoose = require("mongoose");

    const gaveResult = await Transaction.aggregate([
      {
        $match: {
          shopkeeperId: new mongoose.Types.ObjectId(req.shopkeeperId),
          type: "GAVE",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const gotResult = await Transaction.aggregate([
      {
        $match: {
          shopkeeperId: new mongoose.Types.ObjectId(req.shopkeeperId),
          type: "GOT",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    res.status(200).json({
      totalGave: gaveResult[0]?.total || 0,
      totalGot: gotResult[0]?.total || 0,
    });
  } catch (error) {
    console.error("Get transaction summary error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};
const deleteTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    console.log("Delete transaction ID:", transactionId);
    console.log("Shopkeeper ID:", req.shopkeeperId);

    const transaction = await Transaction.findOne({
      _id: transactionId,
      shopkeeperId: req.shopkeeperId,
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    const customer = await Customer.findOne({
      _id: transaction.customerId,
      shopkeeperId: req.shopkeeperId,
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    if (transaction.type === "GAVE") {
      customer.currentBalance -= transaction.amount;
    } else {
      customer.currentBalance += transaction.amount;
    }

    await customer.save();

    await Transaction.findByIdAndDelete(transactionId);

    res.status(200).json({
      message: "Transaction deleted successfully",
      currentBalance: customer.currentBalance,
    });
  } catch (error) {
    console.error("Delete transaction error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
const updateTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { type, amount, note } = req.body;

    if (!type || !amount) {
      return res.status(400).json({
        message: "Type and amount are required",
      });
    }

    if (!["GAVE", "GOT"].includes(type)) {
      return res.status(400).json({
        message: "Transaction type must be GAVE or GOT",
      });
    }

    const transaction = await Transaction.findOne({
      _id: transactionId,
      shopkeeperId: req.shopkeeperId,
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    const customer = await Customer.findOne({
      _id: transaction.customerId,
      shopkeeperId: req.shopkeeperId,
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    // Remove the old transaction effect
    if (transaction.type === "GAVE") {
      customer.currentBalance -= transaction.amount;
    } else {
      customer.currentBalance += transaction.amount;
    }

    // Check credit limit with the new transaction
    if (
      type === "GAVE" &&
      customer.currentBalance + Number(amount) > customer.creditLimit
    ) {
      return res.status(400).json({
        message: "Credit limit exceeded",
      });
    }

    // Apply the new transaction effect
    if (type === "GAVE") {
      customer.currentBalance += Number(amount);
    } else {
      customer.currentBalance -= Number(amount);
    }

    transaction.type = type;
    transaction.amount = Number(amount);
    transaction.note = note || "";

    await transaction.save();
    await customer.save();

    res.status(200).json({
      message: "Transaction updated successfully",
      transaction,
      currentBalance: customer.currentBalance,
    });
  } catch (error) {
    console.error("Update transaction error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
const getRecentTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      shopkeeperId: req.shopkeeperId,
    })
      .populate("customerId", "name")
      .sort({ date: -1 })
      .limit(5);

    res.status(200).json({
      transactions,
    });
  } catch (error) {
    console.error("Get recent transactions error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionSummary,
  getRecentTransactions,
  updateTransaction,
  deleteTransaction,
};