const express = require("express");

const router = express.Router();

const {
  signup,
  signin,
  getUserDetails,
  followUser,
  updateProfile,
} = require("../controllers/user-controller");
const auth = require("../middleware/auth");

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/profile/:id", auth, getUserDetails);
router.put("/follow/:id", auth, followUser);
router.put("/profile/update", auth, updateProfile);

module.exports = router;
