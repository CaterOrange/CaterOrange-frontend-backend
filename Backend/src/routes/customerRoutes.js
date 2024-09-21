const express = require('express');
const router = express.Router(); 
const customerController = require('../controller/customerController.js');

//customer routes

router.post('/customer/google_auth',customerController.google_auth);
// router.post('/customer/google_auth')

router.get('/customer/info',customerController.customer_info);
router.post('/customer/send-otp',customerController.send_otp)
router.post('/customer/checkcustomer',customerController.checkCustomer)
router.post('/customer/verify-otp',customerController.verify_otp)
router.post('/customer/checkCustomerOtp',customerController.checkCustomerOtp)






//customer routes
router.post('/customer/login', customerController.login);
router.post('/customer/register', customerController.register);
router.post('/customer/forgotPassword', customerController.forgotPassword);
router.get('/customer_address/:customer_id', customerController.getAddressByCustomerId);
router.get('/customer',customerController.getuserbytoken)
router.get('/customer/info', customerController.getCustomerInfo);
//event order routes
router.post('/event_order', customerController.createEventOrderController);
router.get('/getevent_order/:id', customerController.getEventOrderByIdController);
router.get('/event_customerorder/:id', customerController.getAllEventOrdersByCustomerIdController);
router.delete('/addresses/:address_id', customerController.deleteAddressById);
router.put('/addresses/:address_id', customerController.updateAddressById)
router.get('/customer/getCustomerDetails',customerController.getCustomerDetails)
module.exports = router;



