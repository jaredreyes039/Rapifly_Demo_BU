const express = require('express');
const router = express.Router();

const plansController = require('../controllers/plans.controller');


router.post('/create/form', plansController.planform_create);
router.post('/delete', plansController.plan_delete)
router.post('/remove/field', plansController.plan_field_remove);
router.post('/create/parent', plansController.plan_create);
router.get('/get/allplan', plansController.get_plan);
router.post('/get/allplanselectbox', plansController.get_plan_selectbox);
router.post('/update', plansController.update_plan);
router.post('/get/by/id', plansController.get_plan_by_id);
router.post('/get', plansController.get_single_plan);
router.post('/get/by/id2', plansController.get_plan_by_id2);
router.post('/getform/by/id', plansController.get_planform_by_id);
router.post('/update/status', plansController.updateStatus);
router.post('/get/allchilduser', plansController.allchilduser_for_delegate);
router.post('/get/by/user', plansController.getPlanAndGoals);
router.post('/get/goal/report', plansController.getPlanAndGoalsByUser);
router.post('/get/hud/details', plansController.getHeadUpToDisplayDetails);
router.post('/check/user/permission', plansController.checkPlanUserPermission);
router.post('/update/users/details', plansController.updateUsersDetails);
router.post('/change/description', plansController.updatePlanDescription);
router.post('/change/motivation', plansController.updatePlanMotivation);
router.post('/store/attachments', plansController.storePlanAttachments);
router.post('/get/attachments', plansController.getPlanAttachments);
router.post('/attachments/delete', plansController.deleteGoalAttachment);
router.post('/get/chat', plansController.getPlanChat);
router.post('/get/single/chat', plansController.getPlanSingleChat);
router.post('/get/of/user', plansController.getUserPlans);

//Change Management
router.post('/store/opportunity/problem', plansController.storeOpportuniyAndProblem);
router.post('/get/opportunity/problem', plansController.getOpportuniyAndProblem);
router.post('/challange/store/attachments', plansController.storeChallangeAttachments);
router.post('/challange/get/attachments', plansController.getChallangeAttachments);
router.post('/challange/attachments/delete', plansController.deleteChallangeAttachment);
router.post('/challange/get/single/chat', plansController.getChallangeSingleChat);
router.post('/challange/get/chat', plansController.getChallangeChat);

module.exports = router;
