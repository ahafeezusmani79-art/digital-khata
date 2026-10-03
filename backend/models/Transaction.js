const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },

  shopkeeperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shopkeeper",
    required: true,
  },

  type: {
    type: String,
    enum: ["GAVE", "GOT"],
    required: true,
  },

  amount: {
    type: Number,
    required: true,
    min: 1,
  },

  note: {
    type: String,
    default: "",
    trim: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;