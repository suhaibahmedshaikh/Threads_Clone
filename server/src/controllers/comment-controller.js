const User = require("../models/user-model");
const Post = require("../models/post-model");
const Comment = require("../models/comment-model");
const { default: mongoose } = require("mongoose");

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!id) {
      return res.status(400).json({
        msg: "ID is required",
      });
    }

    if (!text) {
      return res.status(400).json({
        msg: "No comment is added",
      });
    }

    const isPostExits = await Post.findById(id);

    if (!isPostExits) {
      return res.status(400).json({
        msg: "No such Post",
      });
    }

    const comment = new Comment({
      text: text,
      admin: req.user._id,
      post: isPostExits._id,
    });

    const newComment = comment.save();

    await Post.findByIdAndUpdate(
      id,
      { $push: { comments: (await newComment)._id } },
      { new: true }
    );

    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { replies: (await newComment)._id } },
      { new: true }
    );

    res.status(200).json({
      msg: "comment added",
    });
  } catch (error) {
    return res.status(400).json({
      msg: "Error in add comment controller",
      error: error.message,
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { postId, id } = req.params;

    if (!postId || !id) {
      return res.status(400).json({
        msg: "Post id and comment id is required",
      });
    }

    const isPostExits = await Post.findById(postId);

    if (!isPostExits) {
      return res.status(400).json({
        msg: "No such Post exits",
      });
    }

    const isCommentExits = await Comment.findById(id);

    if (!isCommentExits) {
      return res.status(400).json({
        msg: "Comment not found",
      });
    }

    const newId = new mongoose.Types.ObjectId(id);
    if (isPostExits.comments.includes(newId)) {
      const id1 = isCommentExits.admin._id.toString();
      const id2 = req.user._id.toString();

      if (id1 !== id2) {
        return res.status(400).json({
          msg: "you are not authorised to delete this comment",
        });
      }

      await Post.findByIdAndUpdate(
        postId,
        { $pull: { comments: id } },
        { new: true }
      );

      await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { replies: id } },
        { new: true }
      );

      await Comment.findByIdAndDelete(id);
      return res.status(201).json({
        msg: "Comment Deleted",
      });
    }
    res.status(400).json({
      msg: "this post doesnt have comment",
    });
  } catch (error) {
    return res.status(400).json({
      msg: "Error in delete comment controller",
      error: error.message,
    });
  }
};

module.exports = { addComment, deleteComment };
