const User = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/envConfig");
const cloudinary = require("../config/cloudinaryConfig");
const formidable = require("formidable");

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
      msg: `User registered successfully, Welcome ${newUser?.firstName}`,
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

const followUser = async (req, res) => {
  try {
    console.log(req.user._id);

    console.log(req.params.id);

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        msg: "id is required",
      });
    }

    const isUserExits = await User.findById(id);

    if (!isUserExits) {
      return res.status(400).json({
        msg: "user doesnt extis",
      });
    }

    if (isUserExits.followers.includes(req.user._id)) {
      await User.findByIdAndUpdate(
        isUserExits._id,
        {
          $pull: { followers: req.user._id },
        },
        { new: true }
      );
      return res.status(201).json({
        msg: `unfollowed ${isUserExits.firstName}`,
      });
    } else {
      await User.findByIdAndUpdate(
        isUserExits._id,
        { $push: { followers: req.user._id } },
        { new: true }
      );
      return res.status(201).json({
        msg: `following ${isUserExits.firstName}`,
      });
    }
  } catch (err) {
    res.status(400).json({ msg: "error in follow User", err: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    console.log(req);

    const isUserExits = await User.findById(req.user._id);

    if (!isUserExits) {
      return res.status(400).json({
        msg: "no user found !",
      });
    }

    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({
          msg: "error in formidable",
          err: err,
        });
      }

      try {
        if (fields.text) {
          const bioText = Array.isArray(fields.text)
            ? fields.text.join("")
            : fields.text;
          await User.findByIdAndUpdate(
            req.user._id,
            {
              bio: bioText,
            },
            { new: true }
          );
        }

        console.log("files received", files);
        console.log("files received", files.media[0]);

        if (
          files.media &&
          Array.isArray(files.media) &&
          files.media.length > 0
        ) {
          const mediaFiles = files.media[0];
          if (mediaFiles.filepath) {
            if (isUserExits.public_id) {
              await cloudinary.uploader.destroy(isUserExits.public_id);
            }
          }
          const uploadedImage = await cloudinary.uploader.upload(
            mediaFiles.filepath,
            { folder: "Threads_Clone/Profile" }
          );

          console.log(uploadedImage);

          if (!uploadedImage) {
            return res.status(400).json({
              msg: "error while uploading image",
            });
          }
          await User.findByIdAndUpdate(
            req.user._id,
            {
              profilePic: uploadedImage.secure_url,
              public_id: uploadedImage.public_id,
            },
            { new: true }
          );
        }
        res.status(201).json({
          msg: "profile updated successfully",
        });
      } catch (error) {
        return res.status(400).json({
          msg: "error inside form parse",
          error: error.message,
        });
      }
    });
  } catch (error) {
    return res.status(400).json({
      msg: "error in update profile controller",
      error: error.message,
    });
  }
};

const searchUser = async (req, res) => {
  try {
    const { query } = req.params;

    const users = await User.find({
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    }).select("-password");

    res.status(200).json({
      msg: "User found",
      users,
    });
  } catch (error) {
    return res.status(400).json({
      msg: "error in search user controller",
      error: error.message,
    });
  }
};

module.exports = {
  signup,
  signin,
  getUserDetails,
  followUser,
  updateProfile,
  searchUser,
};
