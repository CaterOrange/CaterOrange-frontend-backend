require('dotenv').config();


const client = require('../../config/dbConfig.js');


const paymentmodel = require('../../models/v1/paymentModels.js');


const Mixpanel = require('mixpanel');
require('dotenv').config();

// Initialize Mixpanel with your project token
const mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);

const logger = require('../../config/logger');

const jwt = require('jsonwebtoken');


const customer_model = require('../../models/v1/customerModels.js');  // Adjust path accordingly



const Redis = require('ioredis');
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpayInstance = new Razorpay({
   key_id: process.env.RAZORPAY_KEY_ID,
   key_secret: process.env.RAZORPAY_SECRET,
 });
console.log('instances',razorpayInstance)


const Ajv = require("ajv");

const addFormats = require("ajv-formats");

const ajv = new Ajv({ allErrors: true, strict: false });

addFormats(ajv);






const { paymentSchema }=require('../../SchemaValidator/paymentSchema.js')


const redis = new Redis({     
  host: 'localhost',  
  port: 6379, 
 connectTimeout: 20000
});

const payment = async (req, res) => {
  const { paymentType, merchantTransactionId, phonePeReferenceId, paymentFrom, instrument, bankReferenceNo, amount, customer_id, corporateorder_id } = req.body;
  console.log('payment', req.body);

  // First identify the user

  // Set user properties
  mixpanel.people.set(customer_id, {
    'payment_type': paymentType,
    'last_payment_attempt': new Date().toISOString(),
    'payment_amount': amount
  });

  const insertPaymentQuery = `
    INSERT INTO payment (
      PaymentType, 
      MerchantReferenceId, 
      PhonePeReferenceId, 
      "From", 
      Instrument, 
      CreationDate, 
      TransactionDate, 
      SettlementDate, 
      BankReferenceNo, 
      Amount, 
      customer_generated_id, 
      paymentDate
    ) VALUES (
      $1, $2, $3, $4, $5, CURRENT_DATE, CURRENT_DATE, CURRENT_DATE, $6, $7, $8, NOW()
    )
    RETURNING paymentid;
  `;

  const values = [
    paymentType,
    merchantTransactionId,
    phonePeReferenceId,
    paymentFrom,
    instrument,
    bankReferenceNo,
    amount,
    customer_id
  ];

  try {
    const response = await client.query(insertPaymentQuery, values);
    const generatedPaymentId = response.rows[0].paymentid;

    const order_id = corporateorder_id; 
    const payment_status = 'Success'; 
    console.log('hi', generatedPaymentId);
    logger.info('Generated Payment ID:', generatedPaymentId);

    // Now update the corporate order with the generated payment_id
    await updateCorporateOrder(order_id, generatedPaymentId, payment_status, customer_id);
    await deleteCorporateCart(customer_id, req);

   
    // Track the payment completion event
    mixpanel.track('Payment Completed', {
      payment_id: generatedPaymentId,
      payment_type: paymentType,
      amount: amount,
      order_id: order_id,
      instrument: instrument,
      merchant_id: merchantTransactionId
    });

    // Update user payment properties
    mixpanel.people.set(customer_id, {
      '$last_payment_date': new Date().toISOString(),
      'last_payment_amount': amount,
      'last_payment_type': paymentType,
      'last_payment_id': generatedPaymentId,
      'last_payment_status': 'Success'
    });

    res.status(200).json({ payment_id: generatedPaymentId });
  } catch (error) {
   
    
    mixpanel.track('Payment Error', {
      error_message: error.message,
      payment_type: paymentType,
      amount: amount
    });

    // Update user properties for the failed payment
    mixpanel.people.set(customer_id, {
      'last_payment_error': error.message,
      'last_payment_error_date': new Date().toISOString()
    });

    logger.error("Error inserting payment data: ", error);
    res.status(500).json({ message: "Error inserting payment data", error });
  }
};


