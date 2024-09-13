const express = require('express');
const router = express.Router(); 
const customerController = require('../controller/customerController.js');


//customer routes
router.post('/customer/login', customerController.login);
router.post('/customer/register', customerController.register);
router.post('/customer/forgotPassword', customerController.forgotPassword);





module.exports = router;
