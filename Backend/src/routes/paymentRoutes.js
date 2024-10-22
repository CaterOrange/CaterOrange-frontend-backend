// const express = require('express');
// const router = express.Router()
// const paymentController = require('../controller/paymentController');
// const eventpaymentController = require('../controller/eventpaymentController');
// const { addToPaymentQueue } = require('../services/paymentService');

// router.post('/insert-payment',paymentController.payment)
// router.post('/insertevent-payment',eventpaymentController.event_payment)
// router.get('/corporate/getOrdergenId',paymentController.getOrdergenId);
// router.get('/event/getEOrdergenId',paymentController.getEOrdergenId);
// // New route for initiating payment
// // router.post('/initiate-payment', async (req, res) => {
// //   try {
// //     const { amount, customer_id, order_type, order_id } = req.body;
// //     const job = await addToPaymentQueue({ amount, customer_id, order_type, order_id });
// //     res.json({ jobId: job.id, message: 'Payment processing initiated' });
// //   } catch (error) {
// //     res.status(500).json({ error: 'Failed to initiate payment' });
// //   }
// // });
// router.post('/pay', async (req, res) => {
//     try {
//       const { amount, corporateorder_id } = req.body;
//       const token = req.headers.token;
  
//       // Validate token
//       if (!token) {
//         throw new Error('Token is missing');
//       }
  
//       // Add job to payment queue
//       const job = await addToPaymentQueue({ amount, corporateorder_id, token });

      
  
//       res.json({ message: 'Payment processing initiated' });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Failed to initiate payment' });
//     }
//   });
  
// module.exports = router


const express = require('express');
const router = express.Router();
const paymentController = require('../controller/paymentController');
const eventpaymentController = require('../controller/eventpaymentController');
const { addToPaymentQueue } = require('../services/paymentService');
const axios = require('axios');

// Validate token middleware
const validateToken = async (req, res, next) => {
  const token = req.headers.token;
  if (!token) {
    return res.status(401).json({ error: 'Token is missing' });
  }
  next();
};

// Payment queue configuration
const paymentQueueConfig = async (req) => {
  const { amount, corporateorder_id } = req.body;
  const token = req.headers.token;
  return { amount, corporateorder_id, token };
};

// Initiate payment
router.post('/pay', validateToken, async (req, res) => {
    try {
      const paymentData = await paymentQueueConfig(req);
      const job = await addToPaymentQueue(paymentData);
      console.log('Job ID:');
      res.json({ message: 'Payment initiated' });
    } catch (error) {
      console.error('Payment Initiation Error:', error);
      res.status(500).json({ error: 'Failed to initiate payment' });
    }
  });

// Insert payment
router.post('/insert-payment', paymentController.payment);

// Insert event payment
router.post('/insertevent-payment', eventpaymentController.event_payment);

// Get corporate order ID
router.get('/corporate/getOrdergenId', paymentController.getOrdergenId);

// Get event order ID
router.get('/event/getEOrdergenId', paymentController.getEOrdergenId);

module.exports = router;
