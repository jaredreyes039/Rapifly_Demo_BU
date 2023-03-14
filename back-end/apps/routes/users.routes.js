const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Require the controllers WHICH WE DID NOT CREATE YET!!
const usersController = require('../controllers/users.controller');

router.post('/create', usersController.user_create);
router.post('/authentication', usersController.user_authentication);
router.post('/reset-password', usersController.user_reset_password);
router.post('/update/reset-password', usersController.user_update_reset_password);

// FOR DB TESTING
// router.get("/get/all", usersController.get_all_users)

//Invite User
router.post('/invite', usersController.invite_user);
router.post('/get/invite/user/details', usersController.get_invite_user_details);
router.post('/save', usersController.save);
router.post('/get/by/organization', usersController.get_by_organization);
router.post('/check/user', usersController.check_new_user);
router.post('/get/by/parent', usersController.get_user_by_parent);
router.post('/get/invited', usersController.get_invited_users);
router.post('/update/status', usersController.update_status);
router.post('/profile', usersController.getUserProfile);
router.post('/profile/update', usersController.updateProfile);
router.post('/password/update', usersController.updateUserPassword);
router.post('/avatar/update', usersController.updateUserAvatar);
router.post('/save/delegationtimeout', usersController.updateAdmindelegationtimeout);
router.post('/get/designations', usersController.getUsersAndDesignations);
router.post('/get/all', usersController.getOrganizationUsers);
router.post('/desigation/create', usersController.inviteAndCreateUserAndDesignation);
router.post('/feedback', usersController.user_feedback)
router.post('/update/insBoxView', usersController.user_instruction_box)
router.post('/remove-field', usersController.remove_form_field)
module.exports = router;