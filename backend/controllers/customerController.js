const Customer = require("../models/Customer");

const createCustomer = async (req, res) => {
  try {
    const { name, phone, creditLimit } = req.body;

    // Check required fields
    if (!name || !phone) {
      return res.status(400).json({
        message: "Name and phone are required",
      });
    }

    // Create customer for the logged-in shopkeeper
    const customer = await Customer.create({
      shopkeeperId: req.shopkeeperId,
      name,
      phone,
      creditLimit: creditLimit || 5000,
    });

    res.status(201).json({
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    console.error("Create customer error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({
      shopkeeperId: req.shopkeeperId,
    });

    res.status(200).json({
      customers,
    });
  } catch (error) {
    console.error("Get customers error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};
const updateCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { name, phone, creditLimit } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        message: "Name and phone are required",
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

    customer.name = name;
    customer.phone = phone;

    if (creditLimit !== undefined) {
      customer.creditLimit = Number(creditLimit);
    }

    await customer.save();

    res.status(200).json({
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    console.error("Update customer error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
const deleteCustomer = async (req, res) => {
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

    await Customer.findByIdAndDelete(customerId);

    res.status(200).json({
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Delete customer error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
module.exports = {
  createCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer,
};
