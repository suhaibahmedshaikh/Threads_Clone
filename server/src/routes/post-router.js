const express = require("express");

const router = express.Router();

const { addPost, getAllPost } = require("../controllers/post-controller");
const auth = require("../middleware/auth");

router.get("/", auth, getAllPost);
router.post("/create", auth, addPost);

module.exports = router;
