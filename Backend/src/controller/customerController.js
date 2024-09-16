require('dotenv').config();
const logger = require('../config/logger');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const customer_model = require('../models/customerModels'); // Fixed import
const { body, validationResult } = require('express-validator');

const SECRET_KEY = process.env.SECRET_KEY;

// Register function
const register = async (req, res) => {
    try {
        const { customer_name, customer_email , customer_password,  customer_phonenumber,confirm_password } = req.body;
        const minNameLength = 3;
        const maxNameLength = 50;
        const minPasswordLength = 8;
        const maxPasswordLength = 20;
        const maxEmailLength = 50;

        // Validate all required fields
        if (!customer_name || !customer_email  || !customer_password || !confirm_password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Validate name format and length
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!nameRegex.test(customer_name) || customer_name.length < minNameLength || customer_name.length > maxNameLength) {
            return res.status(400).json({ success: false, message: `Name must be between ${minNameLength}-${maxNameLength} characters and contain only alphabets `});
        }

        // Validate email format and length
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(customer_email ) || customer_email .length > maxEmailLength) {
            return res.status(400).json({ success: false, message: 'Invalid email format or too long' });
        }

        // Check if email is already in use
        const existingUserByEmail = await customer_model.findCustomerEmail(customer_email );
        if (existingUserByEmail) {
            logger.error('Email already in use', { customer_email  });
            return res.status(400).json({ success: false, message: 'Email already in use' });
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{8,20}$/;

        // Validate password length and complexity
        if (customer_password.length < minPasswordLength || customer_password.length > maxPasswordLength || !passwordRegex.test(customer_password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be between 8-20 characters with one upper case,lower case and no special characters.'
            });
        }

        // Check if passwords match
        if (customer_password !== confirm_password) {
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
        }

        // Hash password before storing
        const hashedPassword = await bcrypt.hash(customer_password, 10);

        // Generate JWT token
        const token = jwt.sign({ email: customer_email  }, SECRET_KEY, { expiresIn: '24h' });

     
        const newCustomer = await customer_model.createCustomer(
            customer_name,
            customer_email ,
            hashedPassword,
            customer_phonenumber,
            token
        );

        logger.info('Customer registered successfully', { customer_email  });

        return res.json({
            success: true,
            message: 'Customer registered successfully',
            token,
            customer: newCustomer
        });
    } catch (err) {
        logger.error('Error during customer registration', { error: err.message });
        return res.status(500).json({ error: err.message });
    }
};

const login = [
    // Validate and sanitize input fields
    

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { customer_email, customer_password } = req.body;

            // Fetch user data from the database
            const customer = await customer_model.findCustomerEmail(customer_email);

            if (!customer) {
                logger.warn('Invalid login attempt', { customer_email });
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email ,user not exists'
                });
              
            }
            body('customer_email')
            .isEmail().withMessage('Please provide a valid email address.')
            .normalizeEmail(),
            body('customer_password')
            .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
            .trim()

            // Compare the password
            const isPasswordValid = await bcrypt.compare(customer_password, customer.customer_password);

            if (!isPasswordValid) {
                logger.warn('Invalid login attempt', { customer_email });
                return res.status(400).json({
                    success: false,
                    message: 'Invalid password '
                });
            }

            // Verify the existing token or generate a new one
            let token;
            try {
                token = jwt.verify(customer.access_token, SECRET_KEY);
                var uat = customer.access_token;
                logger.info('Token verified successfully', { token });
            } catch (err) {
                uat = jwt.sign({ email: customer_email }, SECRET_KEY, { expiresIn: '24h' });
                await customer_model.updateAccessToken(customer_email, uat);
                logger.info('New token generated', { token: uat });
            }
            
            res.json({
                success: true,
                message: 'Login successful',
                token: uat
            });
        } catch (err) {
            logger.error('Error during user login', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    }
];

const forgotPassword = [
   
   

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        

        try {
            const { customer_email, customer_password,confirm_password } = req.body;
            const existingUserByEmail = await customer_model.findCustomerEmail(customer_email);
            if (customer_password !== confirm_password) {
                return res.status(400).json({ success: false, message: 'Passwords do not match' });
            }
        
            if (!existingUserByEmail) {
                logger.error('You are not registered yet, please register', { customer_email });
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email ,user not exists'
                });
            }
            body('customer_email')
            .isEmail().withMessage('Please provide a valid email address.')
            .normalizeEmail(),
            body('customer_password')
            .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
            .trim()
            
            // Hash the new password
            const hashedPassword = await bcrypt.hash(customer_password, 12);
            let token;
            try {
                token = jwt.verify(customer.access_token, SECRET_KEY);
                var uat = customer.access_token;
                logger.info('Token verified successfully', { token });
            } catch (err) {
                uat = jwt.sign({ email: customer_email }, SECRET_KEY, { expiresIn: '24h' });
                logger.info('New token generated', { token: uat });
            }

            
            const customer = await customer_model.updateCustomerPassword(customer_email, hashedPassword,uat);

            if (!customer) {
                logger.warn('Error updating password', { customer_email });
                return res.status(400).json({ message: 'Error updating password' });
            }

            res.json({
                success: true,
                message: 'Login successfully with new Password',
                token: uat

            });
        } catch (err) {
            logger.error('Error during password update', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    }
];

