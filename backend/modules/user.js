const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true, // Optional for HRs
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String, // 'student' or 'hr'
    required: true,
  },
  dob: String,
  contact: String,
  company: String,
  experience: String,
  bio: String,
  profilePic: String,
});

module.exports = mongoose.model("User", userSchema);
