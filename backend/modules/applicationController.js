// backend/modules/applicationController.js

const Application = require('../applicationModel'); // Adjust if your path is different

// Get applications by HR email (you can pass via query: ?email=hr@example.com)
const getApplicationsByHr = async (req, res) => {
  try {
    const hrEmail = req.query.email;
    const applications = await Application.find({ hrEmail }); // assuming 'hrEmail' is stored in the Application model
    res.status(200).json(applications);
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

// Get dashboard stats (total jobs, total applications, pending interviews)
const getDashboardStats = async (req, res) => {
  try {
    const hrEmail = req.query.email;

    const totalJobs = await Application.countDocuments({ hrEmail });
    const totalApplications = await Application.aggregate([
      { $match: { hrEmail } },
      { $group: { _id: null, total: { $sum: { $size: "$applications" } } } }
    ]);
    const pendingInterviews = await Application.countDocuments({
      hrEmail,
      status: "Interview Pending"
    });

    res.status(200).json({
      totalJobs,
      totalApplications: totalApplications[0]?.total || 0,
      pendingInterviews
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

module.exports = {
  getApplicationsByHr,
  getDashboardStats
};
