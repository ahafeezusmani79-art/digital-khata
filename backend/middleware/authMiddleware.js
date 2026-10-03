const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Not authorized. Please login.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.shopkeeperId = decoded.id;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};

module.exports = protect;