const express = require('express');
const router = express.Router();

const domainController = require('../controllers/domains.controller');

router.post('/create', domainController.create);
router.get('/get/all', domainController.get);
router.post('/update', domainController.update);
router.post('/update/status', domainController.updateStatus);
router.post('/get/by/plan', domainController.get_by_plan_id);

module.exports = router;