const client = require('../config/dbConfig.js');
const paymentmodel = require('../models/paymentModels.js');
const logger = require('../config/logger.js');
const jwt = require('jsonwebtoken');
const customer_model = require('../models/customerModels');

const payment = async (req, res) => {
  const { paymentType, merchantTransactionId, phonePeReferenceId, paymentFrom, instrument, bankReferenceNo, amount, customer_id, corporateorder_id } = req.body;

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

    const order_id = corporateorder_id; // or however you get it
    const payment_status = 'Success'; // or however you determine the status
    console.log('hi',generatedPaymentId)
    logger.info('Generated Payment ID:', generatedPaymentId);

    // Now update the corporate order with the generated payment_id
    await updateCorporateOrder(order_id, generatedPaymentId, payment_status);
    await deleteCorporateCart(customer_id)
    res.status(200).json({ payment_id: generatedPaymentId });
  } catch (error) {
    logger.error("Error inserting payment data: ", error);
    res.status(500).json({ message: "Error inserting payment data", error });
  }
};

const updateCorporateOrder = async (order_id, paymentid, payment_status) => {
  try {
    // Update corporate order details in the database
    const result = await paymentmodel.updateOrder(order_id, paymentid, payment_status);
    logger.info('Result in payment update:', result);
    
    if (result.rowCount > 0) {
      logger.info('Corporate order updated successfully');
    } else {
      logger.warn('Corporate order not found for order ID:', order_id);
      // You can return an error response if needed, uncomment below line
      // return res.status(404).json({ message: 'Corporate order not found' });
    }
  } catch (error) {
    logger.error('Error updating corporate order:', error);
    // You can return an error response if needed, uncomment below line
    // return res.status(500).json({ message: 'Error updating corporate order' });
  }
};

const deleteCorporateCart= async (customer_id) => {
  try {
    // Update corporate order details in the database
    const result = await paymentmodel.deleteCart(customer_id);
    
    if (result.rowCount > 0) {
      logger.info('deleted cart successfully');
    } else {
      logger.warn('Corporate carts not found for customer ID:', customer_id);
      // You can return an error response if needed, uncomment below line
      // return res.status(404).json({ message: 'Corporate order not found' });
    }
  } catch (error) {
    logger.error('Error updating corporate order:', error);
    // You can return an error response if needed, uncomment below line
    // return res.status(500).json({ message: 'Error updating corporate order' });
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
    const order_generated_id = await paymentmodel.getOrdergenId(customer_id);

    res.status(200).json({ order_genid: order_generated_id });
  } catch (error) {
    logger.error("Error fetching order generated id: ", error);
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
    const customer = await customer_model.getCustomerDetails(customer_id);
    logger.info(`Customer details retrieved:${JSON.stringify(customer)}`);
    
    const order_generated_id = await paymentmodel.getEOrdergenId(customer.customer_generated_id);

    res.status(200).json({ order_genid: order_generated_id });
  } catch (error) {
    logger.error(`Error fetching order generated id:${error}`);
    res.status(500).json({ message: "Error fetching order generated id", error });
  }
};

module.exports = { payment, updateCorporateOrder, getOrdergenId, getEOrdergenId ,deleteCorporateCart};
