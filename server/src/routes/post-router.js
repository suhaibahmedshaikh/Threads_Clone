const express = require("express");

const router = express.Router();

const {
  addPost,
  getAllPost,
  deletePost,
  likePost,
  repost,
  getPost,
} = require("../controllers/post-controller");
const auth = require("../middleware/auth");

router.get("/", auth, getAllPost);
router.get("/:id", auth, getPost);
router.post("/create", auth, addPost);
router.delete("/delete/:id", auth, deletePost);
router.put("/like/:id", auth, likePost);
router.put("/repost/:id", auth, repost);

module.exports = router;
