const logger = require('../config/logger');
const customerController = require('../controller/customerController.js');
const cartModel = require('../models/eventorderModels.js')
const { menuPageMethod } = require("../models/eventorderModels");
const transferCartToOrder = async (req, res) => {
  const { eventcart_id } = req.body;

  try {
    // Get the cart data
    const cart = await cartModel.getCartById(eventcart_id);

    if (!cart || !cart.cart_order_details || cart.cart_order_details.length === 0) {
        return res.status(400).json({ error: 'Cart is empty or not found' });
      }
    
    // Prepare order data
    const orderData = {
      customer_id: cart.customer_id,
      ordered_at: cart.order_date, // Using order_date as ordered_at
      delivery_status: 'Pending', // Default status; adjust as needed
      total_amount: cart.total_amount,
      delivery_details: cart.cart_order_details,
      event_order_details: cart.cart_order_details, // Assuming cart_order_details as event_order_details
      event_media: null, // event_media; set as needed
      customer_address: cart.address,
      payment_status: 'Unpaid', // Default payment status; adjust as needed
      event_order_status: 'New' // Default order status; adjust as needed
    };

    // Insert the cart data into event_orders
    const order = await eventModel.insertEventOrder(orderData);

    // Optionally, delete the cart after transfer
    await eventModel.deleteCartById(eventcart_id);

    res.status(201).json(order);
  } catch (error) {
    logger.error('Error transferring cart to order: ', error);
    res.status(500).json({ error: 'Error transferring cart to order', details: error.message });
  }
};

const addToCart = async (req, res) => {
  const {  total_amount, cart_order_details, address } = req.body;
  try {
    // Validate required fields
    const token = req.headers["access_token"]
    const response = await customerController.getuserbytoken({ body: { access_token: token } })
    const customer_id = response.customer_id
    if (!customer_id || !total_amount || !cart_order_details || !address) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Insert into database
    const cartItem = await cartModel.addToCart(customer_id, total_amount, cart_order_details, address);
    res.status(201).json({ message: 'Product added to cart', data: cartItem });
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};


const getCartByCustomerId = async (req, res) => {
  const {id} = req.params;
  try {
    const cart = await cartModel.getcartbyCustomerId(id);
   
    if (cart.length >0) {
      res.status(200).json({ data: cart });
    } else {
      res.status(404).json({ message: 'Cart not found for this customer' });
    }
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};



const getCart = async (req, res) => {
  
  try {
    const token = req.headers["access_token"]
    console.log(token)
    const response = await customerController.getuserbytoken({ body: { access_token: token } })
   
    const id = response.customer_id
    const cart = await cartModel.getcartbyCustomerId(id);
   
    if (cart.length >0) {
      res.status(200).json({ data: cart });
    } else {
      res.status(404).json({ message: 'Cart not found for this customer' });
    }
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Controller to update a cart
const updateCart = async (req, res) => {
  const { id} = req.params;
  const { total_amount, cart_order_details, address } = req.body;

  const fields = [];
  const values = [];

  // Build dynamic fields and values for the SQL query
  if (total_amount !== undefined) fields.push('total_amount = $' + (fields.length + 1)), values.push(total_amount);
  if (cart_order_details !== undefined) fields.push('cart_order_details = $' + (fields.length + 1)), values.push(cart_order_details);
  if (address !== undefined) fields.push('address = $' + (fields.length + 1)), values.push(address);

  if (fields.length === 0) {
    return res.status(400).send('No fields to update');
  }

  // Build the SQL query string
  const query = `
    UPDATE event_cart
    SET ${fields.join(', ')}
    WHERE eventcart_id = $${fields.length + 1}
    RETURNING *;
  `;

  // Add the eventcart_id to the values array
  values.push(id);

  try {
    // Execute the update query
    const result = await cartModel.updateCart(query, values);

    if (result.rowCount === 0) {
      return res.status(404).send('Cart not found');
    }

    res.status(200).json({ message: 'Cart updated successfully', data: result.rows[0] });
  } catch (err) {
    logger.error('Error updating cart:', err);
    res.status(500).send('Internal server error');
  }
};

// Controller to delete a cart by its ID
const deleteCart = async (req, res) => {
  const { id } = req.params;
  try {
    await cartModel.deleteCart(id);
    res.status(200).json({ message: 'Cart item deleted successfully' });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

async function fetchEventCategories(req, res) {
  try {
    const categories = await cartModel.getAllEventCategories();

    if (categories.length === 0) {
      return res.status(404).json({ message: 'No categories found' });
    }

    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}



const menuPage = async (req, res) => {
    try {
      
      const categoryName = req.query.Category_name; 
      const start = parseInt(req.query.start, 10) || 0;
      const limit = parseInt(req.query.limit, 10) || 10;
  
      if (!categoryName) {
        return res.status(400).json({ error: 'Category_name is required' });
      }
      
      if (isNaN(start) || start < 0) {
        return res.status(400).json({ error: 'Start parameter must be a non-negative number' });
      }
  
      if (isNaN(limit) || limit <= 0) {
        return res.status(400).json({ error: 'Limit parameter must be a positive number' });
      }
  
      // Call your model method to fetch data
      const result = await menuPageMethod(categoryName, start, limit);
  
      // Send response
      res.status(200).json({
        data: result,
        hasMore: result.length === limit, 
      });
  
      logger.info(`Fetched products for category_name: ${categoryName} successfully`);
    } catch (err) {
      logger.error(`Error in fetching products for category_name: ${req.query.Category_name}`);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

module.exports = {
  transferCartToOrder,
  addToCart,
  getCartByCustomerId,
  updateCart,
  deleteCart,
  getCart,
  fetchEventCategories,
  menuPage
};
