const express = require('express');
const router = express.Router()
const adminController = require('../controller/adminController');


router.get('/api/customers/:id',adminController.getCustomerById)
router.get('/api/customers',adminController.getCustomers)
router.delete('/api/deleteCustomer/:id',adminController.deleteCustomer)
router.put('/api/updatecustomer/:id',adminController.updateUser)



module.exports = router;