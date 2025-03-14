require('dotenv').config();
const logger = require('../../config/logger.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const customer_model = require('../../models/v1/customerModels.js'); // Fixed import
const { body, validationResult } = require('express-validator');
const {transporter}=require('../../middlewares/mailAuth.js')
const nodemailer = require('nodemailer');
const client = require('../../config/dbConfig.js');
const gidStorage = require('../../middlewares/loggingMiddleware.js');

const Ajv = require("ajv");

const addFormats = require("ajv-formats");

const ajv = new Ajv({ allErrors: true, strict: false, $data: true });
addFormats(ajv);
const { customerSchema ,loginSchema} = require('../../SchemaValidator/signinschema.js'); 
const validate = ajv.compile(customerSchema);

const validatelogin = ajv.compile(loginSchema);

const Mixpanel = require('mixpanel');

// Initialize Mixpanel
const mixpanel = Mixpanel.init('cb19042cf789f9c44e059bd4be6f2c5d');

const trackEvent = (event, properties = {}) => {
    try {
        mixpanel.track(event, {
            ...properties,
            timestamp: new Date().toISOString(), // Ensures ISO format
            environment: process.env.NODE_ENV || 'development' // Fallback value
        });
    } catch (error) {
        console.error('Mixpanel tracking error:', error);
    }
};
let otpStore = {}; // This should be in memory or persistent storage in production
const send_otp = async (req, res) => {
    const { email } = req.body;

    trackEvent('OTP Request', {
        email: email
    });

    // Check if email is provided
    if (!email) {

        trackEvent('OTP Request Failed', {
            reason: 'email_missing'
        });

        logger.warn('Email is required but not provided');
        return res.status(400).send({ error: 'Email is required' });
    }
    const existingUserByEmail = await customer_model.findCustomerEmail(email);
    // logger.info('Checking if user exists for email:', email);

    if (!existingUserByEmail) {
        logger.warn('Invalid email, user does not exist:', email);
        return res.status(400).json({
            success: false,
            message: 'Invalid email, user does not exist'
        });
    }
    logger.info('Sending OTP to:', email);
    const generatedOtp = Math.floor(100000 + Math.random() * 900000);
    const expiresIn = Date.now() + 60000; 
    otpStore[email] = { otp: generatedOtp, expiresAt: expiresIn };

     const mailOtp = {
        from: {
            name: 'CaterOrange',
            address: 'orders@x.caterorange.com'
        },
        replyTo: 'abhishek@caterorange.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP is ${generatedOtp}. It will expire in one minute.`
    };

    transporter.sendMail(mailOtp, (error, info) => {
        if (error) {
            logger.error('Failed to send OTP to:', email, error);
            return res.status(500).send({ error: 'Failed to send OTP' });
        }

        trackEvent('OTP Sent Successfully', {
            email: email
        });


        logger.info('OTP sent successfully to:', email);
        res.status(200).send({ message: 'OTP sent successfully', otp: generatedOtp }); // Optionally, hide OTP in prod
    });
};


const verify_otp = async (req, res) => {
    const { email, otp } = req.body;

    trackEvent('OTP Verification Attempted', {
        email: email
    });


    if (!email || !otp) {

        trackEvent('OTP Verification Failed', {
            email: email,
            reason: 'missing_fields'
        });

        logger.warn('Email and OTP are required but not provided');
        return res.status(400).send({ error: 'Email and OTP are required' });
    }

    const otpData = otpStore[email];

    if (!otpData || otpData.expiresAt < Date.now()) {
        logger.warn('OTP expired or not found for:', email);
        return res.status(400).send({ error: 'OTP expired or not found' });
    }

    // Validate OTP
    if (parseInt(otp) === otpData.otp) {

        trackEvent('OTP Verification Successful', {
            email: email
        });

        logger.info('OTP verified successfully for:', email);
        res.status(200).send({ message: 'OTP verified successfully' });

        // Remove the OTP after successful verification
        delete otpStore[email];
    } else {

        trackEvent('OTP Verification Failed', {
            email: email,
            reason: 'invalid_otp'
        });

        logger.error('Invalid OTP provided by:', email);
        res.status(400).send({ error: 'Invalid OTP' });
    }
};


const register = async (req, res) => {
    try {
        const { customer_name, customer_email, customer_password, customer_phonenumber, confirm_password } = req.body;

        trackEvent('Registration Attempted', {
            email: customer_email,
            phone_number_provided: !!customer_phonenumber
        });

    
        const minNameLength = 3;
        const maxNameLength = 50;
        const minPasswordLength = 8;
        const maxPasswordLength = 20;
        const maxEmailLength = 50;
        const phoneNumberLength = 10;
        const phoneRegex = /^[0-9]{10}$/;
        
        if (!phoneRegex.test(customer_phonenumber) || customer_phonenumber.length > phoneNumberLength) {
            return res.status(400).json({ success: false, message: 'Invalid phone number' });
        }
        
        // Validate all required fields
        if (!customer_name || !customer_email || !customer_password || !confirm_password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        
        // Validate name format and length
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!nameRegex.test(customer_name) || customer_name.length < minNameLength || customer_name.length > maxNameLength) {
            return res.status(400).json({ success: false, message: `Name must be between ${minNameLength}-${maxNameLength} characters and contain only alphabets. ` });
        }
        
        // Validate email format and length
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(customer_email) || customer_email.length > maxEmailLength) {
            return res.status(400).json({ success: false, message: 'Invalid email format or too long' });
        }
        
        // Check if email is already in use
        const existingUserByEmail = await customer_model.findCustomerEmail(customer_email);
        if (existingUserByEmail) {
            logger.error('Email already in use', { customer_email });
            return res.status(400).json({ success: false, message: 'Email already in use' });
        }
        
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()-_+=]*$/;
        // Validate password length and complexity
        if (customer_password.length < minPasswordLength || customer_password.length > maxPasswordLength || !passwordRegex.test(customer_password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be between 8-20 characters with at least one uppercase letter, one lowercase letter, and one digit.'
            });
        }

        // Check if passwords match
        if (customer_password !== confirm_password) {
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
        }

        const hashedPassword = await bcrypt.hash(customer_password, 10);
        const newCustomer = await customer_model.createCustomer(
            customer_name,
            customer_email,
            hashedPassword,
            customer_phonenumber
        );

        if (newCustomer) {
            // Send Welcome Email
            trackEvent('Registration Completed', {
                distinct_id: newCustomer.customer_generated_id,
                email: customer_email,
                name: customer_name,
                phone_number_provided: !!customer_phonenumber
            });

            // Create Mixpanel user profile
            mixpanel.people.set(newCustomer.customer_generated_id, {
                $email: customer_email,
                $name: customer_name,
                $phone: customer_phonenumber,
                signup_date: new Date(),
                user_type: 'customer'
            });

            const mailOptions = {
                from: {
                    name: 'CaterOrange',
                    address: 'orders@x.caterorange.com'
                },
                replyTo: 'abhishek@caterorange.com',
                to: customer_email,
                subject: 'Welcome to CaterOrange!',
                html: `<html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                background-color: #f4f4f4;
                                margin: 0;
                                padding: 20px;
                                color: #333;
                            }
                            .email-container {
                                background-color: #ffffff;
                                padding: 30px;
                                border-radius: 12px;
                                max-width: 600px;
                                margin: 0 auto;
                                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                                border: 1px solid #f0f0f0;
                            }
                            .header {
                                color: #ff6600;
                                font-size: 32px;
                                font-weight: bold;
                                text-align: center;
                                padding-bottom: 15px;
                                border-bottom: 3px solid #ff6600;
                            }
                            .section {
                                margin-top: 20px;
                            }
                            .section h2 {
                                color: #ff6600;
                                font-size: 22px;
                                margin-bottom: 10px;
                            }
                            .category {
                                margin-bottom: 15px;
                                color: #555;
                                padding-left: 15px;
                            }
                            .price {
                                font-weight: bold;
                            }
                            .content {
                                font-family: Arial, sans-serif;
                                line-height: 1.8;
                                color: #555;
                            }
                            .footer {
                                margin-top: 40px;
                                text-align: center;
                                font-size: 12px;
                                color: #777;
                            }
                            .footer a {
                                color: #ff6600;
                                text-decoration: none;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="email-container">
                            <div class="header">Welcome to CaterOrange!</div>
                            
                            <p class="content">Dear ${customer_name},</p>
                            <p class="content">Thank you for registering with <strong>CaterOrange</strong>, the premier food delivery app dedicated to meeting all your corporate and event catering needs. We are thrilled to have you as part of our community and look forward to providing you with exceptional service and delicious food!</p>

                            <div class="section">
                                <h2>Corporate Orders</h2>
                                <p class="content">At CaterOrange, we offer a diverse range of corporate food options designed to suit any occasion. Here's a breakdown of what we offer:</p>
                                <ul>
                                    <li class="category"><strong>Breakfast:</strong> Start your day right with our carefully curated breakfast options, perfect for morning meetings and team gatherings.</li>
                                    <li class="category"><strong>Veg Lunch:</strong> Enjoy a satisfying lunch with our vegetarian options at just <span class="price">99/-</span> for 6 items, ensuring your team gets a wholesome and nutritious meal.</li>
                                    <li class="category"><strong>Non-Veg Lunch:</strong> For those who prefer non-vegetarian dishes, our non-veg lunch is available at <span class="price">120/-</span> for 6 items, providing a rich and flavorful meal.</li>
                                    <li class="category"><strong>Snacks:</strong> Keep the energy high with our assortment of snacks, ideal for breaks and light bites throughout the day.</li>
                                    <li class="category"><strong>Veg Dinner:</strong> End the day with our delicious vegetarian dinner options, available at <span class="price">99/-</span> for 6 items, offering a perfect evening meal.</li>
                                    <li class="category"><strong>Non-Veg Dinner:</strong> Our non-veg dinner options, priced at <span class="price">120/-</span> for 6 items, are designed to satisfy hearty appetites and provide a fulfilling end to the day.</li>
                                </ul>
                            </div>

                            <div class="section">
                                <h2>Event Orders</h2>
                                <p class="content">Planning an event? CaterOrange has you covered with our flexible event ordering options:</p>
                                <ul class="content">
                                    <li><strong>Wide Selection:</strong> Choose from an extensive menu of food items to suit any type of event, whether it's a formal gathering, casual get-together, or anything in between.</li>
                                    <li><strong>Customization:</strong> Tailor your plate to your preferences, ensuring every guest gets exactly what they want.</li>
                                    <li><strong>Quantity Selection:</strong> Specify the quantities of each item to perfectly match your event's size and needs.</li>
                                </ul>
                            </div>

                            <p class="content">We are committed to making your food ordering experience seamless and enjoyable. Our team is here to support you every step of the way, from selecting the perfect menu to ensuring timely delivery.</p>
                            <p class="content">We look forward to serving you and making every occasion memorable with our top-notch food and service!</p>

                            <p class="content">Best regards,<br>The <strong>CaterOrange</strong> Team</p>

                            <div class="footer">
                                <p>For support or inquiries, contact us at <a href="mailto:abhishek@scaleorange.com">support@caterorange.com</a></p>
                            </div>
                        </div>
                    </body>
                </html>`
            };

            try {
                const info = await transporter.sendMail(mailOptions);
                console.log('Welcome email sent successfully:', info.messageId);
            } catch (emailError) {
                console.error('Error sending welcome email:', emailError);
                // Continue with registration even if email fails
            }
        }

        const gid = newCustomer.customer_generated_id;
        gidStorage.setGid(gid);
        const token = jwt.sign({ email: customer_email, id: gid }, process.env.SECRET_KEY, { expiresIn: '365d' });

        const newCustomerToken = await customer_model.createCustomerToken(
            customer_email,
            token
        );

        return res.json({
            success: true,
            message: 'Customer registered successfully',
            token,
            customer: newCustomerToken
        });

    } catch (err) {
        trackEvent('Registration Error', {
            email: req.body.customer_email,
            error: err.message
        });
        logger.error('Error during customer registration', { error: err.message });
        return res.status(500).json({ error: err.message });
    }
};


