const express = require('express');
const router = express.Router();

// Require the controllers WHICH WE DID NOT CREATE YET!!
const rolesController = require('../controllers/roles.controller');

// a simple test url to check that all of our files are communicating correctly.
router.post('/create', rolesController.role_create);
router.get('/get/all', rolesController.role_get_all);
router.post('/get', rolesController.get_by_name);

module.exports = router;