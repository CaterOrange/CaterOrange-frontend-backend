const express = require('express');
const router = express.Router()
const paymentController = require('../../controller/v1/paymentController');
const eventpaymentController = require('../../controller/v1/eventpaymentController');

router.post('/insert-payment',paymentController.payment)
router.post('/insertevent-payment',eventpaymentController.event_payment)
router.get('/corporate/getOrdergenId',paymentController.getOrdergenId);
router.get('/event/getEOrdergenId',paymentController.getEOrdergenId);
router.post("/create-order", paymentController.create_order );
router.post("/verify-payment",paymentController.verify_payment );
module.exports = router