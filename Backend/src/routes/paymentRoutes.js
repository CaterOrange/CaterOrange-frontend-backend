const express = require('express');
const router = express.Router()
const paymentController = require('../controller/paymentController');
router.post('/insert-payment',paymentController.payment)
router.get('/corporate/getOrdergenId',paymentController.getOrdergenId);
module.exports = router
