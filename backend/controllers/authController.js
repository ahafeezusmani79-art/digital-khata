const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Shopkeeper = require("../models/Shopkeeper");

const register = async (req, res) => {
  try {
    const { name, shopName, phone, password } = req.body;

    if (!name || !shopName || !phone || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    const existingShopkeeper = await Shopkeeper.findOne({ phone });

    if (existingShopkeeper) {
      return res.status(400).json({
        message: "Shopkeeper with this phone already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const shopkeeper = await Shopkeeper.create({
      name,
      shopName,
      phone,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: shopkeeper._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "Shopkeeper registered successfully",
      shopkeeper: {
        id: shopkeeper._id,
        name: shopkeeper.name,
        shopName: shopkeeper.shopName,
        phone: shopkeeper.phone,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// LOGIN
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Check required fields
    if (!phone || !password) {
      return res.status(400).json({
        message: "Please enter phone and password",
      });
    }

    // Find shopkeeper
    const shopkeeper = await Shopkeeper.findOne({ phone });

    if (!shopkeeper) {
      return res.status(401).json({
        message: "Invalid phone or password",
      });
    }

    // Compare password with hashed password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      shopkeeper.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid phone or password",
      });
    }

    // Create JWT
    const token = jwt.sign(
      { id: shopkeeper._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Store JWT in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      shopkeeper: {
        id: shopkeeper._id,
        name: shopkeeper.name,
        shopName: shopkeeper.shopName,
        phone: shopkeeper.phone,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};
const logout = (req, res) => {
  res.clearCookie("token");

  res.status(200).json({
    message: "Logout successful",
  });
};
const getMe = async (req, res) => {
  
  try {
    const shopkeeper = await Shopkeeper.findById(req.shopkeeperId).select(
      "-password"
    );

    if (!shopkeeper) {
      return res.status(404).json({
        message: "Shopkeeper not found",
      });
    }

    res.status(200).json({
      shopkeeper,
    });
  } catch (error) {
    console.error("Get me error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
};