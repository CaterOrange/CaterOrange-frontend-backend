const paymentSchema = {
    type: "object",
    properties: {
      paymentType: {
        type: "string",
        enum: ["NETBANKING"] // Assuming only NETBANKING is allowed
      },
      merchantTransactionId: {
        type: "string",
        minLength: 1
      },
      phonePeReferenceId: {
        type: "string",
        pattern: "^[A-Za-z0-9]+$" // Assuming alphanumeric reference ID
      },
      paymentFrom: {
        type: "string",
        enum: ["PhonePe"] // Only "PhonePe" is allowed
      },
      instrument: {
        type: "string",
        enum: ["N/A"] // Instrument can only be "N/A"
      },
      bankReferenceNo: {
        type: "string",
        enum: ["N/A"] // Bank reference number can only be "N/A"
      },
      amount: {
        type: "number",
        minimum: 0 
      },
      customer_id: {
        type: "string",
        pattern: "^C\\d{6}$" 
      },
      corporateorder_id: {
        type: "string",
        pattern: "^CO[A-Za-z0-9]+$"    
      }


    },
    required: [
      "paymentType",
      "merchantTransactionId",
      "phonePeReferenceId",
      "paymentFrom",
      "instrument",
      "bankReferenceNo",
      "amount",
      "customer_id",
      "corporateorder_id"
    ],
    additionalProperties: false
  };
  
  const eventpaymentSchema = {
    type: "object",
    properties: {
      paymentType: {
        type: "string",
      },
      merchantTransactionId: {
        type: "string",
        minLength: 1
      },
      phonePeReferenceId: {
        type: "string",
        pattern: "^[A-Za-z0-9]+$" // Assuming alphanumeric reference ID
      },
      paymentFrom: {
        type: "string",
      },
      instrument: {
        type: "string",
      },
      bankReferenceNo: {
        type: "string",
      },
      amount: {
        type: "number",
        minimum: 0 
      },
      customer_id: {
        type: "string",
        pattern: "^C\\d{6}$" 
      },
      corporateorder_id: {
        type: "string",
        pattern: "^EO[A-Za-z0-9]+$"    
      }


    },
    required: [
      "paymentType",
      "merchantTransactionId",
      "phonePeReferenceId",
      "paymentFrom",
      "instrument",
      "bankReferenceNo",
      "amount",
      "customer_id",
      "corporateorder_id"
    ],
    additionalProperties: false
  };
  
  module.exports = { paymentSchema,
    eventpaymentSchema
   };
  