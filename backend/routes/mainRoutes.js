const express = require("express");
const router = express.Router();
const {
  uploadFile,
  streamFile,
  getVideo,
  getProfile,
  getVideos,
} = require("../controllers/mainController");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");

router.get("/videos/:page/:requested/:requesting/:_id", getVideos);
router.get("/profile/:_id", getProfile);
router.get("/video/:_id/:user_id", getVideo);
router.get("/stream/:collection/:resolution/:_id", streamFile);
router.post("/upload/:collection", protect, upload, uploadFile);

module.exports = router;
