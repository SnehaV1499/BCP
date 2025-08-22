const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  studentId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "student" },
  dob: String,
  contact: String,
  company: String,
  experience: String,
  bio: String,
  profilePic: String,
}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);
