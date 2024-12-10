const User = require("../models/user-model");
const { JWT_SECRET } = require("../config/envConfig");
const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(400).json({
        msg: "token required",
      });
    }

    const decodedToken = jwt.verify(token, JWT_SECRET);

    if (!decodedToken) {
      return res.status(400).json({
        msg: "error while decoding token",
      });
    }

    const user = await User.findById(decodedToken.token)
      .select("-password")
      .populate("followers");
    // .populate("threads")
    // .populate("replies")
    // .populate("reposts");

    if (!user) {
      return res.status(400).json({
        msg: "user not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(400).json({
      msg: "error in auth",
      error: error.message,
    });
  }
};

module.exports = auth;
