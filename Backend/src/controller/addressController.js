require('dotenv').config();
const logger = require('../config/logger');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const address_model = require('../models/addressModel');

const Ajv = require("ajv");

const addFormats = require("ajv-formats");

const ajv = new Ajv({ allErrors: true, strict: false });

addFormats(ajv);

const { addressSchema } = require("../SchemaValidator/addressSchema");
const client = require('../config/dbConfig');
const validate = ajv.compile(addressSchema);


const createAddress = async (req, res) => {
    try {
        const token = req.headers['token'];
        logger.info('Received token for address creation: ', { token });

        if (!token) {
            logger.warn('No token provided in request headers');
            return res.status(401).json({ message: 'No token provided' });
        }
        let verified_data;
        try {
            verified_data = jwt.verify(token, process.env.SECRET_KEY);
            logger.info('Token verified successfully', { userId: verified_data.id });
        } catch (err) {
            logger.error('Token verification failed', { error: err });
            if (err instanceof jwt.TokenExpiredError) {
                return res.status(401).json({ success: false, message: 'Token has expired' });
            } else if (err instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({ success: false, message: 'Invalid token' });
            } else {
                return res.status(401).json({ success: false, message: 'Token verification failed' });
            }
        }

        const customer_id = verified_data.id;
        const { tag, pincode, line1, line2, location, ship_to_name, ship_to_phone_number } = req.body;
            
        if (!tag || !pincode || !line1 || !line2 || !location) {
            logger.warn('Missing required fields in address creation request');
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newCustomer = await address_model.createaddress(
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
        console.log(token,"key:",process.env.SECRET_KEY);
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
        const defaultAddress = await address_model.select_default_address(customer_email);

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
    try {
        const token = req.headers['token'];
        if (!token) {
            logger.warn('No token provided for address retrieval');
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verifying the token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.SECRET_KEY);
            logger.info('Token verified successfully for address retrieval', { userId: decoded.id });
        } catch (err) {
            logger.error('Token verification failed', { error: err });
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        const customer_id = decoded.id;

        // Fetch addresses from database
        const addresses = await address_model.getAllAddresses(customer_id);

        if (!addresses || addresses.length === 0) {
            logger.warn('No addresses found for user', { userId: customer_id });
            return res.status(404).json({ message: 'No addresses found' });
        }

        logger.info('All addresses retrieved successfully for user', { userId: customer_id });
        return res.json({
            success: true,
            message: 'All addresses retrieved successfully',
            addresses // Ensure it's named correctly for frontend consistency
        });
    } catch (err) {
        logger.error('Error retrieving all addresses', { error: err.message });
        return res.status(500).json({ error: err.message });
    }
};

// Get selected address based on address_id
const getSelectedAddress = async (req, res) => {
    try {
        const { address_id } = req.query; // Access the address_id from query parameters
        console.log(address_id);
        logger.info('Fetching address by ID', { addressId: address_id });
         
        const result = await address_model.SelectAddress(address_id);

        logger.info('Address retrieved successfully', { addressId: address_id });
        return res.json({
            success: true,
            result
        });
    } catch (err) {
        logger.error('Error retrieving selected address', { error: err.message });
        return res.status(500).json({ error: err.message });
    }
};


const editAddress = async (req, res) => {
    const { address_id } = req.params;
    const { tag, pincode, line1, line2, location, ship_to_name, ship_to_phone_number } = req.body;
   console.log('request',tag, pincode, line1, line2, location, ship_to_name, ship_to_phone_number)
    if (!tag || !pincode || !line1 || !line2 || !location || !ship_to_name || !ship_to_phone_number) {
        logger.warn('Missing required fields in edit address request');
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const updatedAddress = await client.query(
            `UPDATE address 
             SET tag = $1, pincode = $2, line1 = $3, line2 = $4, location = $5, 
                 ship_to_name = $6, ship_to_phone_number = $7
             WHERE address_id = $8 
             RETURNING *`,
            [tag, pincode, line1, line2, location, ship_to_name, ship_to_phone_number, address_id]
        );

        if (updatedAddress.rowCount === 0) {
            return res.status(404).json({ error: "Address not found" });
        }

        logger.info('Address updated successfully', { addressId: address_id });
        return res.json({
            success: true,
            message: 'Address stored successfully',
            customer: updatedAddress
        });
    } catch (error) {
        console.log('Error updating address', { error: error.message });
        return res.status(500).json({ error: 'Server error' });
    }
};


const updateAddress = async (req, res) => {
    try {
        // Extract token from headers
        const token = req.headers['token'];
        logger.info('Received token for address update', { token });

        if (!token) {
            logger.warn('No token provided in request headers');
            return res.status(401).json({ message: 'No token provided' });
        }

        let verified_data;
        try {
            // Verify token using the secret key
            verified_data = jwt.verify(token, process.env.SECRET_KEY);
            logger.info('Token verified successfully', { userId: verified_data.id });

            if (!verified_data.id) {
                logger.warn('User ID not found in token payload');
                return res.status(401).json({ message: 'Invalid token payload' });
            }
        } catch (err) {
            logger.error('Token verification failed', { error: err });
            return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }

        // Extract user ID from token
        const customer_id = verified_data.id;

        // Extract address_id properly
        const { id: address_id } = req.params;  // Fix: Renaming id to address_id
        console.log('Address ID from controller is:', address_id);

        const { tag, pincode, line1, line2, location, ship_to_name, ship_to_phone_number } = req.body;

        // Call the model to update the address
        const updatedAddress = await address_model.updateAddress(
            customer_id, address_id, tag, pincode, line1, line2, location, ship_to_name, ship_to_phone_number
        );

        // If no address was updated, return an error
        if (!updatedAddress) {
            logger.warn('Address not found or unauthorized', { userId: customer_id });
            return res.status(404).json({ message: 'Address not found or unauthorized' });
        }

        logger.info('Address updated successfully for user', { userId: customer_id });
        return res.json({
            success: true,
            message: 'Address updated successfully',
            address: updatedAddress
        });
    } catch (err) {
        logger.error('Error updating address', { error: err.message });
        return res.status(500).json({ error: err.message });
    }
};


const deleteAddress = async (req, res) => {
    try {
        const token = req.headers['token'];
        logger.info('Received token for address deletion', { token });

        if (!token) {
            logger.warn('No token provided in request headers');
            return res.status(401).json({ message: 'No token provided' });
        }

        let verified_data;
        try {
            verified_data = jwt.verify(token, process.env.SECRET_KEY);
            logger.info('Token verified successfully', { userId: verified_data.id });
        } catch (err) {
            logger.error('Token verification failed', { error: err });
            return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }

        const customer_id = verified_data.id;
        const { id: address_id } = req.params;  // Fix: Renaming id to address_id

        console.log('ids are ',customer_id,address_id)

        const deletedAddress = await address_model.deleteAddress(customer_id, address_id);

        if (!deletedAddress) {
            return res.status(404).json({ message: 'Address not found or unauthorized' });
        }

        logger.info('Address deleted successfully for user', { userId: customer_id });
        return res.json({
            success: true,
            message: 'Address deleted successfully'
        });
    } catch (err) {
        logger.error('Error deleting address', { error: err.message });
        return res.status(500).json({ error: err.message });
    }
};




module.exports = {
    createAddress,
    getDefaultAddress,
    getAddressForUser,
    getSelectedAddress,
    editAddress,
    updateAddress,
    deleteAddress
};