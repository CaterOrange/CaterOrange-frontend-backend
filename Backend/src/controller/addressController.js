require('dotenv').config();
const logger = require('../config/logger');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const address_model = require('../models/addressModels'); // Fixed import

// Create a new address for the customer
const createAddress = async (req, res) => {
    try {
        const token = req.headers['token'];
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verifying the token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.SECRET_KEY); 
        } catch (err) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        const customer_id = decoded.id;
        const { tag, pincode, line1, line2, location, ship_to_name, ship_to_phone_number } = req.body;

        // Validate that required fields are provided
        if (!tag || !pincode || !line1 || !line2 || !location) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

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

// Get the default address for the customer
const getDefaultAddress = async (req, res) => {
    try {
        const token = req.headers['token'];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        // Verifying the token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.SECRET_KEY);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        const customer_email = decoded.email;
        const defaultAddress = await address_model.select_default_address(customer_email);

        return res.json({
            success: true,
            message: 'Default address retrieved successfully',
            customer: defaultAddress
        });
    } catch (err) {
        logger.error('Error retrieving default address', { error: err.message });
        return res.status(500).json({ error: err.message });
    }
};
const getAddressForUser = async (req, res) => {
    try {
        const token = req.headers['token'];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        // Verifying the token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.SECRET_KEY);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        const customer_id = decoded.id;

       const result=await address_model.getAllAddresses(customer_id)
        return res.json({
            success: true,
            message: 'all address retrieved successfully',
            address:result
        });
    } catch (err) {
        logger.error('Error retrieving all address', { error: err.message });
        return res.status(500).json({ error: err.message });
    }
};

const getSelectedAddress=async(req, res)=>{
    try {
        const { address_id } = req.query; // Access the address_id from query parameters
     
        
        const result = await address_model.SelectAddress(address_id);
        
        return res.json({
          success: true,
          result
        });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
}

module.exports = {
    createAddress,
    getDefaultAddress,
    getAddressForUser,
    getSelectedAddress
};
