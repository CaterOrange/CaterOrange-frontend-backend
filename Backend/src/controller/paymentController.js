const client = require('../config/dbConfig.js');
const payment=  async (req, res) => {
    const { paymentType, merchantTransactionId, phonePeReferenceId, paymentFrom, instrument, bankReferenceNo, amount, customer_id} = req.body;
  
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
      );
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
      await client.query(insertPaymentQuery, values); // Execute the insert query
      console.log("Payment inserted successfully.");
      res.status(200).json({ message: "Payment inserted successfully" });
    } catch (error) {
      console.error("Error inserting payment data: ", error);
      res.status(500).json({ message: "Error inserting payment data", error });
    }
  };
  module.exports ={payment}
  
