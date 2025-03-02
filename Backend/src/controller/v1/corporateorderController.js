// const corporate_model = require('../../models/v1/corporateorderModels.js');
// const logger = require('../../config/logger.js');
// const customer_model = require('../../models/v1/customerModels.js');
// require('dotenv').config();
// const jwt = require('jsonwebtoken');
// const Redis = require('ioredis');
// const redis = new Redis({
//   host: 'localhost',  
//   port: 6379,   
// });
// redis.ping().then(() => {
//   logger.info('Successfully connected to Redis');
// }).catch(err => {
//   logger.error('Redis connection failed:', err);
// });

// const Ajv = require("ajv");

// const addFormats = require("ajv-formats");

// const ajv = new Ajv({ allErrors: true, strict: false });

// addFormats(ajv);

// const {orderSchema } = require("../../SchemaValidator/orderschema.js")
// // Fetch corporate categories
// const GetCorporateCategory = async (req, res) => {
//   try {
//     const categories = await corporate_model.getCorporateCategories();
//     logger.info('Corporate categories fetched successfully');
//     return res.json({
//       success: true,
//       categories
//     });
//   } catch (err) {
//     logger.error('Error fetching corporate categories', { error: err.message });
//     res.status(500).json({ error: err.message });
//   }
// };

// // Add items to the corporate cart
// const add_Corporate_Cart = async (req, res) => {
//   try {
//     const { cart_order_details, total_amount } = req.body;
//     const token = req.headers['token'];

//     if (!token) {
//       logger.warn('Access token missing');
//       return res.status(401).json({ success: false, message: 'Access token is missing or not provided' });
//     }

//     let verified_data;
//     try {
//       verified_data = jwt.verify(token, process.env.SECRET_KEY);
//       logger.info('Token verified successfully');
//     } catch (err) {
//       logger.error('Token verification failed', { error: err.message });
//       if (err instanceof jwt.TokenExpiredError) {
//         return res.status(401).json({ success: false, message: 'Token has expired' });
//       } else {
//         return res.status(401).json({ success: false, message: 'Invalid token' });
//       }
//     }

//     const customer_generated_id = verified_data.id;
//     const newCart = await corporate_model.add_cart(customer_generated_id, cart_order_details, total_amount);

//     if (!newCart) {
//       throw new Error('Cart creation failed');
//     }

//     logger.info('Cart created successfully', { cartId: newCart.id });
//     res.json({
//       success: true,
//       message: 'Cart created successfully',
//       cart: newCart
//     });
//   } catch (err) {
//     logger.error('Error during cart creation', { error: err.message });
//     res.status(500).json({ success: false, message: 'Error during cart creation', error: err.message });
//   }
// };

// // Fetch corporate cart for user
// const getCorporateCart = async (req, res) => {
//   try {
//     const token = req.headers['token'];
//     if (!token) {
//       logger.warn('Access token missing');
//       return res.status(401).json({ success: false, message: 'Access token is missing or not provided' });
//     }

//     let verified_data;
//     try {
//       verified_data = jwt.verify(token, process.env.SECRET_KEY);
//       logger.info('Token verified successfully');
//     } catch (err) {
//       logger.error('Token verification failed', { error: err.message });
//       if (err instanceof jwt.TokenExpiredError) {
//         return res.status(401).json({ success: false, message: 'Token has expired' });
//       } else {
//         return res.status(401).json({ success: false, message: 'Invalid token' });
//       }
//     }

//     const customer_generated_id = verified_data.id;
//     // const customer = await corporate_model.findCustomerByGid(customer_generated_id);

//     // if (!customer) {
//     //   logger.error('User not found', { customerId: customer_generated_id });
//     //   return res.status(404).json({ success: false, message: 'User not found' });
//     // }

//     // logger.info('Fetching cart for customer', { customerId: customer.customer_id });
//     const carts = await corporate_model.getCarts(customer_generated_id);
//     res.json(carts);
//   } catch (err) {
//     logger.error('Error fetching corporate cart', { error: err.message });
//     res.status(500).json({ error: err.message });
//   }
// };

