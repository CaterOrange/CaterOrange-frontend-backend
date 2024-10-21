require('dotenv').config();
const logger = require('../config/logger');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createaddress, select_default_address, getUserIdFromToken, updateAddressById } = require('../models/addressModel.js');
const client = require('../config/dbConfig.js');

const createAddress = async (req, res) => {
    try {
        const token = req.headers['token'];
        logger.info('Received token for address creation: ', { token });

        if (!token) {
            logger.warn('No token provided in request headers');
            return res.status(401).json({ message: 'No token provided' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.SECRET_KEY);
            logger.info('Token verified successfully', { userId: decoded.id });
        } catch (err) {
            logger.error('Token verification failed', { error: err });
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        const customer_id = decoded.id;
        const { tag, pincode, line1, line2, location, ship_to_name, ship_to_phone_number } = req.body;

        // Validate that required fields are provided
        if (!tag || !pincode || !line1 || !line2 || !location) {
            logger.warn('Missing required fields in address creation request');
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newCustomer = await createaddress(
            customer_id, tag, pincode, line1, line2, location, ship_to_name, ship_to_phone_number
        );

        logger.info('Address stored successfully for user', { userId: customer_id });
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
            logger.warn('No token provided for default address request');
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verifying the token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.SECRET_KEY);
            logger.info('Token verified successfully for default address retrieval', { userEmail: decoded.email });
        } catch (err) {
            logger.error('Token verification failed', { error: err });
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        const customer_email = decoded.email;
        logger.info('Retrieving default address for user', { userEmail: customer_email });
        const defaultAddress = await select_default_address(customer_email);

        logger.info('Default address retrieved successfully for user', { userEmail: customer_email });
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

// Get all addresses for the user
const getAddressForUser = async (req, res) => {
    const token = req.headers['token'];
    if (!token) {
        logger.warn('No token provided for address retrieval');
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const userId = getUserIdFromToken(token);
        logger.info('Retrieving addresses for user', { userId });

        const query = 'SELECT * FROM address WHERE customer_id = $1';
        const values = [userId];
        const result = await client.query(query, values);

        logger.info('Addresses retrieved successfully for user', { userId });
        return res.json({
            success: true,
            message: 'Address fetched successfully',
            address: result.rows
        });
    } catch (error) {
        logger.error('Error fetching addresses', { error: error.message });
        return res.status(500).json({ message: 'Error fetching addresses', error });
    }
};

// Edit address by ID
const editAddress = async (req, res) => {
    const { address_id } = req.params;
    const { tag, pincode, line1, line2 } = req.body;

    if (!tag || !pincode || !line1 || !line2) {
        logger.warn('Missing required fields in edit address request');
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        logger.info('Updating address', { addressId: address_id });
        const updatedAddress = await updateAddressById(address_id, tag, pincode, line1, line2);

        if (!updatedAddress) {
            logger.warn('Address not found for updating', { addressId: address_id });
            return res.status(404).json({ error: 'Address not found' });
        }

        logger.info('Address updated successfully', { addressId: address_id });
        return res.status(200).json({
            message: 'Address updated successfully',
            updatedAddress,
        });
    } catch (error) {
        logger.error('Error updating address', { error: error.message });
        return res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    createAddress,
    getDefaultAddress,
    getAddressForUser,
    editAddress,
};
