const User = require("../models/user-model");
const Post = require("../models/post-model");
const Comment = require("../models/comment-model");
const cloudinary = require("../config/cloudinaryConfig");
const formidable = require("formidable");
const { default: mongoose } = require("mongoose");

const addPost = async (req, res) => {
  try {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res
          .status(400)
          .json({ msg: "error while adding post", err: err.message });
      }
      const post = new Post();

      try {
        if (fields.text) {
          const postText = Array.isArray(fields.text)
            ? fields.text.join("")
            : fields.text;
          post.content = postText;
        }

        if (
          files.media &&
          Array.isArray(files.media) &&
          files.media.length > 0
        ) {
          const mediaFiles = files.media[0];
          const uploadedImage = await cloudinary.uploader.upload(
            mediaFiles.filepath,
            { folder: "Threads_Clone/Posts" }
          );

          if (!uploadedImage) {
            return res.status(400).json({
              msg: "Error while uploading media",
            });
          }

          post.media = uploadedImage.secure_url;
          post.public_id = uploadedImage.public_id;
          post.admin = req.user._id;
          const newPost = await post.save();
          await User.findByIdAndUpdate(
            req.user._id,
            {
              $push: { threads: newPost._id },
            },
            { new: true }
          );
          res.status(201).json({ msg: "Post Created", newPost });
        }
      } catch (error) {
        return res.status(400).json({
          msg: "error inside form parse",
          error: error.message,
        });
      }
    });
  } catch (error) {
    return res.status(400).json({
      msg: "Error in add post controller",
      error: error.message,
    });
  }
};

const getAllPost = async (req, res) => {
  try {
    const { page } = req.query;
    let pageNumber = page;

    if (!page || page === undefined) {
      pageNumber = 1;
    }

    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * 3)
      .limit(3)
      .populate({ path: "admin", select: "-password" })
      .populate({ path: "likes", select: "-password" })
      .populate({
        path: "comments",
        populate: { path: "admin", model: "user" },
      });

    res.status(200).json({ msg: "All posts fetched", posts });
  } catch (error) {
    return res.status(400).json({
      msg: "Error in get all post controller",
      error: error.message,
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(200).json({
        msg: "ID is required",
      });
    }

    const isPostExits = await Post.findById(id);

    if (!isPostExits) {
      return res.status(400).json({
        msg: "Post not found !",
      });
    }

    const userId = req.user._id.toString();
    const adminId = isPostExits.admin._id.toString();

    if (userId !== adminId) {
      return res.status(400).json({
        msg: "You are not authorised to delete this post",
      });
    }

    if (isPostExits.media) {
      await cloudinary.uploader.destroy(isPostExits.public_id, (err, result) =>
        console.log({ err, result })
      );
    }

    await Comment.deleteMany({ _id: { $in: isPostExits.comments } });
    await User.updateMany(
      {
        $or: [{ threads: id }, { replies: id }, { repost: id }],
      },
      { $pull: { threads: id, repost: id, replies: id } },
      { new: true }
    );

    await Post.findByIdAndDelete(id);
    res.status(200).json({ msg: "Post deleted !" });
  } catch (error) {
    return res.status(400).json({
      msg: "Error in delete post controller",
      error: error.message,
    });
  }
};

const likePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        msg: "ID is required",
      });
    }

    const isPostExits = await Post.findById(id);

    if (!isPostExits) {
      return res.status(400).json({
        msg: "No such posts",
      });
    }

    if (isPostExits.likes.includes(req.user._id)) {
      await Post.findByIdAndUpdate(
        id,
        {
          $pull: { likes: req.user._id },
        },
        { new: true }
      );
      return res.status(200).json({
        msg: "Post unliked",
      });
    } else {
      await Post.findByIdAndUpdate(
        id,
        {
          $push: { likes: req.user._id },
        },
        { new: true }
      );
      return res.status(200).json({
        msg: "Post liked",
      });
    }
  } catch (error) {
    return res.status(400).json({
      msg: "Error in like post controller",
      error: error.message,
    });
  }
};

const repost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        msg: "ID is required",
      });
    }
    const isPostExits = await Post.findById(id);

    if (!isPostExits) {
      return res.status(400).json({
        msg: "No such post",
      });
    }

    const newId = new mongoose.Types.ObjectId(id);

    if (req.user.repost.includes(newId)) {
      return res.status(400).json({
        msg: "already reposted",
      });
    }

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: { repost: isPostExits._id },
      },
      { new: true }
    );

    res.status(201).json({
      msg: "Reposted",
    });
  } catch (error) {
    return res
      .status(400)
      .json({ msg: "Error in repost controller", error: error.message });
  }
};

const getPost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        msg: "ID is required",
      });
    }

    const isPostExits = await Post.findById(id)
      .populate({
        path: "admin",
        select: "-password",
      })
      .populate({ path: "likes", select: "-password" })
      .populate({
        path: "comments",
        populate: { path: "admin", select: "-password" },
      });

    res.status(200).json({ msg: "Post fetched", isPostExits });
  } catch (error) {
    return res.status(400).json({
      msg: "Error in get one post controller",
      error: error.message,
    });
  }
};

module.exports = { addPost, getAllPost, deletePost, likePost, repost, getPost };
