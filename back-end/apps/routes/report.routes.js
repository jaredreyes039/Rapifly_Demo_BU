const express = require('express');
const router = express.Router();

const reportController = require('../controllers/report.controller');

router.post('/create', reportController.create);
router.post('/get/all', reportController.getAllReports);

module.exports = router;