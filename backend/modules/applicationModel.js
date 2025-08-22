// backend/applicationModel.js

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job', // Assuming there's a Job model
    required: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  hrEmail: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: true
  },
  resumeScore: {
    type: Number,
    default: 0
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Applied', 'Interview Pending', 'Selected', 'Rejected'],
    default: 'Applied'
  },
  studentName: String,
  studentContact: String,
  resumeLink: String,
  remarks: String
});

module.exports = mongoose.model('Application', applicationSchema);
