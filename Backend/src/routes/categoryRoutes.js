const express = require('express');
const router = express.Router(); 
const categoryController = require('../controller/categoryController.js');


router.get('/customer/corporate/categories', categoryController.GetCorporateCategory);
router.post('/customer/getcategorynameByid', categoryController.getcategorynameById)

module.exports = router;

