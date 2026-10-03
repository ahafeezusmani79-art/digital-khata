const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  shopkeeperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shopkeeper",
    required: true,
  },

  name: {
    type: String,
    required: true,
    trim: true,
  },

  phone: {
    type: String,
    required: true,
    trim: true,
  },

  currentBalance: {
    type: Number,
    default: 0,
  },

  creditLimit: {
    type: Number,
    default: 5000,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;