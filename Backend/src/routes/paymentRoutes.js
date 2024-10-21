const express = require('express');
const router = express.Router()
const paymentController = require('../controller/paymentController');
const eventpaymentController = require('../controller/eventpaymentController');

router.post('/insert-payment',paymentController.payment)
router.post('/insertevent-payment',eventpaymentController.event_payment)
router.get('/corporate/getOrdergenId',paymentController.getOrdergenId);
router.get('/event/getEOrdergenId',paymentController.getEOrdergenId);
module.exports = router
