const express = require('express');
const router = express.Router(); 
const categoryController=require('../../controller/v2/categoryController.js')
const auth = require('../../middlewares/authMiddleware.js');

router.get('/customer/corporate/categories',auth,categoryController.GetCorporateCategory);
router.get('/closure-time/:categoryId', auth, categoryController.getClosureTime);

module.exports = router;