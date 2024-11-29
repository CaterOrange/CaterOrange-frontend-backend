const express = require('express');
const router = express.Router()
const paymentController = require('../controller/paymentController');
const eventpaymentController = require('../controller/eventpaymentController');
const auth = require('../middlewares/authMiddleware');

router.post('/insert-payment',auth,paymentController.payment)
router.post('/insertevent-payment',auth,eventpaymentController.event_payment)
router.get('/corporate/getOrdergenId',auth,paymentController.getOrdergenId);
router.get('/event/getEOrdergenId',auth,paymentController.getEOrdergenId);
module.exports = router