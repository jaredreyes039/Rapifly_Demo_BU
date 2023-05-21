const express = require('express');
const router = express.Router();

const modularController = require('../controllers/modular.controller');

router.post('/manage', modularController.manage);
router.post('/get-by-id', modularController.getById);
router.post('/get-by-plan-user', modularController.getByPlan);

module.exports = router;