const express = require('express');
const router = express.Router(); 
const customerController = require('../controller/customerController.js');



//customer routes
router.post('/customer/login', customerController.login);
router.post('/customer/register', customerController.register);
router.post('/customer/forgotPassword', customerController.forgotPassword);
router.get('/customer/:customer_id', customerController.getAddressByCustomerId);
router.get('/customer',customerController.getuserbytoken)
//event order routes
router.post('/event_order', customerController.createEventOrderController);
router.get('/getevent_order/:id', customerController.getEventOrderByIdController);
router.get('/event_customerorder/:id', customerController.getAllEventOrdersByCustomerIdController);

module.exports = router;



