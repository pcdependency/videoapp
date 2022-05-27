const multer = require("multer");
const crypto = require("crypto");
const path = require("path");

const storage = new multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./originals");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      crypto.randomBytes(16).toString("hex") + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
  limits: {
    fileSize: 500000000,
  },
});

module.exports = {
  upload: upload.single("file"),
};
