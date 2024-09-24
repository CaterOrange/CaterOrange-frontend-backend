const corporate_model = require('../models/corporateorderModels');
const logger = require('../config/logger.js');
const customer_model = require('../models/customerModels');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY;

const GetCorporateCategory = async (req, res) => {
  try {
      const categories = await corporate_model.getCorporateCategories();
      return res.json({
          success: true,
          categories
      });
  } catch (err) {
      res.status(500).json({ error: err.message });
    }
}
const add_Corporate_Cart = async (req, res) => {
  try {
  
    const { cart_order_details, total_amount } = req.body;

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
    const newCart = await corporate_model.add_cart(customer_id, cart_order_details, total_amount);

    if (!newCart) {
      throw new Error('Cart creation failed');
    }

    logger.info('Cart added successfully');
    res.json({
      success: true,
      message: 'Cart created successfully',
      cart: newCart
    });
  } catch (err) {
    console.error('Detailed error:', err);  // Log the full error object
    logger.error('Error during cart creation', { error: err.message, stack: err.stack });
    res.status(500).json({ success: false, message: 'Error during cart creation', error: err.message });
  }
};

const getCorporateCart = async (req,res)=>{
  try{
    const token = req.headers['token'];
    console.log('token in add', token);
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
      const carts= await corporate_model.getCarts( customer_id )
     
      return res.json(
          carts
      );
  } catch (err) {
      res.status(500).json({ error: err.message });
    }
 
}


const updateCartItem= async(req,res) =>{
  try {
      const corporatecart_id=req.params.corporatecart_id;
      const {date,quantity}=req.body; 

      const result = await corporate_model.updateQuantity(corporatecart_id,date,quantity);
      return res.json({
          success: true
      });
  } catch (err) {
      res.status(500).json({ error: err.message });
    }
}
const deleteCartItem = async (req, res) => {
  try {
    
    const corporatecart_id = req.params.corporatecart_id;
    const { date } = req.body;  // Destructure date from req.body

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }
   const result = await corporate_model.deleteCart(corporatecart_id, date);
    console.log('Success in controller for delete data');
    return res.json({
      success: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addCorporateOrderDetails = async (req, res) => {
  const { corporateorder_id,  processing_date,delivery_status,category_id,quantity,active_quantity,media, delivery_details} = req.body;

  try {
   
   logger.info('hi ',{corporateorder_id,  processing_date,delivery_status,category_id,quantity,active_quantity,media, delivery_details})
console.log("in controller")
      // Insert into the database using the model
      const insertedDetail = await corporate_model.insertCorporateOrderDetails(corporateorder_id, processing_date,delivery_status,category_id,quantity,active_quantity,media, delivery_details );

  res.status(201).json({
    success: true,
    message: 'Order details added successfully',
    data: insertedDetail
  });}
   catch (error) {
    console.error('Error adding order details:', error);
    res.status(500).json({ message: 'Server error', error });
  }
}

const getOrderDetails = async (req, res) => {
  // Extract order ID from request params

  try {
      const token = req.headers['token'];
      console.log('hi myorder', token)
      // Verify the token and extract the user email
      let verified_data;
      try {
          verified_data = jwt.verify(token, SECRET_KEY);
      } catch (err) {
          logger.error('Token verification failed:', err.message);
          return res.status(401).json({ success: false, message: 'Invalid or expired token' });
      }

      const customer_id = verified_data.id;
      const customer=await customer_model.getCustomerDetails(customer_id);
     
      if (!customer) {
          return res.status(404).json({ success: false, message: 'User not found' });
      }
 
 console.log('console',customer_id)
     
    const order = await corporate_model.getOrderDetailsById(customer_id);
    console.log(order)
    logger.info("orders in controller:", order)

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Send back only corporateorder_generated_id and order_details
    res.status(200).json({
     
      data:order
    });
  } catch (error) {
    console.error('Error retrieving order details:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

const transferCartToOrder = async (req, res) => {
  const { customer_generated_id , order_details , total_amount ,paymentid, customer_address , payment_status  } = req.body;
  try {
    // Insert the cart data into event_orders
    const order = await corporate_model.insertCartToOrder( customer_generated_id , order_details , total_amount  , paymentid,customer_address , payment_status );
  
    return res.json({
      success: true,
      order
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getcategorynameById= async(req, res)=>{
  const { categoryId }= req.body;

  try{
     const categoryname= await corporate_model.getcategoryname(categoryId);
     return res.json({
         success: true,
         categoryname
       });
     } catch (err) {
       res.status(500).json({ error: err.message });
     }
}

module.exports = {
  addCorporateOrderDetails,
  getOrderDetails,
  getcategorynameById,
  transferCartToOrder,
  getOrderDetails,
  addCorporateOrderDetails,
  deleteCartItem,
  updateCartItem,
  // getCustomerDetails,
  add_Corporate_Cart,
  getCorporateCart,
  GetCorporateCategory
};

