const express = require("express");

const router = express.Router();

const {
  signup,
  signin,
  getUserDetails,
  followUser,
} = require("../controllers/user-controller");
const auth = require("../middleware/auth");

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/profile/:id", auth, getUserDetails);
router.put("/follow/:id", auth, followUser);

module.exports = router;
