const express = require('express');
const router = express.Router(); 
const addressController = require('../controller/addressController.js');
const customerController = require('../controller/customerController.js');
const auth = require('../middlewares/authMiddleware.js');


router.post('/address/createAddres',addressController.createAddress)
router.get('/address/getDefaultAddress',auth,addressController.getDefaultAddress)


router.get('/address/getalladdresses',auth,addressController.getAddressForUser)



router.get('/customer/corporate/customerAddress',auth,customerController.CustomerAddress)
router.get('/customer/getAddress',auth, addressController.getSelectedAddress)

// router.get('/address/getaddresses',addressController.getalladdresses)



module.exports = router;
