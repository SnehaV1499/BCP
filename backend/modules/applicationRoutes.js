// backend/modules/applicationRoutes.js

const express = require('express');
const router = express.Router();
const {
  getApplicationsByHr,
  getDashboardStats
} = require('./applicationController');

router.get('/byHr', getApplicationsByHr);
router.get('/dashboard', getDashboardStats);

module.exports = router;
