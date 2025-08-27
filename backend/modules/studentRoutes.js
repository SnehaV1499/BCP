const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");

// File storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Student registration route
router.post(
  "/register",
  upload.fields([{ name: "profilePic" }, { name: "resume" }]),
  async (req, res) => {
    try {
      const { name, studentId, email, password, dob, contact, skills, bio, role } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);

      const student = new Student({
        name,
        studentId,
        email,
        password: hashedPassword,
        dob,
        contact,
        skills,
        bio,
        role,
        profilePic: req.files["profilePic"] ? `/uploads/${req.files["profilePic"][0].filename}` : "",
        resume: req.files["resume"] ? `/uploads/${req.files["resume"][0].filename}` : ""
      });

      await student.save();
      res.json({ message: "Student registered successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Registration failed" });
    }
  }
);

module.exports = router;
