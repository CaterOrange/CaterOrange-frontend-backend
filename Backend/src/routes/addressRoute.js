const express = require('express');
const router = express.Router(); 
const addressController = require('../controller/addressControllers');
const { add } = require('winston');
const auth = require('../middlewares/authMiddleware');



router.post('/address/createAddres',addressController.createAddress)
router.get('/address/getDefaultAddress',addressController.getDefaultAddress)
router.get('/address/getalladdresses',addressController.getAddressForUser);
router.post('/address/edit/:address_id',addressController.editAddress);


module.exports=router;