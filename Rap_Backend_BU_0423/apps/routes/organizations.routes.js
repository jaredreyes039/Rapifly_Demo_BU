const express = require('express');
const router = express.Router();

const organizationController = require('../controllers/organizations.controller');

router.post('/create', organizationController.create);
router.get('/get/all', organizationController.get);
router.post('/update', organizationController.update);
router.post('/update/status', organizationController.updateStatus);
router.post('/get/by/user', organizationController.get_organization_by_user);

module.exports = router;