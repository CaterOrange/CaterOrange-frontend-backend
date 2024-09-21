const express = require('express');
const router = express.Router(); 
const addressController = require('../controller/addressController.js');
const customerController = require('../controller/customerController.js');


router.post('/address/createAddres',addressController.createAddress)
router.get('/address/getDefaultAddress',addressController.getDefaultAddress)
router.get('/address/getalladdresses',addressController.getAddressForUser)
router.get('/customer/corporate/customerAddress',customerController.CustomerAddress)
router.get('/customer/getAddress', addressController.getSelectedAddress)

module.exports = router;