// // Update a corporate cart item
// const updateCartItem = async (req, res) => {
//   try {
//     const corporatecart_id = req.params.corporatecart_id;
//     const { date, quantity } = req.body;

//     logger.info('Updating cart item', { cartId: corporatecart_id, date, quantity });
//     const result = await corporate_model.updateQuantity(corporatecart_id, date, quantity);
    
//     res.json({
//       success: true,
//       message: 'Cart item updated successfully'
//     });
//   } catch (err) {
//     logger.error('Error updating cart item', { error: err.message });
//     res.status(500).json({ error: err.message });
//   }
// };

// // Delete a corporate cart item
// const deleteCartItem = async (req, res) => {
//   try {
//     const corporatecart_id = req.params.corporatecart_id;
//     const { date } = req.body;

//     if (!date) {
//       logger.warn('Date is missing in the delete cart request');
//       return res.status(400).json({ error: 'Date is required' });
//     }

//     logger.info('Deleting cart item', { cartId: corporatecart_id, date });
//     const result = await corporate_model.deleteCart(corporatecart_id, date);

//     res.json({
//       success: true,
//       message: 'Cart item deleted successfully'
//     });
//   } catch (err) {
//     logger.error('Error deleting cart item', { error: err.message });
//     res.status(500).json({ error: err.message });
//   }
// };

// const addCorporateOrderDetails = async (req, res) => {
//   const { corporateorder_generated_id, processing_date, delivery_status, category_id, quantity, active_quantity, media, delivery_details } = req.body;
  
//   try {
//     logger.info('Adding corporate order details', { corporateorder_generated_id, processing_date, delivery_status, category_id });
    
//     const insertedDetail = await corporate_model.insertCorporateOrderDetails(corporateorder_generated_id, processing_date, delivery_status, category_id, quantity, active_quantity, media, delivery_details);

//     res.status(201).json({
//       success: true,
//       message: 'Order details added successfully',
//       data: insertedDetail
//     });
//   } catch (error) {
//     logger.error('Error adding corporate order details', { error: error.message });
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

// // Get order details for user
// const getOrderDetails = async (req, res) => {
//   try {
//     const token = req.headers['token'];

//     let verified_data;
//     try {
//       verified_data = jwt.verify(token, process.env.SECRET_KEY);
//       console.log("verified data",verified_data);
//       logger.info('Token verified successfully for fetching order details');
//     } catch (err) {
//       logger.error('Token verification failed', { error: err.message });
//       return res.status(401).json({ success: false, message: 'Invalid or expired token' });
//     }

//     const customer_id = verified_data.id;
//     const customer = await customer_model.getCustomerDetails(customer_id);

//     if (!customer) {
//       logger.warn('Customer not found', { customerId: customer_id });
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     logger.info('Fetching order details for customer', { customerId: customer_id });
//     const order = await corporate_model.getOrderDetailsById(customer_id);

//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }

