const express = require('express');
const router = express.Router(); 
const categoryController = require('../controller/categoryController.js');
const auth = require('../middlewares/authMiddleware.js');


router.get('/customer/corporate/categories',auth,categoryController.GetCorporateCategory);

module.exports = router;

