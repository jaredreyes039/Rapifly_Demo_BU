const express = require('express');
const router = express.Router();

// Require the controllers WHICH WE DID NOT CREATE YET!!
const userGroupsController = require('../controllers/user_groups.controller');

router.post('/create', userGroupsController.create);
router.post('/get/by/user', userGroupsController.getByUserId);
router.post('/get/by/id', userGroupsController.getById);
router.post('/update/status', userGroupsController.updateStatus);
router.post('/update', userGroupsController.update);

module.exports = router;