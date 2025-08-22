const express = require("express");
const router = express.Router();
const {
  registerStudent,
  loginStudent,
  getStudentProfile
} = require("./studentController");

// ✅ Register Route
router.post("/register", registerStudent);

// ✅ Login Route
router.post("/login", loginStudent);

// ✅ Get Profile by Email
router.get("/profile/:email", getStudentProfile);

module.exports = router;

