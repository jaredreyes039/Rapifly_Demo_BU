const express = require('express');
const router = express.Router();

const modulesController = require('../controllers/module.controller');

router.post('/create', modulesController.create);
router.post('/get-by-user-and-plan', modulesController.getModulesByUserAndType);
router.post('/disucssion/create', modulesController.createDiscussion);
router.post('/find-selected', modulesController.findSelectedModule)

module.exports = router;