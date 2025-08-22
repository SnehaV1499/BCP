const HR = require("./hrModel");
const path = require("path");

// Register HR
const registerHR = async (req, res) => {
  try {
    const { name, email, hrId, password, contact, company, experience, bio } = req.body;

    const existingHR = await HR.findOne({ email });
    if (existingHR) {
      return res.status(400).json({ message: "HR already registered with this email" });
    }

    const profilePic = req.file ? req.file.filename : null;

    const newHR = new HR({
      name,
      email,
      hrId,
      password,
      contact,
      company,
      experience,
      bio,
      profilePic,
    });

    await newHR.save();
    res.status(201).json({ message: "HR registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Login HR
const loginHR = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hr = await HR.findOne({ email, password });

    if (!hr) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful", hr });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get HR Profile by Email
const getHRProfile = async (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim(); // 🔥 fix
    const hr = await HR.findOne({ email });
    if (!hr) {
      return res.status(404).json({ message: "HR not found" });
    }
    res.json(hr);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports = { registerHR, loginHR, getHRProfile };
