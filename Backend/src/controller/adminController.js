const logger = require('../config/logger');
const adminModel = require('../models/adminModels')
const jwt = require('jsonwebtoken');
    const SECRET_KEY = process.env.SECRET_KEY;

 const getCustomers = async(req, res)=>{
    try {
    
      const result = await adminModel.getAllCustomers();
      res.status(200).send(result.rows);
    } catch (err) {
      logger.error('Error:', err);
      res.status(500).send('Retrieve error');
    }
  };

  const getCustomerById = async(req, res)=> {
    const id = req.params.id;
    try {
      const result = await adminModel.getCustomerById(id);
      res.status(200).send(result.rows);
    } catch (err) {
      logger.error('Error:', err);
      res.status(500).send('Retrieve error');
    }
  };

  const deleteCustomer = async (req, res)=> {
    const id = req.params.id;
    try {
      await adminModel.deleteCorporateOrderById(id);
      await adminModel.deleteEventOrderById(id);

      
   const result=  await adminModel.deleteCustomerById(id);
      res.status(200).send("Deleted");
    } catch (err) {
      logger.error('Error:', err);
      res.status(500).send('Error deleting user by id');
    }
  };


    // const updateUser =async(req, res) => {
    //   const id = req.params.id;
    //   const {customer_name,customer_phonenumber,customer_email,customer_address} = req.body;

    //   const fields = [];
    //   const values = [];
  
    //   if (customer_name) fields.push('customer_name = $' + (fields.length + 1)), values.push(customer_name);
    //  if (customer_address) fields.push('customer_address = $' + (fields.length + 1)), values.push(customer_address);
    //   if (customer_email) fields.push('customer_email = $' + (fields.length + 1)), values.push(customer_email);
    //   if (customer_phonenumber) fields.push('customer_phonenumber = $' + (fields.length + 1)), values.push(customer_phonenumber);
   
    //   if (fields.length === 0) {
    //     return res.status(400).send('No fields to update');
    //   }
  
    //   try {
    //     const result = await adminModel.updateUser(id,fields,values);
    //     if (result.rowCount === 0) {
    //       return res.status(404).send('User not found');
    //     }
    //     res.status(200).send('User updated');
    //   } catch (err) {
    //     logger.error('Error:', err);
    //     res.status(500).send('Internal server error');
    //   }
    // }