const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let customer_email; // Declare it here so it's available in catch

    try {
        const { customer_email: email, customer_password } = req.body;
        customer_email = email; // Assign it here

        trackEvent('Login Attempted', { email: customer_email });

        // Fetch user data from the database
        const customer = await customer_model.findCustomerEmail(customer_email);
        console.log('Customer fetched from database:', customer);

        if (!customer) {
            console.log('Invalid login attempt', { customer_email });
            return res.status(400).json({
                success: false,
                message: 'Invalid email, user does not exist'
            });
        }

        // Check if customer_password exists in customer object
        if (!customer.customer_password) {
            console.log('Error: customer.customer_password is undefined');
            return res.status(500).json({
                success: false,
                message: 'Password not set for this account ,click forgot password to reset'
            });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(customer_password, customer.customer_password);
        console.log('Password validation result:', isPasswordValid);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect password'
            });
        }

        const checkActivate = await customer_model.findActivated(customer_email);
        if (!checkActivate) {
            logger.error('User is deactivated', { email: customer_email });
            return res.status(400).json({
                success: false,
                message: 'You are unable to login because you are deactivated'
            });
        }

        // Get admin and vendor status
        const adminData = await customer_model.findAdminByCustomerId(customer.customer_generated_id);
        const isAdmin = adminData ? adminData.isadmin : false;
        const isVendor = adminData ? adminData.isvendor : false;
        console.log('Is admin:', isAdmin, 'Is vendor:', isVendor);

        // Verify the existing token or generate a new one
        let uat;
        try {
            jwt.verify(customer.access_token, process.env.SECRET_KEY);
            uat = customer.access_token;
        } catch (err) {
            const gid = customer.customer_generated_id;
            uat = jwt.sign({ 
                email: customer_email, 
                isAdmin, 
                isVendor, 
                id: gid 
            }, process.env.SECRET_KEY, { expiresIn: '365d' });
            await customer_model.updateAccessToken(customer_email, uat);
        }

        res.json({
            success: true,
            message: 'Login successful',
            token: uat,
            isAdmin,
            isVendor
        });

    } catch (err) {
        trackEvent('Login Error', {
            email: customer_email || 'unknown',
            error: err.message
        });

        logger.error('Error during user login', { error: err.message });
        res.status(500).json({
            success: false,
            message: 'An error occurred during login',
            error: err.message
        });
    }
};