const google_auth=async (req, res)=>{
    try{
        const { customer_name,customer_email, access_token } = req.body;

        const existingUserByEmail = await customer_model.findCustomerEmail(customer_email);

        if(existingUserByEmail){
            try{
            const customer = await customer_model.updateAccessToken(customer_email, access_token);
            if (!customer) {
                logger.warn('Error updating token', { customer_email });
                return res.status(400).json({ message: 'Error updating token' });
            }

            res.json({
                success: true,
                message: 'Login successfully with google',
                token: access_token

            });
        }catch (err) {
            logger.error('Error during google login', { error: err.message });
            res.status(500).json({ error: err.message });
        }
        }
        else{
            try{
               const customer_phonenumber=0;
               const customer_password="";
               console.log('access in google reg',access_token)

                const newCustomer = await customer_model.createCustomer(
                    customer_name,
                    customer_email ,
                    customer_password,
                    customer_phonenumber,
                    access_token
                );
                logger.info('Customer registered through google successfully', { customer_email  });

            return res.json({
            success: true,
            message: 'Customer registered through google successfully',
            customer: newCustomer
        });
            }
            catch (err) {
                logger.error('Error during customer registration with google', { error: err.message });
                return res.status(500).json({ error: err.message });
            }
        }
    }
    catch (err) {
        logger.error('Error during google oauth', { error: err.message });
        res.status(500).json({ error: err.message });
    }  
        
}
const createEventOrderController= async(req, res) => {
    const { customer_id, order_date, status, total_amount, vendor_id, delivery_id, eventcart_id } = req.body;
  
    try {
        const order = await customer_model.createEventOrder(customer_id, { order_date, status, total_amount, vendor_id, delivery_id, eventcart_id });
        res.status(201).json({ message: 'Event order created successfully', order });
    } catch (error) {
        console.error('Error creating event order:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getEventOrderByIdController = async(req, res) => {
    const {id } = req.params;
  
    try {
        const order = await customer_model.getEventOrderById(id);
  
        if (!order) {
            return res.status(404).json({ message: 'Event order not found' });
        }
  
        res.status(200).json({ order });
    } catch (error) {
        console.error('Error retrieving event order:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getAllEventOrdersByCustomerIdController = async(req, res)=> {
    const { customer_id } = req.body; 
  
    try {
        const orders = await customer_model.getAllEventOrdersByCustomerId(customer_id);
        res.status(200).json({ orders });
    } catch (error) {
        console.error('Error retrieving event orders:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}
const getAddressByCustomerId = async (req, res) => {
    const { customer_id } = req.params;
  
    try {
      // Fetch addresses associated with the customer
      const addresses = await customer_model.getAddressesByCustomerId( customer_id);
  
      if (!addresses.length) {
        return res.status(404).json({ error: 'No addresses found for this customer' });
      }
  
      res.status(200).json(addresses);
    } catch (error) {
      logger.error('Error fetching address details: ', error);
      res.status(500).json({ error: 'Error fetching address details', details: error.message });
    }
  };

  const getuserbytoken = async (req, res) => {
    const {access_token} = req.body;
    try {
        const result = await customer_model.userbytoken(access_token);
        console.log(result.rows[0])
        return result.rows[0]
        
    }
    catch (err) {
        res.status(500).json({ error: 'An error occurred while retrieving complaints', err });
    }
};

const deleteAddressById = async (req, res) => {
    const { address_id } = req.params;
  
    try {
      const deletedAddress = await customer_model.deleteAddressById(address_id);
  
      if (!deletedAddress) {
        return res.status(404).json({ error: 'Address not found' });
      }
  
      res.status(200).json({ message: 'Address deleted successfully', deletedAddress });
    } catch (error) {
      logger.error('Error deleting address: ', error);
      res.status(500).json({ error: 'Error deleting address', details: error.message });
    }
  };
  
  const updateAddressById = async (req, res) => {
    const address_id = req.params.address_id;
    const {
      tag,
      line1,
      line2,
      pincode,
      latitude,
      longitude,
      ship_to_name,
      ship_to_phone_no
    } = req.body;
  
    const fields = [];
    const values = [];
  
    if (tag) fields.push('tag = $' + (fields.length + 1)), values.push(tag);
    if (line1) fields.push('line1 = $' + (fields.length + 1)), values.push(line1);
    if (line2) fields.push('line2 = $' + (fields.length + 1)), values.push(line2);
    if (pincode) fields.push('pincode = $' + (fields.length + 1)), values.push(pincode);
    if (latitude && longitude) fields.push('location = POINT($' + (fields.length + 1) + ', $' + (fields.length + 2) + ')'), values.push(latitude, longitude);
    if (ship_to_name) fields.push('ship_to_name = $' + (fields.length + 1)), values.push(ship_to_name);
    if (ship_to_phone_no) fields.push('ship_to_phone_no = $' + (fields.length + 1)), values.push(ship_to_phone_no);
  
    if (fields.length === 0) {
      return res.status(400).send('No fields to update');
    }
  
    try {
      const result = await customer_model.updateAddressById(address_id, fields, values);
      if (result.rowCount === 0) {
        return res.status(404).send('Address not found');
      }
      res.status(200).send('Address updated');
    } catch (err) {
      logger.error('Error:', err);
      res.status(500).send('Internal server error');
    }
  };
  


module.exports = {
    register,
    login,
    forgotPassword,
    google_auth,
    createEventOrderController,
    getAllEventOrdersByCustomerIdController,
    getEventOrderByIdController,
    getAddressByCustomerId,
    getuserbytoken,
    deleteAddressById,
    updateAddressById
};




