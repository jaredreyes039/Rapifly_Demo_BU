const express = require('express');
const router = express.Router();

const organizationRolesController = require('../controllers/organization_roles.controller');

router.post('/create', organizationRolesController.create);
router.get('/get/all', organizationRolesController.get);
router.post('/update', organizationRolesController.update);
router.post('/get/by/organization', organizationRolesController.get_by_organization_id);

module.exports = router;