// Replace with your actual secret key
    
    const updateUser = async (req, res) => {
        const id = req.params.id;
        const { customer_name, customer_phonenumber, customer_email, customer_address } = req.body;
    
        const fields = [];
        const values = [];
        let emailUpdated = false;
    
        if (customer_name) fields.push('customer_name = $' + (fields.length + 1)), values.push(customer_name);
        if (customer_address) fields.push('customer_address = $' + (fields.length + 1)), values.push(customer_address);
        if (customer_email) {
            fields.push('customer_email = $' + (fields.length + 1)), values.push(customer_email);
            emailUpdated = true; // Flag to indicate email was updated
        }
        if (customer_phonenumber) fields.push('customer_phonenumber = $' + (fields.length + 1)), values.push(customer_phonenumber);
    
        // Add update for access_token if email was updated
        if (emailUpdated) {
            const newToken = jwt.sign({ email: customer_email }, SECRET_KEY, { expiresIn: '24h' });
            fields.push('access_token = $' + (fields.length + 1));
            values.push(newToken);
        }
    
        if (fields.length === 0) {
            return res.status(400).send('No fields to update');
        }
    
        // Append the user ID to values array for the WHERE clause
        values.push(id);
    
        try {
            const result = await adminModel.updateUser(fields, values);
            if (result.rowCount === 0) {
                return res.status(404).send('User not found');
            }
    
            res.status(200).send({ message: 'User updated', token: emailUpdated ? values[values.length - 1] : null });
        } catch (err) {
            console.error('Error:', err);
            res.status(500).send('Internal server error');
        }
    };
    
    module.exports = {
        updateUser,
    };
    


    const getEventOrders = async(req, res)=>{

      try {

        const result = await adminModel.getAllEventOrders();
        res.status(200).send(result.rows);
      } catch (err) {
        logger.error('Error:', err);
        res.status(500).send('Retrieve error');
      }
    };


    const getCorporateOrders = async(req, res)=>{
      try {
      
        const result = await adminModel.getAllCorporateOrders();
        res.status(200).send(result.rows);
      } catch (err) {
        logger.error('Error:', err);
        res.status(500).send('Retrieve error');
      }
    };
    const getItemslist = async(req, res)=>{
      try {
      
        const result = await adminModel.getAllItems();
        res.status(200).send(result.rows);
      } catch (err) {
        logger.error('Error:', err);
        res.status(500).send('Retrieve error');
      }
    };

 
    const getPayment= async(req, res)=>{
      try {
      
        const result = await 
        
        adminModel.getAllpayments();
        res.status(200).send(result.rows);
      } catch (err) {
        logger.error('Error:', err);
        res.status(500).send('Retrieve error');
      }
    };

    const deleteCorporateOrder = async (req, res)=> {
      const id = req.params.id;
      try {
       const result = await adminModel.deleteCorporateOrderById(id);
        res.status(200).send("Deleted");
      } catch (err) {
        logger.error('Error:', err);
        res.status(500).send('Error deleting user by id');
      }
    }; 

    const deleteEventOrder = async (req, res)=> {
      const id = req.params.id;
      try {
       const result = await adminModel.deleteEventOrderById(id);
        res.status(200).send("Deleted");
      } catch (err) {
        logger.error('Error:', err);
        res.status(500).send('Error deleting user by id');
      }
    }; 

    const deleteEventorderByOrderId = async (req, res)=> {
      const id = req.params.id;
      try {
       const result = await adminModel.deleteEventOrderByOrderId(id);
        res.status(200).send("Deleted");
      } catch (err) {
        logger.error('Error:', err);
        res.status(500).send('Error deleting user by id');
      }
    }; 

    const deleteCorporateorderByOrderId = async (req, res)=> {
      const id = req.params.id;
      try {
       const result = await adminModel.deleteCorporateOrderByOrderId(id);
        res.status(200).send("Deleted");
      } catch (err) {
        logger.error('Error:', err);
        res.status(500).send('Error deleting user by id');
      }
    }; 


    // controllers/orderController.js

const updateOrderStatus = async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    const updatedOrder = await adminModel.updateStatus(id, status);

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const updateCorporateOrderStatus = async (req, res) => {
  const id = req.params.id;
  const{ status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    const updatedOrder = await adminModel.updateCorporateorderStatus(id, status);

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getcorporatecategory = async(req, res)=>{

  try {

    const result = await adminModel.getAllCategory();
    res.status(200).send(result.rows);
  } catch (err) {
    logger.error('Error:', err);
    res.status(500).send('Retrieve error');
  }
};


 const  toggleDeactivation=async (req, res) => {
    const id = req.params.id;
    const { isdeactivated } = req.body; // Get the new deactivation status from request body

    try {
      // You can optionally check if the customer exists before toggling
    

      // Toggle the deactivation status
      const updatedCustomer = await adminModel.toggleDeactivation(id, isdeactivated);
      return res.status(200).json(updatedCustomer); // Send the updated customer data
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  const getAnalyticsData = async (req, res) => {
    try {
      const totalCustomers = await adminModel.getTotalCustomers();
      const corporateOrders = await adminModel.getCorporateOrders();
      const eventOrders = await adminModel.getEventOrders();
  
      const totalOrders = parseInt(corporateOrders) + parseInt(eventOrders);
  
      res.json({
        total_customers: totalCustomers,
        corporate_orders: corporateOrders,
        event_orders: eventOrders,
        total_orders: totalOrders
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };


  


module.exports = {updateUser,getCustomers, deleteCustomer,getCustomerById,getCorporateOrders,getEventOrders,getItemslist,getPayment,deleteCorporateOrder,deleteEventOrder,deleteCorporateorderByOrderId,deleteEventorderByOrderId,updateOrderStatus,updateCorporateOrderStatus,getcorporatecategory,toggleDeactivation,getAnalyticsData};