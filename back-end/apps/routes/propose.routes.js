const express = require('express');
const router = express.Router();

const proposeController = require('../controllers/propose.controller');

router.post('/manage', proposeController.manage);
router.post('/get/superior/goals', proposeController.getSuperiorProposeGoals);
router.post('/get/goal/by/plan', proposeController.getGoalByPlan);

module.exports = router;