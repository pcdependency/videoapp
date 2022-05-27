const express = require("express");
const router = express.Router();
const {
  checkFollowing,
  getFollow,
  updateFollow,
  updateProfile,
  registerUser,
  loginUser,
  updateLiked,
  verifyEmail,
  getProfileInfo,
  resendEmail,
  forgotPassword
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/update/profile/liked/:type/:media/:_id", protect, updateLiked)
router.post("/get/profile/:type", getFollow);
router.get("/check/profile/following/:_id", protect, checkFollowing);
router.post("/update/profile/info", protect, updateProfile);
router.post("/update/profile/:type/:_id", protect, updateFollow);
router.post("/register", registerUser);
router.post("/get/:type", protect, getProfileInfo);
router.post("/verify/email/:token", protect, verifyEmail);
router.post("/resend/email", protect, resendEmail);
router.post("/forgot/:type/:info", forgotPassword);
router.post("/login", loginUser);

module.exports = router;
