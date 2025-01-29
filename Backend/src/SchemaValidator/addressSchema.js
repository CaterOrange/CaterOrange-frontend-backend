const addressSchema = {
    type: "object",
    properties: {
      address_id: {
        type: "integer", 
      },
      customer_id: {
        type: "string", 
        pattern: "^C[0-9]{6}$", 
      },
      tag: {
        type: "string", 
      },
      pincode: {
        type: "string", 
        pattern: "^[0-9]{6}$",
      },
      line1: {
        type: "string",
        minLength: 1, 
      },
      line2: {
        type: "string", 
        minLength: 1, 
      },
      location: {
        type: "string", 
      },
      ship_to_name: {
        type: "string", 
        pattern: "^[A-Za-z\\s]+$", 
        minLength: 1, 
      },
      ship_to_phone_number: {
        type: "string", 
        pattern: "^[0-9]{10}$",
        
      },
      added_at: {
        type: "string",
        format: "date-time", 
      },
      group_id: {
        type: ["integer", "null"], 
      },
    },
    required: [
      "tag",
      "pincode",
      "line1",
      "line2",
      "location",
      "ship_to_name",
      "ship_to_phone_number",
    ],
    additionalProperties: false, 
  };
  
  module.exports = { addressSchema };
  