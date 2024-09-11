const express = require('express');
const router = express.Router()
const adminController = require('../controller/adminController');

router.post('/categories', adminController.addCategory);
router.post('/groups', adminController.createGroup);
router.delete('/groups/:groupId', adminController.deleteGroup);
router.get('/getallgroups', adminController.getAllGroups);

module.exports = router;