const updateCorporateOrder = async (order_id, paymentid, payment_status, customer_id) => {
  try {
    // Identify user
    
    // Track order update event
    mixpanel.track('Corporate Order Updated', {
      order_id: order_id,
      payment_id: paymentid,
      payment_status: payment_status
    });
    
    // Update user properties
    mixpanel.people.set(customer_id, {
      'last_order_id': order_id,
      'last_order_update': new Date().toISOString(),
      'last_order_payment_status': payment_status
    });
    
    // Update corporate order details in the database
    const result = await paymentmodel.updateOrder(order_id, paymentid, payment_status);
    logger.info('Result in payment update:', result);
    
    if (result.rowCount > 0) {
      logger.info('Corporate order updated successfully');
      
      // Track successful update
      mixpanel.track('Corporate Order Update Success', {
        order_id: order_id
      });
    } else {
      logger.warn('Corporate order not found for order ID:', order_id);
      
      // Track failed update
      mixpanel.track('Corporate Order Update Failed', {
        order_id: order_id,
        reason: 'Order not found'
      });
    }
  } catch (error) {
    logger.error('Error updating corporate order:', error);
    
    // Track error
    mixpanel.track('Corporate Order Update Error', {
      order_id: order_id,
      error_message: error.message
    });
    
    // Update user properties with error info
    mixpanel.people.set(customer_id, {
      'last_order_update_error': error.message,
      'last_order_update_error_time': new Date().toISOString()
    });
  }
};


const deleteCorporateCart = async (customer_id, req) => {
  try {
   
    
    // Track cart deletion attempt
    mixpanel.track('Cart Deletion Attempted', {
      customer_id: customer_id
    });
    
    // Update user properties
    mixpanel.people.set(customer_id, {
      'cart_deletion_attempt': new Date().toISOString()
    });
    
    // Update corporate order details in the database
    const result = await redis.del(`cart:${customer_id}`);
    
    // Make sure req exists before using it
    if (req && req.io) {
      req.io.emit("cartDeleted", {customer_id});
    }

    if (result === 1) {
      console.log(`Cart for user ${customer_id} deleted successfully.`);
      
      // Track successful deletion
      mixpanel.track('Cart Deleted Successfully', {
        customer_id: customer_id
      });
      
      // Update user properties
      mixpanel.people.set(customer_id, {
        'cart_deleted_at': new Date().toISOString(),
        'has_active_cart': false
      });
    } else {
      console.log(`Cart for user ${customer_id} does not exist or was not deleted.`);
      
      // Track failed deletion
      mixpanel.track('Cart Deletion Failed', {
        customer_id: customer_id,
        reason: 'Cart not found'
      });
    }
  } catch (error) {
    logger.error('Error deleting cart:', error);
    
    // Track error
    mixpanel.track('Cart Deletion Error', {
      customer_id: customer_id,
      error_message: error.message
    });
    
    // Update user properties with error info
    mixpanel.people.set(customer_id, {
      'last_cart_deletion_error': error.message,
      'last_cart_deletion_error_time': new Date().toISOString()
    });
  }
};


const getOrdergenId = async (req, res) => {
  try {
    const token = req.headers['token'];
    logger.info('Token received:', token);

    let verified_data;
    try {
      verified_data = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      logger.error('Token verification failed:', err);
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ success: false, message: 'Token has expired' });
      } else if (err instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      } else {
        return res.status(401).json({ success: false, message: 'Token verification failed' });
      }
    }
    
    const customer_id = verified_data.id;
    
    
    
    // Track get order ID event
    mixpanel.track('Order ID Retrieved', {
      customer_id: customer_id
    });
    
    // Update user properties
    mixpanel.people.set(customer_id, {
      'last_order_id_request': new Date().toISOString()
    });
    
    const order_generated_id = await paymentmodel.getOrdergenId(customer_id);

    // Track successful retrieval
    mixpanel.track('Order ID Retrieved Successfully', {
      customer_id: customer_id,
      order_id: order_generated_id
    });
    
    // Update user properties with order ID
    mixpanel.people.set(customer_id, {
      'current_order_id': order_generated_id,
      'order_id_retrieved_at': new Date().toISOString()
    });

    res.status(200).json({ order_genid: order_generated_id });
  } catch (error) {
    logger.error("Error fetching order generated id: ", error);
    
    // If we have customer_id from earlier in the function
    if (typeof customer_id !== 'undefined') {
      // Track error
      mixpanel.track('Order ID Retrieval Error', {
        customer_id: customer_id,
        error_message: error.message
      });
      
      // Update user properties with error info
      mixpanel.people.set(customer_id, {
        'last_order_id_error': error.message,
        'last_order_id_error_time': new Date().toISOString()
      });
    }
    
    res.status(500).json({ message: "Error fetching order generated id", error });
  }
};


