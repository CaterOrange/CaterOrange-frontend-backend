const corporate_model = require('../models/corporateorderModels');
const logger = require('../config/logger.js');
const customer_model = require('../models/customerModels');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY;

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
      verified_data = jwt.verify(token, SECRET_KEY);
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
    const customer = await corporate_model.findCustomerByGid(customer_generated_id);

    if (!customer) {
      logger.error('Customer not found', { customerId: customer_generated_id });
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    logger.info('Adding cart for customer', { customerId: customer.customer_id });
    const newCart = await corporate_model.add_cart(customer.customer_id, cart_order_details, total_amount);

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
      verified_data = jwt.verify(token, SECRET_KEY);
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
    const customer = await corporate_model.findCustomerByGid(customer_generated_id);

    if (!customer) {
      logger.error('User not found', { customerId: customer_generated_id });
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    logger.info('Fetching cart for customer', { customerId: customer.customer_id });
    const carts = await corporate_model.getCarts(customer.customer_id);
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

// Add corporate order details
const addCorporateOrderDetails = async (req, res) => {
  const { corporateorder_id, processing_date, delivery_status, category_id, quantity, active_quantity, media, delivery_details } = req.body;
  
  try {
    logger.info('Adding corporate order details', { corporateorder_id, processing_date, delivery_status, category_id });
    
    const insertedDetail = await corporate_model.insertCorporateOrderDetails(corporateorder_id, processing_date, delivery_status, category_id, quantity, active_quantity, media, delivery_details);

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

// Get order details for user
const getOrderDetails = async (req, res) => {
  try {
    const token = req.headers['token'];

    let verified_data;
    try {
      verified_data = jwt.verify(token, SECRET_KEY);
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

// Transfer cart to corporate order
const transferCartToOrder = async (req, res) => {
  const { customer_generated_id, order_details, total_amount, paymentid, customer_address, payment_status } = req.body;

  try {
    logger.info('Transferring cart to order', { customer_generated_id, total_amount, paymentid });
    
    const order = await corporate_model.insertCartToOrder(customer_generated_id, order_details, total_amount, paymentid, customer_address, payment_status);

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
  const { categoryId } = req.body;

  try {
    const categoryname = await corporate_model.getcategoryname(categoryId);
    logger.info('Fetched category name', { categoryId });

    return res.json({
      success: true,
      categoryname
    });
  } catch (err) {
    logger.error('Error fetching category name', { error: err.message });
    res.status(500).json({ error: err.message });
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
  updateCartItem,
  deleteCartItem
};
