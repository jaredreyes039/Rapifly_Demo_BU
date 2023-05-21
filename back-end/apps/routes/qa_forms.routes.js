const express = require('express');
const router = express.Router();
const mongoose =  require('mongoose');

const qaFormsController = require('../controllers/qa_forms.controller');

router.post('/create', qaFormsController.create);
router.post('/get/by/parent', qaFormsController.getByParentUser);
router.post('/get/form/by/id', qaFormsController.getById);
router.post('/form/save', qaFormsController.saveQAFormValues);
router.post('/form/list', qaFormsController.getQAFormList);
router.post('/form/get/report', qaFormsController.getAverageValueOfForm);

module.exports = router;