const getEOrdergenId = async (req, res) => {
  try {
    const token = req.headers['token'];
    logger.info('Token received for EOrder:', token);

    let verified_data;
    try {
      verified_data = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      logger.error('Token verification failed:', err);
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ success: false, message: 'Token has expired' });
      } else if (err instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      } else {
        return res.status(401).json({ success: false, message: 'Token verification failed' });
      }
    }

    const customer_id = verified_data.id;
   
    
    // Track EOrder ID request
    mixpanel.track('EOrder ID Requested', {
      customer_id: customer_id
    });
    
    // Update user properties
    mixpanel.people.set(customer_id, {
      'last_eorder_request': new Date().toISOString()
    });
    
    const customer = await customer_model.getCustomerDetails(customer_id);
    logger.info(`Customer details retrieved:${JSON.stringify(customer)}`);
    
    const order_generated_id = await paymentmodel.getEOrdergenId(customer.customer_generated_id);

    // Track successful retrieval
    mixpanel.track('EOrder ID Retrieved Successfully', {
      customer_id: customer_id,
      customer_generated_id: customer.customer_generated_id,
      order_id: order_generated_id
    });
    
    // Update user properties
    mixpanel.people.set(customer_id, {
      'current_eorder_id': order_generated_id,
      'eorder_id_retrieved_at': new Date().toISOString(),
      'customer_generated_id': customer.customer_generated_id
    });

    res.status(200).json({ order_genid: order_generated_id });
  } catch (error) {
    logger.error(`Error fetching order generated id:${error}`);
    
    // If we have customer_id from earlier in the function
    if (typeof customer_id !== 'undefined') {
      // Track error
      mixpanel.track('EOrder ID Retrieval Error', {
        customer_id: customer_id,
        error_message: error.message
      });
      
      // Update user properties
      mixpanel.people.set(customer_id, {
        'last_eorder_error': error.message,
        'last_eorder_error_time': new Date().toISOString()
      });
    }
    
    res.status(500).json({ message: "Error fetching order generated id", error });
  }
};

const create_order = async (req, res) => {
  console.log("entered");
  console.log('instances', razorpayInstance);

  try {
    const { amount, currency, customer_id } = req.body;
    
    // Identify user if customer_id is provided
    if (customer_id) {
      
      // Set user properties
      mixpanel.people.set(customer_id, {
        'order_creation_attempt': new Date().toISOString(),
        'order_amount': amount,
        'order_currency': currency
      });
    }
    
    const options = {
      amount: amount * 100, 
      currency,
      receipt: `receipt_${Date.now()}`,
    };
    
    console.log('instances', razorpayInstance);

    const order = await razorpayInstance.orders.create(options);

    // Track order creation event
    if (customer_id) {
      mixpanel.track('Payment Order Created', {
        order_id: order.id,
        amount: amount,
        currency: currency,
        customer_id: customer_id
      });
      
      // Update user properties with order details
      mixpanel.people.set(customer_id, {
        'last_order_id': order.id,
        'last_order_amount': amount,
        'last_order_currency': currency,
        'last_order_created_at': new Date().toISOString()
      });
    } else {
      // Track without customer identification
      mixpanel.track('Payment Order Created', {
        order_id: order.id,
        amount: amount,
        currency: currency
      });
    }

    console.log('order in back', order);
    res.json(order);
  } catch (error) {
    // Track error event
    if (req.body.customer_id) {
      
      mixpanel.track('Payment Order Creation Failed', {
        error_message: error.message,
        amount: req.body.amount,
        currency: req.body.currency,
        customer_id: req.body.customer_id
      });
      
      // Update user properties with error info
      mixpanel.people.set(req.body.customer_id, {
        'last_order_creation_error': error.message,
        'last_order_creation_error_time': new Date().toISOString()
      });
    } else {
      // Track without customer identification
      mixpanel.track('Payment Order Creation Failed', {
        error_message: error.message,
        amount: req.body.amount,
        currency: req.body.currency
      });
    }

    res.status(500).json({ error: error.message });
  }
};

