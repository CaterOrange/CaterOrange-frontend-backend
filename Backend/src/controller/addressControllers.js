require('dotenv').config();
const logger = require('../config/logger');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {createaddress,select_default_address,getUserIdFromToken,updateAddressById} = require('../models/addressModel.js');
const client = require('../config/dbconfig.js');

const createAddress = async (req, res) => {
    try {
        const token = req.headers['token'];       
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
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

        const newCustomer = await createaddress(
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
        console.log('email',customer_email)
        const defaultAddress = await select_default_address(customer_email);

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
    const token = req.headers['token'];
    const userId = getUserIdFromToken(token);
    try 
    {
      const query = 'SELECT * FROM address WHERE customer_id = $1';
      const values = [userId];
      const result = await client.query(query, values);
    return res.json({
        success: true,
        message: 'Address fetched successfully',
        address: result.rows
    });
    } 
    catch (error) 
    {
      res.status(500).json({ message: 'Error fetching addresses', error });
    }
  };

  const editAddress = async (req, res) => {
    const { address_id } = req.params;
    const { tag, pincode, line1, line2  } = req.body;
    if (!tag || !pincode || !line1 || !line2) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    try {
      const updatedAddress = await updateAddressById(address_id, tag, pincode, line1, line2);
      if (!updatedAddress) 
      {
        return res.status(404).json({ error: 'Address not found' });
      }
      res.status(200).json({
        message: 'Address updated successfully',
        updatedAddress,
      });
    } catch (error) {
      console.error('Error updating address:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };

module.exports = {
    createAddress,
    getDefaultAddress,
    getAddressForUser,
    editAddress,
};