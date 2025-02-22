const express = require('express');
const router = express.Router(); 
const addressController = require('../../controller/v1/addressController.js');
const customerController = require('../../controller/v1/customerController.js');
const auth = require('../../middlewares/authMiddleware.js');

router.post('/address/createAddres',auth,addressController.createAddress)
router.get('/address/getDefaultAddress',auth,addressController.getDefaultAddress)

router.get('/address/getalladdresses',auth,addressController.getAddressForUser)
router.get('/customer/corporate/customerAddress',auth,customerController.CustomerAddress)
router.get('/customer/getAddress',auth, addressController.getSelectedAddress)
router.post('/address/edit/:address_id',auth, addressController.editAddress);  



router.put('/customer/address/update/:id',auth,addressController.updateAddress);
router.delete('/customer/address/delete/:id',auth,addressController.deleteAddress);

 
module.exports = router;