//     res.status(200).json({ data: order });
//   } catch (error) {
//     logger.error('Error retrieving order details', { error: error.message });
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const transferCartToOrder = async (req, res) => {
//   const { 
//     customer_generated_id, 
//     order_details, 
//     total_amount, 
//     paymentid, 
//     customer_address, 
//     payment_status,
//     corporate_order_status 
//   } = req.body;

//   console.log("order123", req.body);

//   try {
//     // Parse JSON strings into objects/arrays
//     req.body.order_details = Array.isArray(order_details) ? order_details : JSON.parse(order_details);
//     req.body.customer_address = JSON.parse(customer_address);
//   } catch (err) {
//     return res.status(400).json({ error: 'Invalid JSON format in order_details or customer_address' });
//   }

//   try {
//     logger.info('Transferring cart to order', { 
//       customer_generated_id, 
//       total_amount, 
//       paymentid 
//     });

//     // Insert the corporate order and get the generated corporate order ID
//     const order = await corporate_model.insertCartToOrder(
//       customer_generated_id,
//       req.body.order_details,
//       total_amount,
//       paymentid,
//       req.body.customer_address,
//       payment_status,
//       corporate_order_status
//     );

//     res.json({
//       success: true,
//       order
//     });
//   } catch (err) {
//     logger.error('Error transferring cart to order', { error: err.message });
//     res.status(500).json({ error: err.message });
//   }
// };
// // Get category name by ID
// const getcategorynameById = async (req, res) => {
//   const { categoryId } = req.body;
//   try {
//     const categoryname = await corporate_model.getcategoryname(categoryId);
//     logger.info(`Fetched category name { ${categoryId} `);
//     return res.json({
//       success: true,
//       categoryname
//     });
//   } catch (err) {
//     logger.error('Error fetching category name', { error: err.message });
//     res.status(500).json({ error: err.message });
//   }
// };
// // const updateOrderDetails = async (req, res) => {
// //   try {
// //     const { corporateOrderId } = req.params;
// //     const { order_details } = req.body;

// //     const updatedOrder = await corporate_model.updateOrderDetailsIds(
// //       corporateOrderId,
// //       order_details
// //     );

// //     res.json({
// //       success: true,
// //       order: updatedOrder
// //     });
// //   } catch (err) {
// //     logger.error('Error updating order details', { error: err.message });
// //     res.status(500).json({ error: err.message });
// //   }
// // };
// // const getCartCount = async (req, res) => {
// //   try {
// //     const token = req.headers['token'];

// //     let verified_data;
// //     try {
// //       verified_data = jwt.verify(token, process.env.SECRET_KEY);
// //       logger.info('Token verified successfully for fetching cart count');
// //     } catch (err) {
// //       logger.error('Token verification failed', { error: err.message });
// //       return res.status(401).json({ success: false, message: 'Invalid or expired token' });
// //     }

// //     const customer_id = verified_data.id;
// //     const customer = await customer_model.getCustomerDetails(customer_id);

// //     if (!customer) {
// //       logger.warn('Customer not found', { customerId: customer_id });
// //       return res.status(404).json({ success: false, message: 'User not found' });
// //     }

// //     const count = await corporate_model.getCartCountById(customer_id);

// //     if (!count) {  
// //       return res.status(200).json({ message: 'Count is Empty' });
// //     }

// //     res.status(200).json({ data: count });
// //   } catch (error) {
// //     logger.error('Error retrieving cart count', { error: error.message });
// //     res.status(500).json({ message: 'Server error' });
// //   }
// // };
// const updateOrderDetails = async (req, res) => {
//   try {
//     const { corporateOrderId } = req.params;
    
//     const updatedOrder = await corporate_model.updateOrderDetailsIds(
//       corporateOrderId
//     );
    
//     res.json({
//       success: true,
//       order: updatedOrder
//     });
//   } catch (err) {
//     logger.error('Error updating order details', { error: err.message });
//     res.status(500).json({ error: err.message });
//   }
// };

// const getCartCount = async (req, res) => {
//   try {
//     const token = req.headers['token'];
    
//     let verified_data;
//     try {
//       verified_data = jwt.verify(token, process.env.SECRET_KEY);
//     } catch (err) {
//       return res.status(401).json({ success: false, message: 'Invalid or expired token' });
//     }
    
//     const userId = verified_data.id;
//     const CartData = await redis.hgetall(`cart:${userId}`);
    
//     if (!CartData || Object.keys(CartData).length === 0) {
//       return res.json({ success: true, totalCartCount: 0 });
//     }
//     let totalCartCount = 0;
    
//     Object.entries(CartData).forEach(([key, value]) => {
//       const parsedCart = parseNestedJSON(value);
      
//       if (!parsedCart || typeof parsedCart !== 'object') {
//         console.error('Invalid cart data format', key);
//         return;
//       }
      
//       const orderDetails = parseNestedJSON(parsedCart.cart_order_details);
      
//       if (Array.isArray(orderDetails)) {
//         totalCartCount += orderDetails.reduce((sum, detail) => sum + detail.quantity, 0);
//       }
//     });
//  console.log('total',totalCartCount)
//     res.json({
//       success: true,
//       totalCartCount
//     });
//   } catch (error) {
//     logger.error('Error retrieving cart count', { error: error.message });
//     res.status(500).json({ message: 'Server error' });
//   }
// };
// // Utility function to recursively parse nested JSON
// function parseNestedJSON(input) {
//   if (typeof input !== 'string') return input;

//   try {
//     const parsed = JSON.parse(input);
    
//     // If the parsed result is a string, try parsing again
//     if (typeof parsed === 'string') {
//       return parseNestedJSON(parsed);
//     }
    
//     return parsed;
//   } catch (error) {
//     console.error('Failed to parse JSON', input);
//     return null;
//   }
// }


// module.exports = {
//   addCorporateOrderDetails,
//   getOrderDetails,
//   getcategorynameById,
//   transferCartToOrder,
//   add_Corporate_Cart,
//   getCorporateCart,
//   GetCorporateCategory,
//   updateCartItem,
//   deleteCartItem,
//   getCartCount,
//   updateOrderDetails,
 
// };
const corporate_model = require('../../models/v1/corporateorderModels.js');
const logger = require('../../config/logger.js');
const customer_model = require('../../models/v1/customerModels.js');
const client = require('../../config/dbConfig.js');

require('dotenv').config();
const jwt = require('jsonwebtoken');
const Redis = require('ioredis');
const redis = new Redis({
  host: 'localhost',  
  port: 6379,   
});
redis.ping().then(() => {
  logger.info('Successfully connected to Redis');
}).catch(err => {
  logger.error('Redis connection failed:', err);
});

const Ajv = require("ajv");

const addFormats = require("ajv-formats");

const ajv = new Ajv({ allErrors: true, strict: false });

addFormats(ajv);

const {orderSchema } = require("../../SchemaValidator/orderschema.js")
// Fetch corporate categories
const GetCorporateCategory = async (req, res) => {
  try {
    const categories = await corporate_model.getCorporateCategories();
    logger.info('Corporate categories fetched successfully');
    return res.json({
      success: true,
      categories
    });
  } catch (err) {
    logger.error('Error fetching corporate categories', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

// Add items to the corporate cart
const add_Corporate_Cart = async (req, res) => {
  try {
    const { cart_order_details, total_amount } = req.body;
    const token = req.headers['token'];

    if (!token) {
      logger.warn('Access token missing');
      return res.status(401).json({ success: false, message: 'Access token is missing or not provided' });
    }

    let verified_data;
    try {
      verified_data = jwt.verify(token, process.env.SECRET_KEY);
      logger.info('Token verified successfully');
    } catch (err) {
      logger.error('Token verification failed', { error: err.message });
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ success: false, message: 'Token has expired' });
      } else {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }
    }

    const customer_generated_id = verified_data.id;
    const newCart = await corporate_model.add_cart(customer_generated_id, cart_order_details, total_amount);

    if (!newCart) {
      throw new Error('Cart creation failed');
    }

    logger.info('Cart created successfully', { cartId: newCart.id });
    res.json({
      success: true,
      message: 'Cart created successfully',
      cart: newCart
    });
  } catch (err) {
    logger.error('Error during cart creation', { error: err.message });
    res.status(500).json({ success: false, message: 'Error during cart creation', error: err.message });
  }
};

// Fetch corporate cart for user
const getCorporateCart = async (req, res) => {
  try {
    const token = req.headers['token'];
    if (!token) {
      logger.warn('Access token missing');
      return res.status(401).json({ success: false, message: 'Access token is missing or not provided' });
    }

    let verified_data;
    try {
      verified_data = jwt.verify(token, process.env.SECRET_KEY);
      logger.info('Token verified successfully');
    } catch (err) {
      logger.error('Token verification failed', { error: err.message });
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ success: false, message: 'Token has expired' });
      } else {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }
    }

    const customer_generated_id = verified_data.id;
    // const customer = await corporate_model.findCustomerByGid(customer_generated_id);

    // if (!customer) {
    //   logger.error('User not found', { customerId: customer_generated_id });
    //   return res.status(404).json({ success: false, message: 'User not found' });
    // }

    // logger.info('Fetching cart for customer', { customerId: customer.customer_id });
    const carts = await corporate_model.getCarts(customer_generated_id);
    res.json(carts);
  } catch (err) {
    logger.error('Error fetching corporate cart', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

// Update a corporate cart item
const updateCartItem = async (req, res) => {
  try {
    const corporatecart_id = req.params.corporatecart_id;
    const { date, quantity } = req.body;

    logger.info('Updating cart item', { cartId: corporatecart_id, date, quantity });
    const result = await corporate_model.updateQuantity(corporatecart_id, date, quantity);
    
    res.json({
      success: true,
      message: 'Cart item updated successfully'
    });
  } catch (err) {
    logger.error('Error updating cart item', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

// Delete a corporate cart item
const deleteCartItem = async (req, res) => {
  try {
    const corporatecart_id = req.params.corporatecart_id;
    const { date } = req.body;

    if (!date) {
      logger.warn('Date is missing in the delete cart request');
      return res.status(400).json({ error: 'Date is required' });
    }

    logger.info('Deleting cart item', { cartId: corporatecart_id, date });
    const result = await corporate_model.deleteCart(corporatecart_id, date);

    res.json({
      success: true,
      message: 'Cart item deleted successfully'
    });
  } catch (err) {
    logger.error('Error deleting cart item', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

const addCorporateOrderDetails = async (req, res) => {
  const { corporateorder_generated_id, processing_date, delivery_status, category_id, quantity, active_quantity, media, delivery_details } = req.body;
  
  try {
    logger.info('Adding corporate order details', { corporateorder_generated_id, processing_date, delivery_status, category_id });
    
    const insertedDetail = await corporate_model.insertCorporateOrderDetails(corporateorder_generated_id, processing_date, delivery_status, category_id, quantity, active_quantity, media, delivery_details);

    res.status(201).json({
      success: true,
      message: 'Order details added successfully',
      data: insertedDetail
    });
  } catch (error) {
    logger.error('Error adding corporate order details', { error: error.message });
    res.status(500).json({ message: 'Server error', error });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const token = req.headers['token'];

    let verified_data;
    try {
      verified_data = jwt.verify(token, process.env.SECRET_KEY);
      console.log("verified data",verified_data);
      logger.info('Token verified successfully for fetching order details');
    } catch (err) {
      logger.error('Token verification failed', { error: err.message });
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    const customer_id = verified_data.id;
    const customer = await customer_model.getCustomerDetails(customer_id);

    if (!customer) {
      logger.warn('Customer not found', { customerId: customer_id });
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    logger.info('Fetching order details for customer', { customerId: customer_id });
    const order = await corporate_model.getOrderDetailsById(customer_id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ data: order });
  } catch (error) {
    logger.error('Error retrieving order details', { error: error.message });
    res.status(500).json({ message: 'Server error' });
  }
};

const transferCartToOrder = async (req, res) => {
  const { 
    customer_generated_id, 
    order_details, 
    total_amount, 
    paymentid, 
    customer_address, 
    payment_status,
    corporate_order_status 
  } = req.body;

  console.log("order123", req.body);

  try {
    // Parse JSON strings into objects/arrays
    req.body.order_details = Array.isArray(order_details) ? order_details : JSON.parse(order_details);
    req.body.customer_address = JSON.parse(customer_address);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid JSON format in order_details or customer_address' });
  }

  try {
    logger.info('Transferring cart to order', { 
      customer_generated_id, 
      total_amount, 
      paymentid 
    });

    // Insert the corporate order and get the generated corporate order ID
    const order = await corporate_model.insertCartToOrder(
      customer_generated_id,
      req.body.order_details,
      total_amount,
      paymentid,
      req.body.customer_address,
      payment_status,
      corporate_order_status
    );

    res.json({
      success: true,
      order
    });
  } catch (err) {
    logger.error('Error transferring cart to order', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};
// Get category name by ID
const getcategorynameById = async (req, res) => {
  console.log('Request body:', req.body);
  const { categoryId } = req.body;
  
  if (!categoryId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing categoryId' 
    });
  }
  
  try {
    const categoryname = await corporate_model.getcategoryname(categoryId);
    console.log(`Fetched category name for ID: ${categoryId}`, categoryname);
    
    if (!categoryname || !categoryname.category_name) {
      return res.json({
        success: true,
        categoryname: { category_name: 'Unknown', category_price: 0 }
      });
    }
    
    return res.json({
      success: true,
      categoryname
    });
  } catch (err) {
    console.error('Error fetching category name', err);
    res.status(500).json({ error: err.message });
  }
};
// const updateOrderDetails = async (req, res) => {
//   try {
//     const { corporateOrderId } = req.params;
//     const { order_details } = req.body;

//     const updatedOrder = await corporate_model.updateOrderDetailsIds(
//       corporateOrderId,
//       order_details
//     );

//     res.json({
//       success: true,
//       order: updatedOrder
//     });
//   } catch (err) {
//     logger.error('Error updating order details', { error: err.message });
//     res.status(500).json({ error: err.message });
//   }
// };
// const getCartCount = async (req, res) => {
//   try {
//     const token = req.headers['token'];

//     let verified_data;
//     try {
//       verified_data = jwt.verify(token, process.env.SECRET_KEY);
//       logger.info('Token verified successfully for fetching cart count');
//     } catch (err) {
//       logger.error('Token verification failed', { error: err.message });
//       return res.status(401).json({ success: false, message: 'Invalid or expired token' });
//     }

//     const customer_id = verified_data.id;
//     const customer = await customer_model.getCustomerDetails(customer_id);

//     if (!customer) {
//       logger.warn('Customer not found', { customerId: customer_id });
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     const count = await corporate_model.getCartCountById(customer_id);

//     if (!count) {  
//       return res.status(200).json({ message: 'Count is Empty' });
//     }

//     res.status(200).json({ data: count });
//   } catch (error) {
//     logger.error('Error retrieving cart count', { error: error.message });
//     res.status(500).json({ message: 'Server error' });
//   }
// };
const updateOrderDetails = async (req, res) => {
  try {
    const { corporateOrderId } = req.params;
    
    const updatedOrder = await corporate_model.updateOrderDetailsIds(
      corporateOrderId
    );
    
    res.json({
      success: true,
      order: updatedOrder
    });
  } catch (err) {
    logger.error('Error updating order details', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

const getCartCount = async (req, res) => {
  try {
    const token = req.headers['token'];
    
    let verified_data;
    try {
      verified_data = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    
    const userId = verified_data.id;
    const CartData = await redis.hgetall(`cart:${userId}`);
    
    if (!CartData || Object.keys(CartData).length === 0) {
      return res.json({ success: true, totalCartCount: 0 });
    }
    let totalCartCount = 0;
    
    Object.entries(CartData).forEach(([key, value]) => {
      const parsedCart = parseNestedJSON(value);
      
      if (!parsedCart || typeof parsedCart !== 'object') {
        console.error('Invalid cart data format', key);
        return;
      }
      
      const orderDetails = parseNestedJSON(parsedCart.cart_order_details);
      
      if (Array.isArray(orderDetails)) {
        totalCartCount += orderDetails.reduce((sum, detail) => sum + detail.quantity, 0);
      }
    });
 console.log('total',totalCartCount)
    res.json({
      success: true,
      totalCartCount
    });
  } catch (error) {
    logger.error('Error retrieving cart count', { error: error.message });
    res.status(500).json({ message: 'Server error' });
  }
};
function parseNestedJSON(input) {
  if (typeof input !== 'string') return input;

  try {
    const parsed = JSON.parse(input);
    
    // If the parsed result is a string, try parsing again
    if (typeof parsed === 'string') {
      return parseNestedJSON(parsed);
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to parse JSON', input);
    return null;
  }
}
const pauseDays = async (req, res) => {
  try {
    const { corporateOrderId } = req.params;
    const { pausedDates, alternateDates } = req.body;

    console.log('Received request to replace days:', { corporateOrderId, pausedDates, alternateDates });

    if (!pausedDates || !Array.isArray(pausedDates) || pausedDates.length === 0) {
      console.log('Invalid paused dates provided');
      return res.status(400).json({ success: false, error: 'Please provide valid dates to reschedule' });
    }

    if (!alternateDates || !Array.isArray(alternateDates) || alternateDates.length !== pausedDates.length) {
      console.log('Mismatched alternate dates count');
      return res.status(400).json({ success: false, error: 'Please provide an equal number of alternate delivery dates' });
    }

    console.log('Rescheduling days for corporate order:', corporateOrderId);

    await client.query('BEGIN');

    // Verify that the order exists
    const orderExists = await client.query(
      `SELECT corporateorder_generated_id FROM corporate_orders WHERE corporateorder_generated_id = $1`,
      [corporateOrderId]
    );

    console.log('Corporate order query result:', orderExists.rows);

    if (orderExists.rowCount === 0) {
      console.log(`Corporate order with ID ${corporateOrderId} not found`);
      throw new Error(`Corporate order with ID ${corporateOrderId} not found`);
    }
    
    // Get all order details for this corporate order
    // Modified to convert processing_date to date string in SQL for consistent comparison
    const detailsQuery = await client.query(
      `SELECT order_detail_id, processing_date, TO_CHAR(processing_date, 'YYYY-MM-DD') as date_string
       FROM corporateorder_details WHERE corporateorder_generated_id = $1`,
      [corporateOrderId]
    );
    
    console.log('Existing order details:', detailsQuery.rows);

    // Use the date_string from SQL for comparison instead of JavaScript date manipulation
    const existingProcessingDates = detailsQuery.rows.map(detail => detail.date_string);
    
    // Simplify comparison by formatting pausedDates consistently
    const formattedPausedDates = pausedDates.map(date => {
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    
    console.log('Existing processing dates:', existingProcessingDates);
    console.log('Formatted paused dates:', formattedPausedDates);
    
    const invalidDates = formattedPausedDates.filter(date => !existingProcessingDates.includes(date));
    if (invalidDates.length > 0) {
      console.log('Invalid paused dates that do not match any processing_date:', invalidDates);
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        error: `The following dates are not valid processing dates for this order: ${invalidDates.join(', ')}` 
      });
    }

    // Get order_detail_ids for the dates we want to reschedule using the date_string field
    const orderDetailsToUpdate = detailsQuery.rows.filter(detail => 
      formattedPausedDates.includes(detail.date_string)
    );
    
    if (orderDetailsToUpdate.length !== pausedDates.length) {
      console.log('Not all dates found in order details');
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        error: 'Not all dates were found in the order details' 
      });
    }

    // Update processing dates for the matched order details
    for (let i = 0; i < orderDetailsToUpdate.length; i++) {
      const orderDetailId = orderDetailsToUpdate[i].order_detail_id;
      const newDate = alternateDates[i];
      
      console.log(`Updating order detail ${orderDetailId} with new date: ${newDate}`);
      
      await client.query(
        `UPDATE corporateorder_details SET processing_date = $1 WHERE order_detail_id = $2`,
        [newDate, orderDetailId]
      );
    }

    // Get updated order details to return in the response
    const updatedOrderQuery = await client.query(
      `SELECT * FROM corporate_orders WHERE corporateorder_generated_id = $1`,
      [corporateOrderId]
    );

    await client.query('COMMIT');
    console.log('Transaction committed successfully');

    res.json({
      success: true,
      message: 'Selected days have been rescheduled successfully',
      order: updatedOrderQuery.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error rescheduling days in order:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
const getOrderDetailstoPause = async (req, res) => {
  try {
    const { corporateOrderId } = req.params;
      const orderQuery = await client.query(
      `SELECT corporateorder_generated_id, order_details 
       FROM corporate_orders
       WHERE corporateorder_generated_id = $1`,
      [corporateOrderId]
    );

    if (orderQuery.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: `Corporate order with ID ${corporateOrderId} not found`
      });
    }

    // Get order details with processing dates
    const detailsQuery = await client.query(
      `SELECT order_detail_id, processing_date, category_id, quantity, delivery_status
       FROM corporateorder_details
       WHERE corporateorder_generated_id = $1
       ORDER BY processing_date ASC`,
      [corporateOrderId]
    );

    // Format processing dates to YYYY-MM-DD
    const orderDetails = detailsQuery.rows.map(row => ({
      ...row,
      processing_date: row.processing_date ? new Date(row.processing_date).toISOString().split('T')[0] : null
    }));

    res.json({
      success: true,
      orderDetails
    });
  } catch (err) {
    logger.error('Error fetching order details', {
      error: err.message,
      stack: err.stack,
      corporateOrderId: req.params.corporateOrderId
    });
    res.status(500).json({ success: false, error: err.message });
  }
};

const getProcessingDates = async (req, res) => {
  try {
    const { corporateOrderId } = req.params;

    const result = await client.query(
      `SELECT order_detail_id, processing_date, category_id, quantity, delivery_status
       FROM corporateorder_details 
       WHERE corporateorder_generated_id = $1
       ORDER BY processing_date ASC`,
      [corporateOrderId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: `No processing dates found for corporate order ID ${corporateOrderId}`
      });
    }

    const processingDates = result.rows.map(row => ({
      order_detail_id: row.order_detail_id,
      processing_date: row.processing_date,
      category_id: row.category_id,
      quantity: row.quantity,
      delivery_status: row.delivery_status
    }));

    res.json({
      success: true,
      processingDates
    });
  } catch (err) {
    logger.error('Error fetching processing dates', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
};

const getMediaByOrderDetailId = async (req, res) => {
  try {
    const { orderDetailId } = req.body;
    
    if (!orderDetailId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing orderDetailId' 
      });
    }
    
    // Query to get media from corporateorder_details
    const mediaResult = await client.query(
      `SELECT 
        od.media,
        od.category_id,
        cc.category_name,
        cc.category_media
       FROM 
        corporateorder_details od
       LEFT JOIN
        corporate_category cc ON od.category_id = cc.category_id
       WHERE 
        od.order_detail_id = $1`,
      [orderDetailId]
    );
    
    if (mediaResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: `No media found for order detail ID ${orderDetailId}`
      });
    }
    
    // Return both the order-specific media and the category media
    res.json({
      success: true,
      orderMedia: mediaResult.rows[0].media,
      categoryInfo: {
        categoryId: mediaResult.rows[0].category_id,
        categoryName: mediaResult.rows[0].category_name,
        categoryMedia: mediaResult.rows[0].category_media
      }
    });
  } catch (err) {
    logger.error('Error fetching media for order detail', { error: err.message, orderDetailId: req.params.orderDetailId });
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  addCorporateOrderDetails,
  getOrderDetails,
  getcategorynameById,
  transferCartToOrder,
  add_Corporate_Cart,
  getCorporateCart,
  GetCorporateCategory,
  getOrderDetailstoPause,
  updateCartItem,
  deleteCartItem,
  getCartCount,
  updateOrderDetails,
  pauseDays,
  getProcessingDates,
  getMediaByOrderDetailId
};
