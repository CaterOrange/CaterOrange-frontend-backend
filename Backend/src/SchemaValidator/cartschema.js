// const cartSchema = {
//     type: "object",
//     properties: {
//       itemId: { 
//         type: "string", 
//         pattern: "^[a-zA-Z0-9-_ ]+$",
//         minLength: 1 
//       },
//       item: {
//         type: "object", 
//         properties: {
//           cart_order_details: { 
//             type: "string", 
//             pattern: "^\\[.*\\]$", 
//           },
//           total_amount: { type: "number", minimum: 0 }
//         },
//         required: ["cart_order_details", "total_amount"],
//         additionalProperties: false
//       }
//     },
//     required: ["itemId", "item"],
//     additionalProperties: false
//   };
  
  
//   const cartOrderDetailsSchema = {
//     type: "array", 
//     items: {
//       type: "object", 
//       properties: {
//         date: { type: "string", format: "date" },
//         type: { type: "string", minLength: 1 },
//         image: { type: "string", format: "uri" },
//         quantity: { type: "number", minimum: 1 },
//         price: { type: "number", minimum: 0 },
//         category_id: { type: "number", minimum: 1 }
//     },
//       required: ["date", "type", "image", "quantity", "price", "category_id"],
//       additionalProperties: false
//     }
//   };



// Define cartOrderDetailsSchema first
const cartOrderDetailsSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      date: { type: "string", format: "date" },
      type: { type: "string", minLength: 1 },
      image: { type: "string", format: "uri" },
      quantity: { type: "number", minimum: 1 },
      price: { type: "number", minimum: 0 },
      category_id: { type: "number", minimum: 1 }
    },
    required: ["date", "type", "image", "quantity", "price", "category_id"],
    additionalProperties: false
  }
};

// Define cartSchema after cartOrderDetailsSchema
const cartSchema = {
  type: "object",
  properties: {
    itemId: {
      type: "string",
      pattern: "^[a-zA-Z0-9-_ ]+$",
      minLength: 1
    },
    item: {
      type: "object",
      properties: {
        cart_order_details: { 
          oneOf: [ 
            {
              type: "string",
              pattern: "^\\[.*\\]$", 
            },
            cartOrderDetailsSchema // Directly validate as an array of objects
          ]
        },
        total_amount: { type: "number", minimum: 0 }
      },
      required: ["cart_order_details", "total_amount"],
      additionalProperties: false
    }
  },
  required: ["itemId", "item"],
  additionalProperties: false
};

  const eventCartSchema = {
    type: "object",
    properties: {
      totalAmount: {
        type: "string",
        pattern: "^[0-9]+(\\.[0-9]{2})?$", 
      },
      cartData: {
        type: "array",
        items: {
          type: "object",
          properties: {
            product_id: { type: "integer" },
            productid: { type: "string" },
            productname: { type: "string" },
            image: { type: "string", format: "uri" },
            category_name: { type: "string" },
            price_category: {
              type: ["string", "null"],
              enum: ["wt/qty", "pcs", null],
            },
            isdual: { type: "boolean" },
            plate_units: { type: ["string", "null"] },
            priceperunit: {
              type: ["string", "null"],
              pattern: "^[0-9]+(\\.[0-9]+)?$",
            },
            minunitsperplate: {
              type: ["integer", "null"],
            },
            wtorvol_units: { type: ["string", "null"] },
            price_per_wtorvol_units: {
              type: ["string", "null"],
              pattern: "^[0-9]+(\\.[0-9]+)?$",
            },
            min_wtorvol_units_per_plate: {
              type: ["integer", "null"],
            },
            addedat: {
              type: "string",
              format: "date-time",
            },
            isdeactivated: { type: "boolean" },
            description: { type: "string" },
            quantity: { type: "integer", minimum: 1 },
            unit: { type: "string" },
          },
          required: [
            "product_id",
            "productid",
            "productname",
            "image",
            "category_name",
            "isdual",
            "addedat",
            "isdeactivated",
            "description",
            "quantity",
            "unit",
          ],
          additionalProperties: false,
        },
      },
      // address: {
      //   type: "object",
      //   properties: {
      //     address_id: { type: "integer" },
      //     customer_id: {
      //       type: "string",
      //       pattern: "^C[0-9]{6}$",
      //     },
      //     tag: {
      //       type: "string",
      //     },
      //     pincode: {
      //       type: "string",
      //       pattern: "^[0-9]{6}$",
      //     },
      //     line1: { type: "string", minLength: 1 },
      //     line2: { type: "string", minLength: 1 },
      //     location: { type: "string" },
      //     ship_to_name: {
      //       type: "string",
      //       pattern: "^[A-Za-z\\s]+$",
      //       minLength: 1,
      //     },
      //     ship_to_phone_number: {
      //       type: "string",
      //       pattern: "^[0-9]{10}$",
      //     },
      //     added_at: { type: "string", format: "date-time" },
      //     group_id: { type: ["integer", "null"] },
      //   },
      //   required: [
      //     "address_id",
      //     "customer_id",
      //     "tag",
      //     "pincode",
      //     "line1",
      //     "line2",
      //     "location",
      //     "ship_to_name",
      //     "ship_to_phone_number",
      //     "added_at",
      //   ],
      //   additionalProperties: false,
      // },
      selectedDate: {
        type: "string",
      },
      numberOfPlates: {
        type: "string",
      },
      selectedTime: {
        type: "string",
      },
    },
    required: [
      "totalAmount",
      "cartData",
      // "address",
      "selectedDate",
      "numberOfPlates",
      "selectedTime",
    ],
    additionalProperties: false,
  };
  
  

  module.exports = {
    cartSchema,
    cartOrderDetailsSchema,
    eventCartSchema
  };
  