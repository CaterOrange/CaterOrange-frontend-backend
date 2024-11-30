const express = require('express');
const router = express.Router(); 
const addressController = require('../controller/addressControllers');
const { add } = require('winston');
const auth = require('../middlewares/authMiddleware');

   

router.post('/address/createAddres',auth,addressController.createAddress)
router.get('/address/getDefaultAddress',auth,addressController.getDefaultAddress)
router.get('/address/getalladdresses',auth,addressController.getAddressForUser);
router.post('/address/edit/:address_id',auth,addressController.editAddress);


module.exports=router;