const forgotPassword = async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {

            const { customer_email, customer_password,confirm_password } = req.body;

            trackEvent('Password Reset Attempted', {
                email: customer_email
            });
    
    
            const existingUserByEmail = await customer_model.findCustomerEmail(customer_email);
            if (customer_password !== confirm_password) {
                trackEvent('Password Reset Failed', {
                    email: customer_email,
                    reason: 'passwords_mismatch'
                });
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
                token = jwt.verify(customer.access_token, process.env.SECRET_KEY);
                var uat = customer.access_token;
                const gid=existingUserByEmail.customer_generated_id;
                gidStorage.setGid(gid);
                logger.info('Token verified successfully', { token });
            } catch (err) {
                const gid=existingUserByEmail.customer_generated_id;
                gidStorage.setGid(gid);
                var uat = jwt.sign({ email: customer_email ,id:gid }, process.env.SECRET_KEY, { expiresIn: '365d' });
                logger.info('New token generated', { token: uat });
            }
            const customer = await customer_model.updateCustomerPassword(customer_email, hashedPassword,uat);

            if (!customer) {
                logger.warn('Error updating password', { customer_email });
                return res.status(400).json({ message: 'Error updating password' });
            }

            trackEvent('Password Reset Successful', {
                email: customer_email
            });

            res.json({
                success: true,
                message: 'Login successfully with new Password',
                token: uat

            });
        } catch (err) {

            trackEvent('Password Reset Error', {
                email: req.body.customer_email,
                error: err.message
            });

            logger.error('Error during password update', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    };


const updatePassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { customer_email, customer_password, confirm_password } = req.body;

        if (customer_password !== confirm_password) {
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
        }

        const existingUser = await customer_model.findCustomerEmail(customer_email);
        if (!existingUser) {
            return res.status(400).json({ success: false, message: 'Unauthorized to change password' });
        }
        const hashedPassword = await bcrypt.hash(customer_password, 12);

        let token;
            try {
                token = jwt.verify(existingUser.access_token, process.env.SECRET_KEY);
                var uat = existingUser.access_token;
                const gid=existingUser.customer_generated_id;
                gidStorage.setGid(gid);
                logger.info('Token verified successfully', { token });
            } catch (err) {
                const gid=existingUser.customer_generated_id;
                gidStorage.setGid(gid);
                var uat = jwt.sign({ email: customer_email ,id:gid }, process.env.SECRET_KEY, { expiresIn: '365d' });
                logger.info('New token generated', { token: uat });
            }

        const updatedCustomer = await customer_model.updateCustomerPassword(customer_email, hashedPassword,uat);
        if (!updatedCustomer) {
            return res.status(400).json({ message: 'Error updating password' });
        }

        res.json({ success: true, message: 'Password updated successfully', uat });
    } catch (err) {
        console.error('Error updating password:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const google_auth = async (req, res) => {
    try {
        const { customer_name, customer_email } = req.body;

        trackEvent('Google Auth Attempted', {
            email: customer_email,
            name: customer_name
        });

        const existingCustomer = await customer_model.findCustomerEmail(customer_email);
        if (!existingCustomer) {
            const newCustomer = await customer_model.createCustomer(
                customer_name,
                customer_email,
                null,  // password
                null  // phone number 
            );
            const gid=newCustomer.customer_generated_id ;
            gidStorage.setGid(gid);
            const token = jwt.sign({ email: customer_email ,id:gid }, process.env.SECRET_KEY, { expiresIn: '365d' });
            const newCustomerToken = await customer_model.createCustomerToken(
                customer_email,
                token
            );
            logger.info('Customer registered successfully through Google', { customer_email });

            // mail has to be sent 
            const mailOptions = {
                from: {
                    name: 'CaterOrange',
                    address: 'orders@x.caterorange.com'
                },
                replyTo: 'abhishek@caterorange.com',
                to: customer_email,
                subject: 'Welcome to CaterOrange!',
                html: `<html>
            <head>
            <style>
                body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
                color: #333;
                }
                .email-container {
                background-color: #ffffff;
                padding: 30px;
                border-radius: 12px;
                max-width: 600px;
                margin: 0 auto;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                border: 1px solid #f0f0f0;
                }
                .header {
                color: #ff6600;
                font-size: 32px;
                font-weight: bold;
                text-align: center;
                padding-bottom: 15px;
                border-bottom: 3px solid #ff6600;
                }
                .section {
                margin-top: 20px;
                }
                .section h2 {
                color: #ff6600;
                font-size: 22px;
                margin-bottom: 10px;
                }
                .category {
                margin-bottom: 15px;
                color: #555;
                padding-left: 15px;
                }
                .price {
                font-weight: bold;
                }
                .content {
                font-family: Arial, sans-serif;
                line-height: 1.8;
                color: #555;
                }
                .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 12px;
                color: #777;
                }
                .footer a {
                color: #ff6600;
                text-decoration: none;
                }
            </style>
            </head>
            <body>
            <div class="email-container">
                <div class="header">Welcome to CaterOrange!</div>
                
                <p class="content">Dear ${customer_name},</p>
                <p class="content">Thank you for registering with <strong>CaterOrange</strong>, the premier food delivery app dedicated to meeting all your corporate and event catering needs. We are thrilled to have you as part of our community and look forward to providing you with exceptional service and delicious food!</p>

                <div class="section">
                <h2>Corporate Orders</h2>
                <p class="content">At CaterOrange, we offer a diverse range of corporate food options designed to suit any occasion. Here’s a breakdown of what we offer:</p>
                <ul>
                    <li class="category"><strong>Breakfast:</strong> Start your day right with our carefully curated breakfast options, perfect for morning meetings and team gatherings.</li>
                    <li class="category"><strong>Veg Lunch:</strong> Enjoy a satisfying lunch with our vegetarian options at just <span class="price">99/-</span> for 6 items, ensuring your team gets a wholesome and nutritious meal.</li>
                    <li class="category"><strong>Non-Veg Lunch:</strong> For those who prefer non-vegetarian dishes, our non-veg lunch is available at <span class="price">120/-</span> for 6 items, providing a rich and flavorful meal.</li>
                    <li class="category"><strong>Snacks:</strong> Keep the energy high with our assortment of snacks, ideal for breaks and light bites throughout the day.</li>
                    <li class="category"><strong>Veg Dinner:</strong> End the day with our delicious vegetarian dinner options, available at <span class="price">99/-</span> for 6 items, offering a perfect evening meal.</li>
                    <li class="category"><strong>Non-Veg Dinner:</strong> Our non-veg dinner options, priced at <span class="price">120/-</span> for 6 items, are designed to satisfy hearty appetites and provide a fulfilling end to the day.</li>
                </ul>
                </div>

                <div class="section">
                <h2>Event Orders</h2>
                <p class="content">Planning an event? CaterOrange has you covered with our flexible event ordering options:</p>
                <ul class="content">
                    <li><strong>Wide Selection:</strong> Choose from an extensive menu of food items to suit any type of event, whether it’s a formal gathering, casual get-together, or anything in between.</li>
                    <li><strong>Customization:</strong> Tailor your plate to your preferences, ensuring every guest gets exactly what they want.</li>
                    <li><strong>Quantity Selection:</strong> Specify the quantities of each item to perfectly match your event’s size and needs.</li>
                </ul>
                </div>

                <p class="content">We are committed to making your food ordering experience seamless and enjoyable. Our team is here to support you every step of the way, from selecting the perfect menu to ensuring timely delivery.</p>
                <p class="content">We look forward to serving you and making every occasion memorable with our top-notch food and service!</p>

                <p class="content">Best regards,<br>The <strong>CaterOrange</strong> Team</p>

                <div class="footer">
                <p>For support or inquiries, contact us at <a href="mailto:abhishek@scaleorange.com">support@caterorange.com</a></p>
                </div>
            </div>
            </body>
            </html>
            ` // HTML content as you have provided
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(`Error sending email to ${customer_email}:`, error);
                }
                console.log('Email sent to:', customer_email, 'Response:', info.response);
            });

            const decoded = jwt.verify(token,process.env.SECRET_KEY); // Your JWT secret
            console.log("email,id",decoded.email,decoded.id)

            trackEvent('Google Auth Registration Success', {
                distinct_id: newCustomer.customer_generated_id,
                email: customer_email,
                name: customer_name
            });

            mixpanel.people.set(newCustomer.customer_generated_id, {
                $email: customer_email,
                $name: customer_name,
                signup_date: new Date(),
                user_type: 'customer',
                signup_method: 'google'
            });


            return res.json({
                success: true,
                message: 'Customer registered successfully',
                token,
                customer: newCustomerToken
            });
            
        } 
        else {
            // Login existing customer
            let token = existingCustomer.access_token;
            console.log("existingCustomer:", existingCustomer);
            console.log("user existing token:",token);
            try {
                decoded_token = jwt.verify(existingCustomer.access_token, process.env.SECRET_KEY);
                console.log("verified:", decoded_token );
                const id= existingCustomer.customer_generated_id;
                gidStorage.setGid(id);
            } catch (err) {     
                // If token is invalid or expired, create a new one
                const gid=existingCustomer.customer_generated_id ;
                gidStorage.setGid(gid);
                token = jwt.sign({ email: customer_email ,id:gid }, process.env.SECRET_KEY, { expiresIn: '365d' });
                await customer_model.updateAccessToken(customer_email, token);
                logger.info(`Login successful through Google and token updated ${ customer_email} ${token }`);
            }

            trackEvent('Google Auth Login Success', {
                distinct_id: existingCustomer.customer_generated_id,
                email: customer_email
            });

            mixpanel.people.set(existingCustomer.customer_generated_id, {
                $last_login: new Date(),
                last_login_type: 'google'
            });


            return res.json({      
                success: true,
                message: 'Login successful through Google',
                token,
                customer: existingCustomer
            });
        }
    } catch (err) {

        trackEvent('Google Auth Error', {
            email: req.body.customer_email,
            error: err.message
        });

        logger.error('Error during Google OAuth', { error: err.message });
        return res.status(500).json({ error: 'An error occurred during authentication' });
    }
};

