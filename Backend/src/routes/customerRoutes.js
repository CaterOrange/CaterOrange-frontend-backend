const express = require('express');
const router = express.Router(); 
const customerController = require('../controller/customerController.js');

//customer routes
router.post('/customer/login', customerController.login);
router.post('/customer/register', customerController.register);
router.post('/customer/forgotPassword',customerController.forgotPassword);
router.post('/customer/google_auth',customerController.google_auth);
// router.post('/customer/google_auth')

router.post('/customer/send-otp',customerController.send_otp)
router.post('/customer/checkcustomer',customerController.checkCustomer)
router.post('/customer/verify-otp',customerController.verify_otp)

module.exports = router;
