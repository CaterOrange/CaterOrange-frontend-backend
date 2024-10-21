const client = require('../config/dbConfig.js');
const paymentmodel = require('../models/eventpaymentnodel.js');
const logger = require('../config/logger'); // Ensure you have the logger configured

const event_payment = async (req, res) => {
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
    logger.info('Generated payment ID:', generatedPaymentId);

    // Now update the corporate order with the generated payment_id
    await updateCorporateOrder(order_id, generatedPaymentId, payment_status);

    res.status(200).json({ payment_id: generatedPaymentId });
  } catch (error) {
    logger.error("Error inserting payment data: ", error);
    res.status(500).json({ message: "Error inserting payment data", error });
  }
};

const updateCorporateOrder = async (order_id, paymentid, payment_status) => {
  try {
    // Update corporate order details in the database
    const result = await paymentmodel.updateeventOrder(order_id, paymentid, payment_status);
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

module.exports = { event_payment, updateCorporateOrder };