const customer_info = async (req, res) => {
  // Extract token from Authorization header
  const token = req.headers['token'];
  console.log('token',token)
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    // Verify and decode the token
    const decoded = jwt.verify(token,process.env.SECRET_KEY); // Your JWT secret
    // Extract user ID or other information from decoded token
    const customer_email = decoded.email; // Adjust based on your token payload
    // Fetch user data from the database
    const result = await client.query('SELECT customer_name, customer_phonenumber FROM customer WHERE customer_email = $1', [customer_email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    const { customer_name, customer_phonenumber } = result.rows[0];
    return res.json({ customer_name, customer_phonenumber, customer_email });
  } catch (error) {
    console.error('Error verifying token or fetching user info:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const checkCustomer = async (req, res) => {
    try {
        const { email } = req.body;
        console.log('email',email)
        const existingUserByEmail = await customer_model.findCustomerEmail(email);
        const checkActivate= await customer_model.findActivated(email);
        console.log('undefined means user is not there',existingUserByEmail)
        console.log('undefined means user is deactivated',checkActivate)

        if (!existingUserByEmail) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email, user does not exist'
            });
        logger.error('You are not registered yet, please register', { email });
        }
        if (!checkActivate) {
            return res.status(400).json({
                success: false,
                message: 'You are deactivated'
            });
            logger.error('You are not registered yet, please register', { email });
        }

        // If user exists, you can send a success response or continue with the next steps
        return res.status(200).json({
            success: true,
            message: ''
        });
    } catch (error) {
        // Log the error
        logger.error('An error occurred while checking the customer', { error });

        // Send a 500 response for server errors
        return res.status(500).json({
            success: false,
            message: 'An error occurred while checking the customer'
        });
    }
};

