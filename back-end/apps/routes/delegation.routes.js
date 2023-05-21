const express = require('express');
const router = express.Router();

const delegationController = require('../controllers/delegation.controller');

router.post('/create', delegationController.create);
router.post('/accept/status', delegationController.updateAcceptStatus);
router.post('/get/goals', delegationController.getGoals);
router.post('/get/user/goals', delegationController.getUserGoals);
router.post('/get/launch/goal/alerts', delegationController.getGoalAlertsForLaunch);
router.post('/get/report/goal/alerts', delegationController.getGoalAlertsForReport);

module.exports = router;