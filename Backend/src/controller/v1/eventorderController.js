const logger = require('../../config/logger.js');
const cartModel = require('../../models/v1/eventorderModels.js')
const client = require("../../config/dbConfig.js")
const corporate_model = require('../../models/v1/corporateorderModels.js')
require('dotenv').config();
const jwt = require('jsonwebtoken');
//const redis = require('../app.js');
const Redis = require('ioredis');

const redis = new Redis({
  host: 'localhost',  
  port: 6379, 
 connectTimeout: 20000
});
const Ajv = require("ajv");

const addFormats = require("ajv-formats");

const ajv = new Ajv({ allErrors: true, strict: false });


const Mixpanel = require('mixpanel');
require('dotenv').config();

// Initialize Mixpanel with your project token
const mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);


addFormats(ajv);

const {eventCartSchema} = require("../../SchemaValidator/cartschema.js")
const {eventOrderSchema} = require("../../SchemaValidator/orderschema.js")

// Function to handle adding items to the cart
const addToCart = async (req, res) => {
  const { totalAmount, cartData, address, selectedDate, numberOfPlates, selectedTime } = req.body;
  console.log("Received addToCart request:", req.body);

  try {
    console.log("Validation result:");

    const validate = ajv.compile(eventCartSchema);
    const valid = validate(req.body);
    console.log("Validation result:", valid);

    if (!valid) {
      console.error("Validation errors:", validate.errors);
      return res.status(400).json({
        success: false,
        message: "Invalid request body",
        errors: validate.errors,
      });
    }

    const token = req.headers["token"];
    if (!token) {
      return res.status(401).json({ success: false, message: "Access token is missing or not provided" });
    }

    let verified_data;
    try {
      verified_data = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      console.error("Token verification failed:", err.message);
      return res.status(401).json({ success: false, message: "Token verification failed" });
    }

    const customer_generated_id = verified_data.id;
    const cartKey = `E${customer_generated_id}`;
    const cartDataToStore = { totalAmount, cartData, address, selectedDate, numberOfPlates, selectedTime };

    // Store cart data in Redis
    const result = await redis.set(cartKey, JSON.stringify(cartDataToStore));
    req.io.emit("EventcartUpdated", { cartKey ,cartDataToStore });

    if (!result) {
      throw new Error("Failed to store cart data in Redis");
    }

    console.log("Cart data stored successfully in Redis with key:", cartKey);
    res.status(200).json({ success: true, message: "Item added to cart successfully in Redis" });
  } catch (error) {
    console.error("Error in addToCart:", error.message);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


// Function to retrieve items from the cart
const getFromCart = async (req, res) => {
  try {
    const token = req.headers['token'];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token is missing or not provided' });
    }

    let verified_data;
    try {
      verified_data = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ success: false, message: 'Token has expired' });
      } else if (err instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      } else {
        return res.status(401).json({ success: false, message: 'Token verification failed' });
      }
    }

    const customer_generated_id = verified_data.id;
    const cartKey = `E${customer_generated_id}`;

    // Retrieve cart data from Redis
    const cartData = await redis.get(cartKey);

    if (cartData) {
      const cart = JSON.parse(cartData);
      return res.status(200).json({ cartitem: cart });
    } else {
      console.log('No items found in cart for customer ID:', customer_generated_id);
      return res.status(200).json({ count: 0 });
    }
  } catch (error) {
    console.error('Error fetching cart item count from Redis:', error);
    return res.status(500).json({ error: 'An error occurred while fetching the cart item count' });
  }
};



