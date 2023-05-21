const express = require('express');
const router = express.Router();

const coachController = require('../controllers/coach.controller');

router.post('/register', coachController.register);
router.post('/get/all', coachController.list);
router.post('/filter', coachController.filter);

module.exports = router;