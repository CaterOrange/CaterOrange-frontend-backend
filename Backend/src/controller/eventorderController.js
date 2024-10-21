const logger = require('../config/logger');
const cartModel = require('../models/eventorderModels.js')
const client = require("../config/dbConfig.js")
const corporate_model = require('../models/corporateorderModels.js')
require('dotenv').config();
const jwt = require('jsonwebtoken');

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

const addToCart = async (req, res) => {
  const { totalAmount, cartData, address, selectedDate, numberOfPlates, selectedTime } = req.body;
  try { 
    const token = req.headers['token'];
  
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
    const customer = await corporate_model.findCustomerByGid(customer_generated_id);

    if (!customer) {
      logger.warn('User not found for ID:', customer_generated_id);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const customer_id = customer.customer_id;
    const result = await cartModel.addCart(customer_id, totalAmount, cartData, address, numberOfPlates, selectedDate, selectedTime);
    logger.info("Item added to cart successfully:", result);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Error adding product to cart:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const getOrderDetails = async (req, res) => {
  try { 
    const token = req.headers['token'];
    logger.info("Received token:", token);
    
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
    const customer = await corporate_model.findCustomerByGid(customer_generated_id);

    if (!customer) {
      logger.warn('User not found for ID:', customer_generated_id);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    logger.info('Customer found:', customer);
    const customer_id = customer.customer_id;
    const order = await cartModel.getEventOrderDetailsById(customer_id); 
    logger.info("Order details fetched:", order);

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
  const { eventcart_id } = req.body;
  
  logger.info("Event cart ID received:", eventcart_id);

  try {
    const cart = await cartModel.getCartById(eventcart_id);
    logger.info("Cart data fetched:", cart);

    if (!cart) {
      return res.status(400).json({ error: 'Cart is empty or not found' });
    }

    const token = req.headers['token'];

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
    const customer = await corporate_model.findCustomerByGid(customer_generated_id);
    
    if (!customer) {
      logger.warn('User not found for ID:', customer_generated_id);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    logger.info('Customer found:', customer);
    const customer_id = customer.customer_id;
    const cartData = cart[0];

    const orderData = {
      customer_id: customer_id,
      delivery_status: cartData.delivery_status, 
      amount: cartData.total_amount,
      delivery_details: cartData.delivery_details,
      cart_order_details: cartData.cart_order_details,
      event_media: null, 
      customer_address: cartData.address,
      payment_status: 'Unpaid', 
      event_order_status: 'New',
      number_of_plates: cartData.number_of_plates,
      processing_date: cartData.processing_date 
    };
    
    logger.info("Order data to be inserted:", orderData);
    const order = await cartModel.insertEventOrder(orderData);
    logger.info("Order created successfully:", order);
    
    await cartModel.deleteCart(eventcart_id);
    res.status(201).json(order);
  } catch (error) {
    logger.error('Error transferring cart to order:', error);
    res.status(500).json({ error: 'Error transferring cart to order', details: error.message });
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
  removeFromCart 
};
