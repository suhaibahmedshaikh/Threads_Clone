const User = require("../models/user-model");
const Post = require("../models/post-model");
const Comment = require("../models/comment-model");
const cloudinary = require("../config/cloudinaryConfig");
const formidable = require("formidable");

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

module.exports = { addPost };