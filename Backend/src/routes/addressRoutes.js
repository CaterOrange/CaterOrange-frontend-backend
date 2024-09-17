const express = require('express');
const router = express.Router(); 
const addressController = require('../controller/addressController.js');



router.post('/address/createAddres',addressController.createAddress)
router.get('/address/getDefaultAddress',addressController.getDefaultAddress)


module.exports = router;