const fetchProducts = async (req, res) => {
  try {
    const categories = await cartModel.getAllProductCategories();
    res.send(categories);
  } catch (error) {
    logger.error('Error fetching product categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

const fetchCartItems = async (req, res) => {
  try {
    const { customer_id } = req.params;
    
    const cartItems = await cartModel.getCartItems(customer_id);
    res.json(cartItems);
  } catch (error) {
    logger.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getOrderDetails = async (req, res) => {
  try { 
    const token = req.headers['token'];
    console.log("Received token:", token);
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token is missing or not provided' });
    }
  
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

    const customer_generated_id = verified_data.id;
   
    const customer_id = customer_generated_id
    const order = await cartModel.getEventOrderDetailsById(customer_id); 
    logger.info(`Order details fetched:${order}`);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    logger.error('Error retrieving order details:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

const removeFromCart = async (req, res) => {
  const { productid, eventcart_id } = req.body;
  
  try {
    const result = await client.query(
      `UPDATE event_cart
       SET cart_order_details = (
         SELECT json_build_object(
           'items', json_agg(item)
         )
         FROM json_array_elements(cart_order_details->'items') AS item
         WHERE item->>'productid' != $1
       )
       WHERE eventcart_id = $2
       RETURNING *;`,
      [productid, eventcart_id]
    );

    if (result.rowCount === 0) {
      logger.warn('Cart or item not found for product ID:', productid);
      return res.status(404).json({ error: 'Cart or item not found' });
    }

    logger.info('Item removed successfully from cart:', result.rows[0]);
    res.json({
      message: 'Item removed successfully',
      cart: result.rows[0]
    });
  } catch (err) {
    logger.error('Error removing item from cart:', err);
    res.status(500).json({ error: 'An error occurred while removing the item' });
  }
};

const transferCartToOrder = async (req, res) => {
  
  console.log("hello")
  const {
    
    delivery_status,
    total_amount,
    PaymentId,
    delivery_details,
    event_order_details,
    event_media,
    customer_address,
    payment_status,
    event_order_status,
    number_of_plates,
    processing_date,
    processing_time,
  } = req.body;
  console.log('body',req.body)
  const token =req.headers['token']
  let verified_data;
    try {
      const validate = ajv.compile(eventOrderSchema);
      const valid = validate(req.body);
      console.log("valid msg",valid)
      if (!valid) {
        console.log("Validation Error for adding order:",validate.errors)
        return res.status(400).json({
          success: false,
          message: 'Invalid request body',
          errors: validate.errors
        });
      }
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

    const customer_generated_id = verified_data.id;
    console.log(verified_data.email) 
    console.log(customer_generated_id)

  try {
    const query = `
      INSERT INTO event_orders (
        customer_generated_id,
        delivery_status,
        total_amount,
        PaymentId,
        delivery_details,
        event_order_details,
        event_media,
        customer_address,
        payment_status,
        event_order_status,
        number_of_plates,
        processing_date,
        processing_time
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      ) RETURNING *;
    `;

    const values = [
      customer_generated_id,
      delivery_status,
      total_amount,
      PaymentId,
      delivery_details,
      event_order_details,
      event_media,
      customer_address,
      payment_status,
      event_order_status,
      number_of_plates,
      processing_date,
      processing_time,
    ];

    const result = await client.query(query, values);
    res.status(201).json(result.rows[0]); // Return the inserted row
  } catch (err) {
    console.error('Error inserting event order:', err);
    res.status(500).json({ error: 'Internal server error' });
  }

 
};

const orderbuyagain = async(req, res) => {
  const customer_id = 1;
  
  try {
    logger.info("Received orderbuyagain data:", req.body);
    const cartData = req.body;
    const orderData = {
      customer_id: customer_id,
      delivery_status: 'Pending', 
      total_amount: cartData.total_amount,
      delivery_details: cartData.delivery_details,
      cart_order_details: cartData.event_order_details,
      event_media: null, 
      customer_address: cartData.customer_address,
      payment_status: 'Unpaid', 
      event_order_status: 'New' 
    };
    
    logger.info("Order data to be inserted:", orderData);
    const order = await cartModel.insertEventOrder(orderData);
    logger.info("Order created successfully:", order); 
  } catch (error) {
    logger.error("Error in adding data to orders table:", error);
    res.status(500).json({ error: 'Error in adding data to orders table' });
  }
}

const getCartItemCount = async (req, res) => {
  try {
    const customerId = req.user.id; 
    const query = 'SELECT cart_order_details FROM Cart WHERE customer_id = $1';
    const result = await client.query(query, [customerId]);

    if (result.rows.length > 0) {
      const cart = result.rows[0];
      const itemCount = cart.cart_order_details.length; 
      return res.status(200).json({ count: itemCount });
    } else {
      logger.warn('No items found in cart for customer ID:', customerId);
      return res.status(200).json({ count: 0 }); 
    }
  } catch (error) {
    logger.error('Error fetching cart item count:', error);
    return res.status(500).json({ error: 'An error occurred while fetching the cart item count' });
  }
};

module.exports = {
  fetchProducts,
  addToCart,
  getOrderDetails,
  transferCartToOrder,
  orderbuyagain,
  getCartItemCount,
  fetchCartItems,
  removeFromCart,
  getFromCart,
  redis
};