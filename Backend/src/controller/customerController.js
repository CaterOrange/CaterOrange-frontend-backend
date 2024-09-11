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

module.exports = {
    register,
    login,
    forgotPassword,
    google_auth
};