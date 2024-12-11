const express = require("express");

const router = express.Router();

const { addPost } = require("../controllers/post-controller");
const auth = require("../middleware/auth");

router.post("/create", auth, addPost);

module.exports = router;
