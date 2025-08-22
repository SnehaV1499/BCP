const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: String,
  hrEmail: String,
  studentName: String,
  studentEmail: String,
  resumeScore: Number,
  status: {
    type: String,
    default: 'Pending'
  }
});

module.exports = mongoose.model('Application', applicationSchema);
