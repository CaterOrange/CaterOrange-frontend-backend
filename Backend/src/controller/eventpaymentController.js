const client = require('../config/dbConfig.js');
const paymentmodel = require('../models/eventpaymentnodel.js');
const logger = require('../config/logger'); // Ensure you have the logger configured
const Redis = require('ioredis');

const redis = new Redis({
  host: 'localhost',  
  port: 6379, 
 connectTimeout: 20000
});


const Ajv = require("ajv");

const addFormats = require("ajv-formats");

const ajv = new Ajv({ allErrors: true, strict: false });

addFormats(ajv);
const { eventpaymentSchema } = require('../SchemaValidator/paymentSchema.js'); 
const validate = ajv.compile(eventpaymentSchema);

const event_payment = async (req, res) => {
  const { paymentType, merchantTransactionId, phonePeReferenceId, paymentFrom, instrument, bankReferenceNo, amount, customer_id,corporateorder_id } = req.body;
  console.log("event order data:",corporateorder_id);
  const valid = validate(req.body);
console.log('validate payment',valid)
if (!valid) {
  console.log("Error validation for payment",validate.errors)
  return res.status(400).json({
    message: 'Validation failed',
    errors: validate.errors
  });
}
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
    logger.info('Generated payment ID:', generatedPaymentId);
    console.log("Payment id",generatedPaymentId)
    // Now update the corporate order with the generated payment_id
    await updateCorporateOrder(order_id, generatedPaymentId, payment_status);
    await deleteEventCart(customer_id)
    console.log("After successful updation")
    res.status(200).json({ payment_id: generatedPaymentId });
  } catch (error) {
    logger.error("Error inserting payment data: ", error);
    res.status(500).json({ message: "Error inserting payment data", error });
  }
};

const updateCorporateOrder = async (order_id, paymentid, payment_status) => {
  try {
    // Update corporate order details in the database
    console.log("Before REsult")
    const result = await paymentmodel.updateeventOrder(order_id, paymentid, payment_status);

    logger.info('Result in payment update:', result);
    console.log("result",result)
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
const deleteEventCart= async (customer_id) => {
  try {
    // Update corporate order details in the database
    const result = await redis.del(`E${customer_id}`);
    req.io.emit("EventcartUpdated",{customer_id});

    if (result === 1) {
      console.log(`Cart for user ${customer_id} deleted successfully.`);
    } else {
      console.log(`Cart for user ${customer_id} does not exist or was not deleted.`);
    }
  } catch (error) {
    logger.error('Error updating corporate order:', error);
    // You can return an error response if needed, uncomment below line
    // return res.status(500).json({ message: 'Error updating corporate order' });
  }
};
module.exports = { event_payment, updateCorporateOrder,deleteEventCart };
