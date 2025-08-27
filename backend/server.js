const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");

// =================== File Upload Config ===================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// =================== Student Registration ===================
router.post(
  "/register",
  upload.fields([{ name: "profilePic" }, { name: "resume" }]),
  async (req, res) => {
    try {
      const { name, studentId, email, password, dob, contact, skills, bio } =
        req.body;

      // Check if already registered
      const existing = await Student.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "Student already exists" });
      }

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
        role: "student",
        profilePic: req.files["profilePic"]
          ? `/uploads/${req.files["profilePic"][0].filename}`
          : "",
        resume: req.files["resume"]
          ? `/uploads/${req.files["resume"][0].filename}`
          : ""
      });

      await student.save();
      res.json({ message: "✅ Student registered successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "❌ Registration failed" });
    }
  }
);

// =================== Get Profile By Email ===================
router.get("/profile/:email", async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.params.email }).select(
      "-password"
    );
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile" });
  }
});

// =================== Update Profile ===================
router.put(
  "/update/:email",
  upload.fields([{ name: "profilePic" }, { name: "resume" }]),
  async (req, res) => {
    try {
      const updates = { ...req.body };

      if (req.files["profilePic"]) {
        updates.profilePic = `/uploads/${req.files["profilePic"][0].filename}`;
      }
      if (req.files["resume"]) {
        updates.resume = `/uploads/${req.files["resume"][0].filename}`;
      }

      const student = await Student.findOneAndUpdate(
        { email: req.params.email },
        { $set: updates },
        { new: true }
      ).select("-password");

      if (!student)
        return res.status(404).json({ message: "Student not found" });

      res.json({ message: "✅ Profile updated", student });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "❌ Profile update failed" });
    }
  }
);

module.exports = router;