const verify_payment = async (req, res) => {
  try {
    console.log("Verifying payment...");

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, customer_id } = req.body;
    
    if (customer_id) {
      
      // Set user properties
      mixpanel.people.set(customer_id, {
        'payment_verification_attempt': new Date().toISOString(),
        'payment_id': razorpay_payment_id,
        'order_id': razorpay_order_id
      });
    }
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      // Track verification failure
      if (customer_id) {
        mixpanel.track('Payment Verification Failed', {
          reason: 'Missing payment details',
          order_id: razorpay_order_id,
          customer_id: customer_id
        });
        
        // Update user properties
        mixpanel.people.set(customer_id, {
          'last_payment_verification_status': 'Failed - Missing Details',
          'last_payment_verification_time': new Date().toISOString()
        });
      } else {
        // Track without customer identification
        mixpanel.track('Payment Verification Failed', {
          reason: 'Missing payment details',
          order_id: razorpay_order_id
        });
      }

      return res.status(400).json({ success: false, message: "Invalid payment details" });
    }

    console.log("Verifying payment... -1");
    const secret = process.env.RAZORPAY_SECRET;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    console.log("Generated body:", body);

    // Generate expected signature
    const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");
    console.log("Expected Signature:", expectedSignature);
    console.log("Received Signature:", razorpay_signature);

    console.log("Verifying payment... -2");

    if (expectedSignature === razorpay_signature) {
      // Track successful verification
      if (customer_id) {
        mixpanel.track('Payment Verification Successful', {
          order_id: razorpay_order_id,
          payment_id: razorpay_payment_id,
          customer_id: customer_id
        });
        
        // Update user properties
        mixpanel.people.set(customer_id, {
          'last_payment_verification_status': 'Success',
          'last_payment_verification_time': new Date().toISOString(),
          'last_verified_payment_id': razorpay_payment_id
        });
      } else {
        // Track without customer identification
        mixpanel.track('Payment Verification Successful', {
          order_id: razorpay_order_id,
          payment_id: razorpay_payment_id
        });
      }

      return res.json({ success: true, message: "Payment Verified Successfully" });
    } else {
      // Track signature mismatch
      if (customer_id) {
        mixpanel.track('Payment Signature Mismatch', {
          order_id: razorpay_order_id,
          payment_id: razorpay_payment_id,
          customer_id: customer_id
        });
        
        // Update user properties
        mixpanel.people.set(customer_id, {
          'last_payment_verification_status': 'Failed - Signature Mismatch',
          'last_payment_verification_time': new Date().toISOString()
        });
      } else {
        // Track without customer identification
        mixpanel.track('Payment Signature Mismatch', {
          order_id: razorpay_order_id,
          payment_id: razorpay_payment_id
        });
      }

      return res.status(400).json({ success: false, message: "Payment Verification Failed" });
    }
  } catch (error) {
    // Track verification error
    if (req.body.customer_id) {
      
      mixpanel.track('Payment Verification Error', {
        error_message: error.message,
        customer_id: req.body.customer_id
      });
      
      // Update user properties with error info
      mixpanel.people.set(req.body.customer_id, {
        'last_payment_verification_error': error.message,
        'last_payment_verification_error_time': new Date().toISOString()
      });
    } else {
      // Track without customer identification
      mixpanel.track('Payment Verification Error', {
        error_message: error.message
      });
    }

    console.error("Error verifying payment:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
 

module.exports = { payment, updateCorporateOrder, getOrdergenId, getEOrdergenId ,deleteCorporateCart ,create_order,verify_payment};
