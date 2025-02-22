const express = require('express');
const router = express.Router(); 
const auth = require('../../middlewares/authMiddleware.js');
const categoryController=require('../../controller/v1/categoryController.js')

router.get('/customer/corporate/categories',auth,categoryController.GetCorporateCategory);

module.exports = router;

