const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const applicationRoutes = require('./modules/applicationRoutes');



dotenv.config();


const PORT = 8080;

// ✅ Mongo URI directly (since you're not using .env file)
const MONGO_URI = "mongodb+srv://jobnest:sneha@cluster0.h6yckym.mongodb.net/jobnest";

// ✅ Routes
const hrRoutes = require("./modules/hrRoutes");
const studentRoutes = require("./modules/studentRoutes");
const userRoutes = require("./modules/userroutes");
const resumeAnalysisRoute = require('./modules/resumeAnalysis');



const app = express();

app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // serve images

app.use('/api/applications', applicationRoutes);


// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve static files from Frontend folder
app.use(express.static(path.join(__dirname, "../Frontend")));

// ✅ API Routes
app.use("/api/hr", hrRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/resume", resumeAnalysisRoute);

// ✅ Home route (serves index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend", "index.html"));
});

// ✅ Start Server AFTER Mongo Connect
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
