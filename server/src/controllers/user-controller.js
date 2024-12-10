const User = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/envConfig");

const signup = async (req, res) => {
  try {
    console.log(req.body);

    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        msg: "first name, email and password are required",
      });
    }

    const userExits = await User.findOne({ email });

    if (userExits) {
      return res.status(400).json({
        msg: "user already exits",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (!hashedPassword) {
      return res.status(400).json({
        msg: "error while hashing password",
      });
    }

    const newUser = await User.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
    });

    if (!newUser) {
      return res.status(400).json({
        msg: "error while registering a user",
      });
    }

    res.status(201).json({
      msg: `User registered successfully, Welcome ${userExits?.firstName}`,
    });
  } catch (err) {
    res.status(400).json({
      msg: "Error while signup !",
      err: err.message,
    });
  }
};

const signin = async (req, res) => {
  try {
    console.log(req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        msg: "email and password are required",
      });
    }

    const userExits = await User.findOne({ email });

    if (!userExits) {
      return res.status(400).json({
        msg: "user doesn't exits, please signup",
      });
    }

    const matchedPassword = await bcrypt.compare(password, userExits.password);

    if (!matchedPassword) {
      return res.status(400).json({
        msg: "invalid credentials",
      });
    }

    const accessToken = jwt.sign({ token: userExits._id }, JWT_SECRET, {
      expiresIn: "30d",
    });

    if (!accessToken) {
      return res.status(400).json({
        msg: "error while generating login token",
      });
    }

    res.cookie("token", accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({
      msg: `User logged in successfully, Hello ${userExits.firstName}`,
    });
  } catch (err) {
    res.status(400).json({
      msg: "Error while signin !",
      err: err.message,
    });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        msg: "id is required",
      });
    }

    const user = await User.findById(id)
      .select("-password")
      .populate("followers")
      .populate({
        path: "threads",
        populate: [{ path: "likes" }, { path: "comments" }, { path: "admin" }],
      })
      .populate({ path: "replies", populate: { path: "admin" } })
      .populate({
        path: "repost",
        populate: [{ path: "likes" }, { path: "comments" }, { path: "admin" }],
      });

    res.status(200).json({ msg: "user details fetched !!" }, user);
  } catch (err) {
    res.status(400).json({
      msg: "Error in get user details !",
      err: err.message,
    });
  }
};

module.exports = { signup, signin, getUserDetails };
