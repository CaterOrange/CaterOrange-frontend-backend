const express = require('express');
const router = express.Router(); 
const addressController = require('../controllers/addressController');
const { add } = require('winston');



router.post('/address/createAddres',addressController.createAddress)
router.get('/address/getDefaultAddress',addressController.getDefaultAddress)
router.get('/address/getalladdresses',addressController.getAddressForUser);
router.post('/address/edit/:address_id',addressController.editAddress);


module.exports=router;