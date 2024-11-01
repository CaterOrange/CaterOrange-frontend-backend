// queues/paymentQueue.js
const Queue = require('bull');
const { initializePayment } = require('../services/paymentService');

const paymentQueue = new Queue('payment processing', process.env.REDIS_URL);
paymentQueue.process(async (job) => {
  try {
    const { amount, customer_id, order_type, order_id } = job.data;
    const redirectUrl = await initializePayment(amount, customer_id, order_type, order_id);
    console.log('Redirect URL:', redirectUrl);
    return { redirectUrl };
  } catch (error) {
    console.error('Payment Processing Error:', error);
    throw error;
  }
});

const initializePaymentQueue = async () => {
  paymentQueue.on('completed', (job, result) => {
    console.log(`Job ${job.id} completed. Redirect URL: ${result.redirectUrl}`);
  });

  paymentQueue.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed with error: ${err.message}`);
  });
};

module.exports = { paymentQueue, initializePaymentQueue };