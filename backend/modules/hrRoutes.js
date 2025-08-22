const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  registerHR,
  loginHR,
  getHRProfile
} = require("./hrController");

// Setup multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Routes
router.post("/register", upload.single("profilePic"), registerHR);
router.post("/login", loginHR);
router.get("/profile/:email", getHRProfile);

module.exports = router;
