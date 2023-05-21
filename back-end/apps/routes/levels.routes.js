const express = require('express');
const router = express.Router();

const levelsController = require('../controllers/levels.controller');

router.post('/create', levelsController.create);
router.get('/get/all', levelsController.get);
router.post('/get/by/id', levelsController.get_by_id);
router.post('/update', levelsController.update);
router.post('/get/by/organization', levelsController.get_by_organization_id);

module.exports = router;