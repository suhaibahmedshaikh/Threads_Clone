const express = require("express");
const auth = require("../middleware/auth");
const {
  addComment,
  deleteComment,
} = require("../controllers/comment-controller");

const router = express.Router();

router.post("/:id", auth, addComment);
router.delete("/:postId/:id", auth, deleteComment);

module.exports = router;
