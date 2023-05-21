const express = require('express');
const router = express.Router();

const goalsController = require('../controllers/goals.controller');

router.post('/create', goalsController.create);
router.post('/plangoal/tree', goalsController.get_plan_goal_tree);
router.post('/get/by/id', goalsController.get_goal_by_id);
router.post('/get/all/by/plan', goalsController.get_all_goals_by_plan);
router.post('/getgoals/bypid', goalsController.get_goals_by_planid);
router.post('/priority/changebyid', goalsController.priority_change_by_id);
router.post('/deactivate/changebyid', goalsController.deactivate_change_by_id);
router.post('/proposal/changebyid', goalsController.propose_change_by_id);
router.post('/getgoals/byvote', goalsController.get_goals_by_vote);
router.post('/getgoals/byvote/all/plans', goalsController.get_goals_by_vote_all_plan);
router.post('/getgoals/bydelegate', goalsController.get_goals_by_delegate);
router.post('/getgoals/bycountdown', goalsController.get_goals_by_countdown);
router.post('/getgoals/launch', goalsController.launchgoal);
router.post('/voteupdown/byid', goalsController.voteupdown_by_id);
router.post('/update/select', goalsController.updateselect);
router.post('/get/report', goalsController.getGoalReportByUser);
router.post('/get/report/by/admin', goalsController.getGoalReportByAdmin);
router.post('/update/priority', goalsController.updateGoalPrioroty);
router.post('/get/attachments', goalsController.getGoalAttachments);
router.post('/attachments/delete', goalsController.deleteGoalAttachment);
router.post('/get/shared/users', goalsController.getGoalSharedUsers);
router.post('/get/by/plan', goalsController.getGoalByPlan);
router.post('/get/chat', goalsController.getGoalChat);
router.post('/get/single/chat', goalsController.getGoalSingleChat);
router.post('/store/attachments', goalsController.storeGoalAttachments);
router.post('/get/childs', goalsController.getChildGoals);

//Strategy Routes
router.post('/create/strategy', goalsController.createStrategies);
router.post('/get/strategies', goalsController.getStrategies);
router.post('/strategy/store/attachments', goalsController.storeStrategyAttachments);
router.post('/strategy/get/attachments', goalsController.getStrategyAttachments);
router.post('/strategy/attachments/delete', goalsController.deleteStrategyAttachment);
router.post('/strategy/get/single/chat', goalsController.getStrategySingleChat);
router.post('/strategy/get/chat', goalsController.getStrategyfChat);

module.exports = router;
