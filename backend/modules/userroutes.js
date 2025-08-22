const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Student = require("./studentModel");

// Register Student
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      studentId,
      email,
      password,
      dob,
      contact,
      bio,
      profilePic
    } = req.body;

    // Check for existing email
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Check for existing studentId
    if (studentId) {
      const existingStudentId = await Student.findOne({ studentId });
      if (existingStudentId) {
        return res.status(400).json({ message: "Student ID already exists" });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = new Student({
      name,
      studentId,
      email,
      password: hashedPassword,
      dob,
      contact,
      bio,
      profilePic
    });

    await newStudent.save();
    res.status(201).json({ message: "Student registered successfully ✅" });
  } catch (err) {
    res.status(500).json({ message: "Registration failed ❌", error: err.message });
  }
});

// Login Student
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });

    if (!student) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Login successful ✅",
      studentId: student._id,
      name: student.name,
      email: student.email,
      studentId: student.studentId
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed ❌", error: err.message });
  }
});

// Get Student Profile
router.get("/profile/:id", async (req, res) => {
  try {
    const studentId = req.params.id;
    
    const student = await Student.findById(studentId).select('-password');
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    res.status(200).json({
      message: "Profile retrieved successfully",
      data: student
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to get profile", error: err.message });
  }
});

module.exports = router;