const checkCustomerOtp = async (req, res) => {
    try {
        console.log('called  controller')
        const { email } = req.body;
        console.log('email',email)
        const existingUserByEmail = await customer_model.findCustomerEmail(email);
        console.log('undefined means user is not there',existingUserByEmail)
        if (!existingUserByEmail) {
            logger.error('You are not registered yet, please register', { email });
            return res.status(400).json({
                success: false,
                message: 'Invalid email, user does not exist'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'You are not registered ,please register !'
        });
    } catch (error) {
        // Log the error
        logger.error('An error occurred while checking the customer', { error });

        // Send a 500 response for server errors
        return res.status(500).json({
            success: false,
            message: 'An error occurred while checking the customer'
        });
    }
};


const createEventOrderController = async (req, res) => {
    const { customer_id, order_date, status, total_amount, vendor_id, delivery_id, eventcart_id } = req.body;

    try {

        trackEvent('Event Order Created', {
            distinct_id: customer_id,
            total_amount: total_amount,
            vendor_id: vendor_id,
            delivery_id: delivery_id
        });

        const order = await customer_model.createEventOrder(customer_id, { order_date, status, total_amount, vendor_id, delivery_id, eventcart_id });
        logger.info('Event order created successfully for customer_id:', customer_id);
        res.status(201).json({ message: 'Event order created successfully', order });
    } catch (error) {

        trackEvent('Event Order Creation Failed', {
            distinct_id: customer_id,
            error: error.message
        });
    
        logger.error('Error creating event order:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getEventOrderByIdController = async (req, res) => {
    const { id } = req.params;

    try {
        const order = await customer_model.getEventOrderById(id);
        if (!order) {
            logger.warn('Event order not found for id:', id);
            return res.status(404).json({ message: 'Event order not found' });
        }
        logger.info('Event order retrieved successfully for id:', id);
        res.status(200).json({ order });
    } catch (error) {
        logger.error('Error retrieving event order:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getAllEventOrdersByCustomerIdController = async (req, res) => {
    const { customer_id } = req.body;

    try {
        const orders = await customer_model.getAllEventOrdersByCustomerId(customer_id);
        logger.info('Event orders retrieved successfully for customer_id:', customer_id);
        res.status(200).json({ orders });
    } catch (error) {
        logger.error('Error retrieving event orders for customer_id:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

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
    const access_token = req.headers['token']// Access token from body
   
    try {
       
        const result = await customer_model.userbytoken(access_token);
        console.log(result.rows[0]);
        return res.json(result.rows[0]); // Responding with the user data
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while retrieving user data', err });
    }
};

const deleteAddressById = async (req, res) => {
    const { address_id } = req.params;
    try {
        const deletedAddress = await customer_model.deleteAddressById(address_id);
        if (!deletedAddress) {
            logger.warn('Address not found for address_id:', address_id);
            return res.status(404).json({ error: 'Address not found' });
        }
        logger.info('Address deleted successfully for address_id:', address_id);
        res.status(200).json({ message: 'Address deleted successfully', deletedAddress });
    } catch (error) {
        logger.error('Error deleting address:', error.message);
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
        logger.warn('No fields provided to update for address_id:', address_id);
        return res.status(400).send('No fields to update');
    }

    try {
        const result = await customer_model.updateAddressById(address_id, fields, values);
        if (result.rowCount === 0) {
            logger.warn('Address not found for address_id:', address_id);
            return res.status(404).send('Address not found');
        }
        logger.info('Address updated successfully for address_id:', address_id);
        res.status(200).send('Address updated');
    } catch (err) {
        logger.error('Error updating address for address_id:', address_id, err);
        res.status(500).send('Internal server error');
    }
};

const CustomerAddress =async (req, res) => {
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

    const customer_id = verified_data.id;
    console.log('gid',customer_id)
          const address=await customer_model.getAddressesByCustomerId(customer_id)
console.log('address',address)
      return res.json({
        success: true,
        address
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

const getCustomerDetails=async(req, res)=>{
    try{
        const token = req.headers['token'];
        console.log('cus',token)
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
      
          const customer_id = verified_data.id;
          const customer=await customer_model.getCustomerDetails(customer_id);
          const Myaddress=await customer_model.getCustomerAddress(customer_id)
          console.log('add',Myaddress)
         
          if(Myaddress==[]){
            res.status(404).json({message: "No address found"});
            return;
          }
          const  useradd=`${Myaddress[0].tag},${Myaddress[0].line1},${Myaddress[0].line2},${Myaddress[0].pincode}`;
          console.log(useradd)
            
        
      const data={
        Name:customer.customer_name,
        PhoneNumber: customer.customer_phonenumber,
        email:customer.customer_email,
        address:useradd,
        id:customer.customer_generated_id
    }
       console.log('data',data)
            return res.json(
                data
                
            );
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
}



// const insertCorporateOrderDetails = async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }

//     try {
//         const {
//             corporateorder_id,
//             processing_date,
//             delivery_status,
//             category_id,
//             quantity,
//             active_quantity,
//             media,
//             delivery_details
//         } = req.body;

//         // Track the event for debugging and monitoring
//         trackEvent('Corporate Order Insertion Attempted', { corporateorder_id });

//         // Insert order details into the database
//         const newOrderDetail = await corporateOrderModel.insertOrderDetail({
//             corporateorder_id,
//             processing_date,
//             delivery_status,
//             category_id,
//             quantity,
//             active_quantity,
//             media,
//             delivery_details
//         });

//         if (!newOrderDetail) {
//             console.log('Order insertion failed', { corporateorder_id });
//             return res.status(400).json({
//                 success: false,
//                 message: 'Failed to insert order details'
//             });
//         }

//         res.status(201).json({
//             success: true,
//             message: 'Order details inserted successfully',
//             data: newOrderDetail
//         });
//     } catch (err) {
//         trackEvent('Corporate Order Insertion Error', { error: err.message });
//         logger.error('Error inserting corporate order details', { error: err.message });
//         res.status(500).json({
//             success: false,
//             message: 'An error occurred while inserting order details',
//             error: err.message
//         });
//     }
// };


module.exports = {
    register,
    login,
    forgotPassword,
    google_auth,
    send_otp,
    verify_otp,
    checkCustomer,
    createEventOrderController,
    getAllEventOrdersByCustomerIdController,
    getEventOrderByIdController,
    getAddressByCustomerId,
    getuserbytoken,
    deleteAddressById,
    updateAddressById,
    customer_info,
    checkCustomerOtp,
    CustomerAddress,
    getCustomerDetails,
    updatePassword
};

