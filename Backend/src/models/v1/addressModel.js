const logger = require('../../config/logger.js');
const { DB_COMMANDS } = require('../../utils/queries.js');
const client = require('../../config/dbConfig.js');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.SECRET_KEY; // Make sure this is set in your environment variables

const createaddress = async (customer_id, tag, pincode, line1, line2, location, ship_to_name, ship_to_phone_number) => {
    try {
        logger.info('Creating address for customer ID:', customer_id);
        const result = await client.query(
            DB_COMMANDS.CREATE_ADDRESS,
            [customer_id, tag, pincode, line1, line2, location, ship_to_name, ship_to_phone_number]
        );
        logger.info('Address added successfully');
        return result.rows[0];  
    } catch (err) {
        logger.error(`Error adding address data $ {err.message }`);
        throw err;
    }
};

const select_default_address = async (customer_email) => {
    try {
        const result = await client.query(DB_COMMANDS.CUSTOMER_EMAIL_SELECT, [customer_email]);
        logger.info(`Fetched default address for customer email:${ customer_email}`);
        return result.rows[0];  // Return the customer details, or undefined if not found
    } catch (err) {
        logger.error(`Error querying the database for customer_email ${ err.message }`);
        throw err;
    }
}

// Function to extract userId from the token
const getUserIdFromToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET); // Verifies the token using your secret
        logger.info('Token decoded successfully, user ID:', decoded.id);
        return decoded.id;
    } catch (error) {
        logger.error('Invalid Token', { error: error.message });
        throw new Error('Invalid Token');
    }
}

const updateAddressById = async (address_id, tag, pincode, line1, line2) => {
    try {
        logger.info('Updating address with ID:', address_id);
        const query = `
            UPDATE address 
            SET tag = $1, pincode = $2, line1 = $3, line2 = $4 
            WHERE address_id = $5 
            RETURNING *;
        `;
        const values = [tag, pincode, line1, line2, address_id];
        const result = await client.query(query, values);
        
        logger.info('Address updated successfully:', result.rows[0]);
        return result.rows[0]; // Return the updated address
    } catch (error) {
        logger.error('Error updating address', { error: error.message });
        throw error;
    }
};

const getAllAddresses = async (customer_id) => {
    try {
        const result = await client.query(
            DB_COMMANDS.GET_ALL_ADDRESSES,
            [customer_id]
        );
        
        logger.info('All addresses retrieved successfully for customer ID:', customer_id);
        return result.rows;  
    } catch (err) {
        logger.error('Error retrieving all addresses:', { error: err.message });
        throw err;
    }
}
const SelectAddress = async (address_id) => {
    try {
        const result = await client.query(
            DB_COMMANDS.SELECT_ADDRESS,
            [address_id]
        );
        
        logger.info('Address retrieved successfully for address ID:', address_id);
        return result.rows[0];  
    } catch (err) {
        logger.error('Error retrieving address data:', { error: err.message });
        throw err;
    }
}


const updateAddress = async (customer_id, address_id, tag, pincode, line1, line2, location, ship_to_name, ship_to_phone_number) => {
    try {
        logger.info(`Updating address for customer ID: ${customer_id}, Address ID: ${address_id}`);
        
        const result = await client.query(
            DB_COMMANDS.UPDATE_ADDRESS,
            [customer_id, address_id, tag, pincode, line1, line2, location, ship_to_name, ship_to_phone_number]
        );

        console.log('data is ',customer_id, address_id, tag, pincode, line1, line2, location, ship_to_name, ship_to_phone_number);
        
        if (result.rowCount === 0) {
            logger.warn(`Address not found or unauthorized update attempt for Address ID: ${address_id}`);
            return null;
        }

        logger.info('Address updated successfully');
        return result.rows[0];
    } catch (err) {
        logger.error(`Error updating address data: ${err.message}`);
        throw err;
    }
};

const deleteAddress = async (customer_id, address_id) => {
    try {
        logger.info(`Deleting address for customer ID: ${customer_id}, Address ID: ${address_id}`);
        
        const result = await client.query(
            DB_COMMANDS.DELETE_ADDRESS,
            [customer_id, address_id]
        );

        if (result.rowCount === 0) {
            logger.warn(`Address not found or unauthorized delete attempt for Address ID: ${address_id}`);
            return null;
        }

        logger.info('Address deleted successfully');
        return true;
    } catch (err) {
        logger.error(`Error deleting address data: ${err.message}`);
        throw err;
    }
};





module.exports = {
    createaddress,
    select_default_address,
    getUserIdFromToken,
    updateAddressById,
    getAllAddresses,
    SelectAddress,
    updateAddress,
    deleteAddress
}