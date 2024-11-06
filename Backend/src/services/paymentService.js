
// const Queue = require('bull');
// const crypto = require('crypto');
// const axios = require('axios');
// const uniqid = require('uniqid');
// require('dotenv').config();

// const PHONEPE_HOST_URL = "(link unavailable)";
// const MERCHANT_ID = "PGTESTPAYUAT86";
// const SALT_KEY = "96434309-7796-489d-8924-ab56988a6076";
// const SALT_INDEX = 1;

// const paymentQueue = new Queue('payment processing', process.env.REDIS_URL);

// const initializePayment = async (amount, customerId, orderType, orderId) => {
 
// };

// paymentQueue.process(async (job) => {
//   const { amount, customer_id, order_type, order_id } = job.data;
//   try {
//     const redirectUrl = await initializePayment(amount, customer_id, order_type, order_id);
//     return { redirectUrl };
//   } catch (error) {
//     throw new Error('Payment processing failed: ' + error.message);
//   }
// });

// const jwt = require('jsonwebtoken');

// const validateToken = async (token) => {
//   try {
//     const decoded = jwt.verify(token, process.env.SECRET_KEY);
//     return decoded;
//   } catch (error) {
//     throw error;
//   }
// };
// const addToPaymentQueue = async (paymentData) => {
//     try {
//       // Validate token
//       const token = paymentData.token;
//       if (!token) {
//         throw new Error('Token is missing');
//       }
  
//       // Extract user information (if needed)
//       const user = await validateToken(token);
  
//       // Add job to payment queue
//       return await paymentQueue.add({
//         amount: paymentData.amount,
//         corporateorder_id: paymentData.corporateorder_id,
//         customer_id: user.customer_id, // Assuming customer_id is extracted from token
//       });
//     } catch (error) {
//       console.error(error);
//       throw error;
//     }
//   };

// module.exports = { addToPaymentQueue, paymentQueue };



const Queue = require('bull');
const crypto = require('crypto');
const axios = require('axios');
const uniqid = require('uniqid');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const PHONEPE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const MERCHANT_ID = "PGTESTPAYUAT86";
const SALT_KEY = "96434309-7796-489d-8924-ab56988a6076";
const SALT_INDEX = 1;
const REDIS_URL = process.env.REDIS_URL;

const paymentQueue = new Queue('payment processing', REDIS_URL);

// Validate token
const validateToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    return decoded;
  } catch (error) {
    throw error;
  }
};

const initializePayment = async (amount, customer_id, order_type, order_id) => {
    try {
      const merchantTransactionId = uniqid();
      const payload = {
        merchantId: MERCHANT_ID,
        merchantTransactionId,
        merchantUserId: customer_id,
        amount: amount * 100,
        redirectUrl: `$https://dev.caterorange.com/redirect-url/${merchantTransactionId}?customer_id=${customer_id}&order_id=${order_id}`,
        redirectMode: 'REDIRECT',
        callbackUrl: '(link unavailable)',
        mobileNumber: '9999999999',
        paymentInstrument: {
          type: 'PAY_PAGE',
        },
      };
  
      const bufferObj = Buffer.from(JSON.stringify(payload), 'utf8');
      const base64EncodedPayload = bufferObj.toString('base64');
      const xVerify = crypto
        .createHash('sha256')
        .update(base64EncodedPayload + '/pg/v1/pay' + SALT_KEY)
        .digest('hex') + '###' + SALT_INDEX;
  
      const options = {
        method: 'post',
        url: PHONEPE_HOST_URL + '/pg/v1/pay',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
        },
        data: {
          request: base64EncodedPayload,
        },
      };
  
      const response = await axios.request(options);
      return response.data.data.instrumentResponse.redirectInfo.url;
    } catch (error) {
        console.error('Payment Initialization Error:', error);
        throw error;
    }
  };

// Process payment queue
paymentQueue.process(async (job) => {
  try {
    const { amount, customer_id, order_type, order_id } = job.data;
    const redirectUrl = await initializePayment(amount, customer_id, order_type, order_id);
    return { redirectUrl };
  } catch (error) {
    throw new Error('Payment processing failed: ' + error.message);
  }
});

// Add to payment queue
const addToPaymentQueue = async (paymentData) => {
  try {
    const token = paymentData.token;
    if (!token) {
      throw new Error('Token is missing');
    }

    const user = await validateToken(token);
    return await paymentQueue.add({
      amount: paymentData.amount,
      customer_id: user.customer_id,
      order_type: paymentData.order_type,
      order_id: paymentData.order_id,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = { addToPaymentQueue, paymentQueue };