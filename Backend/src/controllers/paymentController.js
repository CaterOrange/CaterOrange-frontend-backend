
const client = require('../config/dbconfig.js');
const paymentmodel = require('../../models/paymentModel.js')
const payment = async (req, res) => {
  const { paymentType, merchantTransactionId, phonePeReferenceId, paymentFrom, instrument, bankReferenceNo, amount, customer_id,corporateorder_id } = req.body;

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
    const payment_status = 'Success'; 
    await updateCorporateOrder(order_id, generatedPaymentId, payment_status);

    res.status(200).json({ payment_id: generatedPaymentId });
  } catch (error) {
    console.error("Error inserting payment data: ", error);
    res.status(500).json({ message: "Error inserting payment data", error });
  }
};

  const updateCorporateOrder = async (order_id, paymentid, payment_status) => {
    
    try {
        
        const result = await paymentmodel.updateOrder(order_id, paymentid, payment_status);

        if (result.rowCount > 0) {
            console.log('Corporate order updated successfully' );
        } else {
            //res.status(404).json({ message: 'Corporate order not found' });
        }
    } catch (error) {
        console.error('Error updating corporate order:', error);
        //res.status(500).json({ message: 'Error updating corporate order' });
    }
};
  module.exports ={payment,updateCorporateOrder }
