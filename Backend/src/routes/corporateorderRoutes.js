const express = require('express');
const router = express.Router();
const corporateOrderDetailsController = require('../controller/corporateorderController');


router.post('/corporateOrderDetails', corporateOrderDetailsController.addCorporateOrderDetails);
router.get('/myorders',corporateOrderDetailsController.getOrderDetails)
module.exports = router;