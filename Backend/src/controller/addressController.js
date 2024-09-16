require('dotenv').config();
const logger = require('../config/logger');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const address_model = require('../models/addressModels'); // Fixed import
const createAddress = async (req, res) => {
    try {
        const token = req.headers['token'];
        console.log(token)
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY); 
        
        const customer_id = decoded.id;
        // console.log(customer_id)
        const { tag, pincode, line1, line2, location, ship_to_name, ship_to_phone_number } = req.body;
        const newCustomer = await address_model.createaddress(
            customer_id, tag, pincode, line1, line2, location, ship_to_name, ship_to_phone_number
        );

        return res.json({
            success: true,
            message: 'Address stored successfully',
            customer: newCustomer
        });
    } catch (err) {
        logger.error('Error during address storing', { error: err.message });
        return res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createAddress
};
