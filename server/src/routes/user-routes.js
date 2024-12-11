const express = require("express");

const router = express.Router();

const {
  signup,
  signin,
  getUserDetails,
  followUser,
  updateProfile,
  searchUser,
  signout,
} = require("../controllers/user-controller");
const auth = require("../middleware/auth");

router.post("/signup", signup);
router.post("/signin", signin);

router.post("/signout", auth, signout);
router.get("/profile/:id", auth, getUserDetails);
router.put("/follow/:id", auth, followUser);
router.put("/profile/update", auth, updateProfile);
router.get("/search/:query", auth, searchUser);

module.exports = router;
