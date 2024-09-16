const express = require('express');
const router = express.Router(); 
const addressController = require('../controller/addressController.js');



router.post('/address',addressController.createAddress)



module.exports = router;
