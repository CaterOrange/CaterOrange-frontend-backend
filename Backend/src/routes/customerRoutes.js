const express = require('express');
const router = express.Router(); 
const customerController = require('../controller/customerController.js');
const auth = require('../middlewares/authMiddleware.js');

//customer routes

router.post('/customer/google_auth',auth,customerController.google_auth);
router.get('/customer/info',auth,customerController.customer_info);
router.post('/customer/send-otp',auth,customerController.send_otp)
router.post('/customer/checkcustomer',auth,customerController.checkCustomer)
router.post('/customer/verify-otp',auth,customerController.verify_otp)
router.post('/customer/checkCustomerOtp',auth,customerController.checkCustomerOtp)



//customer routes
router.post('/customer/login', customerController.login);
router.post('/customer/register', customerController.register);
router.post('/customer/forgotPassword', auth,customerController.forgotPassword);
router.get('/customer_address/:customer_id', auth,customerController.getAddressByCustomerId);
router.get('/customer',auth,customerController.getuserbytoken)




//event order routes
router.post('/event_order',auth, customerController.createEventOrderController);
router.get('/getevent_order/:id',auth, customerController.getEventOrderByIdController);
router.get('/event_customerorder/:id',auth, customerController.getAllEventOrdersByCustomerIdController);
router.delete('/addresses/:address_id', auth,customerController.deleteAddressById);
router.put('/addresses/:address_id',auth, customerController.updateAddressById)
router.get('/customer/getCustomerDetails',auth,customerController.getCustomerDetails)


//settings
router.post('/customer/updatePassword',auth, customerController.updatePassword);



module.exports = router;



