const express = require("express");

const router = express.Router();

const {
  signup,
  signin,
  getUserDetails,
} = require("../controllers/user-controller");

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/profile/:id", getUserDetails);

module.exports = router;
