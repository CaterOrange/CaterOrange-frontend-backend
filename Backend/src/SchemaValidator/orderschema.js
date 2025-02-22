const orderSchema = {
    type: "object",
    properties: {
      customer_generated_id: { 
        type: "string", 
        pattern: "^C\\d{6}$", // Assumes it follows the pattern "C" followed by 6 digits
        minLength: 7 
      },
      order_details: { 
        type: "array", // It should be an array of objects
        items: {
          type: "object",
          properties: {
            category_id: { 
              type: "number", 
              minimum: 1 
            },
            processing_date: { 
              type: "string", 
              format: "date" 
            },
            delivery_status: { 
              type: "string", 
              enum: [ "pending", "accepted", "shipped","delivered","cancelled by user","cancelled by admin"]  // Assuming these are possible statuses
            },
            quantity: { 
              type: "number", 
              minimum: 1 
            },
            active_quantity: { 
              type: "number", 
              minimum: 1 
            },
            media: { 
              type: ["string", "null"], 
              nullable: true 
            },
            delivery_details: { 
              type: ["string", "null"], 
              nullable: true 
            },
            accept_status: { 
              type: "string", 
              enum: [ "pending","accepted","rejected"] // Assuming these are possible statuses
            },
          },
          required: [
            "category_id", 
            "processing_date", 
            "delivery_status", 
            "quantity", 
            "active_quantity",
            "accept_status"
          ],
          additionalProperties: false
        }
      },
      total_amount: { 
        type: "number", 
        minimum: 0 
      },
      paymentid: { 
        type: ["string", "null"], // Can be string or null
        nullable: true 
      },
      customer_address: {
        type: "object", // Now it's an object, not a string
        properties: {
          address_id: { 
            type: "number", 
            minimum: 1 
          },
          customer_id: { 
            type: "string", 
            pattern: "^C\\d{6}$" // Matches customer ID pattern like "C000001"
          },
          tag: { 
            type: "string", 
            minLength: 1 
          },
          pincode: { 
            type: "string", 
            pattern: "^\\d{6}$" // Assuming pincode is a 6-digit number
          },
          line1: { 
            type: "string", 
            minLength: 1 
          },
          line2: { 
            type: "string", 
            minLength: 1 
          },
          location: { 
            type: "string", 
          },
          ship_to_name: { 
            type: "string", 
            minLength: 1 
          },
          ship_to_phone_number: { 
            type: "string", 
            pattern: "^\\d{10}$" // Assuming 10-digit phone number
          },
          added_at: { 
            type: "string", 
            format: "date-time" 
          },
          group_id: { 
            type: ["string", "null"], 
            nullable: true 
          }
        },
        required: [
          "address_id", 
          "customer_id", 
          "tag", 
          "pincode", 
          "line1", 
          "line2", 
          "location", 
          "ship_to_name", 
          "ship_to_phone_number", 
          "added_at"
        ],
        additionalProperties: false
      },
      payment_status: { 
        type: "string", 
        enum: ["pending", "Success", "failed"] // Assuming the status can be one of these
      }
    },
    required: [
      "customer_generated_id", 
      "order_details", 
      "total_amount", 
      "payment_status"
    ],
    additionalProperties: false
  };
  const eventOrderSchema = {
    type: "object",
    properties: {
      delivery_status: {
        type: "string",
        enum: [ "processing", "shipped", "delivered"] 
      },
      total_amount: {
        type: "string",
        pattern: "^[0-9]+(\\.[0-9]{2})?$", 
      },
      PaymentId: {
        type: ["string", "null"],
      },
      delivery_details: {
        type: ["string", "null"],
    
      },
      event_order_details: {
        type: "string",
        pattern: "^(\\[.*\\])$", 
        properties: {
          product_id: {
            type: "integer",
          },
          productid: {
            type: "string",
          },
          productname: {
            type: "string",
          },
          image: {
            type: "string",
            format: "uri", // Validates as a URI
          },
          category_name: {
            type: "string",
          },
          price_category: {
            type: "string",
            enum: ["pcs", "kg", "liters", "units"], // Example values; customize as needed
          },
          isdual: {
            type: "boolean",
          },
          plate_units: {
            type: "string",
          },
          priceperunit: {
            type: "string",
            pattern: "^[0-9]+(\\.[0-9]{1,2})?$", // Validates decimal format
          },
          minunitsperplate: {
            type: "integer",
          },
          wtorvol_units: {
            type: ["string", "null"],
          },
          price_per_wtorvol_units: {
            type: ["string", "null"],
            pattern: "^[0-9]+(\\.[0-9]{1,2})?$", // Validates decimal format
          },
          min_wtorvol_units_per_plate: {
            type: ["integer", "null"],
          },
          addedat: {
            type: "string",
            format: "date-time", // Validates ISO 8601 date-time format
          },
          isdeactivated: {
            type: "boolean",
          },
          description: {
            type: "string",
          },
          quantity: {
            type: "integer",
          },
          unit: {
            type: "string",
          },
        },
        required: [
          "product_id",
          "productid",
          "productname",
          "image",
          "category_name",
          "price_category",
          "isdual",
          "plate_units",
          "priceperunit",
          "minunitsperplate",
          "addedat",
          "isdeactivated",
          "description",
          "quantity",
          "unit",
        ],
        additionalProperties: false,
      },
      event_media: {
        type: ["string", "null"], // Media can be a string (e.g., URL) or null
      },
      customer_address: {
        type: "string",
        properties: {
          address_id: {
            type: "integer",
          },
          customer_id: {
            type: "string",
            pattern: "^C[0-9]{6}$", // Pattern for 'C' followed by 6 digits
          },
          tag: {
            type: "string",
          },
          pincode: {
            type: "string",
            pattern: "^[0-9]{6}$", // Exactly 6 digits
          },
          line1: {
            type: "string",
          },
          line2: {
            type: "string",
          },
          location: {
            type: "string",
           
          },
          ship_to_name: {
            type: "string",
            pattern: "^[A-Za-z\\s]+$", // Allows only alphabets and spaces
          },
          ship_to_phone_number: {
            type: "string",
            pattern: "^[0-9]{10}$", // Exactly 10 digits
          },
          added_at: {
            type: "string",
            format: "date-time", // Validates ISO 8601 date-time format
          },
          group_id: {
            type: ["integer", "null"], // Group ID can be an integer or null
          },
        },
        required: [
          "address_id",
          "customer_id",
          "tag",
          "pincode",
          "line1",
          "line2",
          "location",
          "ship_to_name",
          "ship_to_phone_number",
          "added_at",
        ],
        additionalProperties: false,
      },
      payment_status: {
        type: "string",
        enum: ["pending", "paid", "failed"], // Allowed payment statuses
      },
      event_order_status: {
        type: "string",
      },
      number_of_plates: {
        type: "string",
        pattern: "^[0-9]+$", // Validates numeric string
      },
      processing_date: {
        type: "string",
      },
      processing_time: {
        type: "string",
      },
    },
    required: [
      "delivery_status",
      "total_amount",
      "PaymentId",
      "delivery_details",
      "event_order_details",
      "customer_address",
      "payment_status",
      "event_order_status",
      "number_of_plates",
      "processing_date",
      "processing_time",
    ],
    additionalProperties: false,
  };


  
  
module.exports = {
  orderSchema,
  eventOrderSchema
}  