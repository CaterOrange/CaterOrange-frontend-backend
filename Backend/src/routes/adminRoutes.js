const express = require('express');
const router = express.Router()
const adminController = require('../controller/adminController');


router.post('/categories', adminController.addCategory);
router.post('/groups', adminController.createGroup);
router.delete('/groups/:groupId', adminController.deleteGroup);
router.get('/getallgroups', adminController.getAllGroups);
// router.get('/api/customers/:id',adminController.getCustomerById)


router.get('/api/customers/:id',adminController.getCustomerById)

router.get('/api/customers',adminController.getCustomers)
router.delete('/api/deleteCustomer/:id',adminController.deleteCustomer)
router.put('/api/updatecustomer/:id',adminController.updateUser)
router.get('/payments', adminController.getAllPayments);

module.exports = router;