const express = require('express');
const router = express.Router(); 
const customerController = require('../../controller/v1/customerController.js');
const auth = require('../../middlewares/authMiddleware.js');

//customer routes

router.post('/customer/google_auth',customerController.google_auth);
router.get('/customer/info',auth,customerController.customer_info);
router.post('/customer/send-otp',customerController.send_otp)
router.post('/customer/checkcustomer',customerController.checkCustomer)
router.post('/customer/verify-otp',customerController.verify_otp)
router.post('/customer/checkCustomerOtp',customerController.checkCustomerOtp)



//customer routes
router.post('/customer/login', customerController.login);
router.post('/customer/register', customerController.register);
router.post('/customer/forgotPassword',customerController.forgotPassword);
router.get('/customer_address/:customer_id',customerController.getAddressByCustomerId);
router.get('/customer',customerController.getuserbytoken)




//event order routes 
router.post('/event_order', customerController.createEventOrderController);
router.get('/getevent_order/:id',customerController.getEventOrderByIdController);
router.get('/event_customerorder/:id',customerController.getAllEventOrdersByCustomerIdController);
router.delete('/addresses/:address_id', auth,customerController.deleteAddressById);
router.put('/addresses/:address_id',auth, customerController.updateAddressById)
router.get('/customer/getCustomerDetails',auth,customerController.getCustomerDetails)


//settings
router.post('/customer/updatePassword',auth, customerController.updatePassword);

// router.post('/customer/corporateOrderDetails',auth,customerController.insertCorporateOrderDetails);
  


module.exports = router;



