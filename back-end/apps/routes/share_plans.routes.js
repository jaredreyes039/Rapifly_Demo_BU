const express = require('express');
const router = express.Router();
const sharePlanController = require('../controllers/share_plans.controller');

//Routes
router.post('/share', sharePlanController.share);

module.exports = router;
