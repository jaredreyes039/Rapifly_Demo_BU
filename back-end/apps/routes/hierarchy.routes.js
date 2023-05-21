const express = require('express');
const router = express.Router();

// Require the controllers WHICH WE DID NOT CREATE YET!!
const hierarchyController = require('../controllers/hierarchy.controller');

router.post('/get/designation', hierarchyController.get_by_designation);
router.post('/get/child/designation', hierarchyController.get_child_designation);
router.post('/save', hierarchyController.save);
router.post('/get/by/parent', hierarchyController.get_by_parent);
router.post('/get/by/user', hierarchyController.get_by_user);
router.post('/structure', hierarchyController.structure);
router.post('/users', hierarchyController.getHierarchyUsers);
router.post('/designations', hierarchyController.getHierarchyDesignations);
router.post('/designation/by/parent', hierarchyController.getHierarchyDesignationsByParent);
router.post('/designation/by/user', hierarchyController.getHierarchyDesignationsByUser);
//router.post('/user/childs', hierarchyController.get_user_childs);
router.post('/user/child', hierarchyController.get_user_child);
router.post('/user/parent', hierarchyController.get_user_parents);
router.post('/update/designation', hierarchyController.updateDesignation);
router.post('/delete', hierarchyController.deleteHierarchy);
router.post('/update', hierarchyController.updateHierarchy);
router.post('/change/user/designation', hierarchyController.changeUserDesignation);
router.post('/get/all/designation', hierarchyController.getAllDesignations);
router.post('/get/parent/designation', hierarchyController.getParentDesignation);
router.post('/get/user/all/childs', hierarchyController.getUserAllChildHierarchy);
router.post('/get/user/designation', hierarchyController.getUserDesignation);

module.exports = router;