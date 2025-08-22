const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Route files
const userRoutes = require("./modules/userRoutes");
const studentRoutes = require("./modules/studentRoutes"); // if you create more, import them here

// Use Routes
app.use("/api", userRoutes);
app.use("/api", studentRoutes);

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/jobnest", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ MongoDB connected");

  // Start server
  app.listen(5000, () => {
    console.log("🚀 Server started on http://localhost:5000");
  });
})
.catch((err) => {
  console.error("❌ MongoDB connection error:", err.message);
});
