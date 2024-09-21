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
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

const fetchCartItems = async (req, res) => {
  try {
    const { customer_id } = req.params;
    const cartItems = await cartModel.getCartItems(customer_id);
    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addToCart = async (req, res) => {
  const { totalAmount,cartData,address,selectedDate,numberOfPlates } = req.body;
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
      logger.error('User not found for ID:', customer_generated_id);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('Customer found:', customer);
    const customer_id = customer.customer_id;
    console.log('Adding cart for customer_id:', customer_id);
    const result = await cartModel.addCart( customer_id,totalAmount,cartData,address,numberOfPlates,selectedDate);
    res.status(200).json(result);
    console.log("result in controller",result);
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};


const getOrderDetails = async (req, res) => {
  
    try { 
      const token = req.headers['token'];
     console.log("token:",token)
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
        logger.error('User not found for ID:', customer_generated_id);
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      console.log('Customer found:', customer);
      const customer_id = customer.customer_id;
    const order = await cartModel.getEventOrderDetailsById(customer_id); 
    console.log("THe order is",order)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('Error retrieving order details:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
const removeFromCart = async (req, res) => {
  const { productid,  eventcart_id } = req.body;

  try {
    // Execute the update query to remove the item from cart_order_details
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
      [productid,eventcart_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Cart or item not found' });
    }

    res.json({
      message: 'Item removed successfully',
      cart: result.rows[0]
    });
  } catch (err) {
    console.error('Error removing item from cart:', err);
    res.status(500).json({ error: 'An error occurred while removing the item' });
  }
};


const transferCartToOrder = async (req, res) => {
 
  const { eventcart_id} = req.body;
  
  console.log("Event cart id :",eventcart_id)
// const token=req.headers['token']
  
  try {
    const cart = await cartModel.getCartById(eventcart_id);
    console.log("cart data",cart);
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
   console.log("Customersssss",customer)
    if (!customer) {
      logger.error('User not found for ID:', customer_generated_id);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('Customer found:', customer);
    const customer_id = customer.customer_id;
      const cartData = cart[0];
      console.lof
      const orderData = {
        customer_id: customer_id,
        delivery_status: 'Pending', 
        amount: cartData.total_amount,
        delivery_details: cartData.delivery_details,
        cart_order_details: cartData.cart_order_details,
        event_media: null, 
        customer_address: cartData.address,
        payment_status: 'Unpaid', 
        event_order_status: 'New',
        number_of_plates:cartData.number_of_plates,
        processing_date:cartData.processing_date 
      };
    console.log("ordered data",orderData);
    const order = await cartModel.insertEventOrder(orderData);
    console.log("order",order);
    await cartModel.deleteCart(eventcart_id);
    res.status(201).json(order);
  } catch (error) {
    logger.error('Error transferring cart to order: ', error);
    res.status(500).json({ error: 'Error transferring cart to order', details: error.message });
  }
};


const orderbuyagain = async(req,res)=>{
  const customer_id = 1
  try{
    console.log("orderbuyagain:",req.body);
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
    console.log("ordered data",orderData);
    const order = await cartModel.insertEventOrder(orderData);
    console.log("order",order); 
  }catch(error){
    console.log("error in adding data to my orders table");
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
      return res.status(200).json({ count: 0 }); 
    }
  } catch (error) {
    console.error('Error fetching cart item count:', error);
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
  fetchCartItems,removeFromCart 
};