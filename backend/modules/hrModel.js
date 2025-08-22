const mongoose = require("mongoose");

const hrSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  hrId: String,
  password: String,
  contact: String,
  company: String,
  experience: String,
  bio: String,
  profilePic: String, // store filename only
});

module.exports = mongoose.model("HR", hrSchema);
