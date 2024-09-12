const logger = require('../config/logger.js');
const { DB_COMMANDS} = require('../utils/queries.js');
const client = require('../config/dbConfig.js');

const createCustomer = async (customer_name, customer_email, customer_password, customer_phonenumber, access_token) => {
    try {
        
        const result = await client.query(
            DB_COMMANDS.CUSTOMER_INSERT,
            [customer_name, customer_email, customer_password, customer_phonenumber, access_token]
        );
        logger.info('User data added successfully', { customer_email });
        return result.rows[0];  // Return the created customer
    } catch (err) {
        logger.error('Error adding user data', { error: err.message, customer_email });
        throw err;
    }
};

const findCustomerEmail = async (customer_email ) => {
    try {
        const result = await client.query(DB_COMMANDS.CUSTOMER_EMAIL_SELECT, [customer_email]);
        return result.rows[0];  // Return the customer details, or `undefined` if not found
    } catch (err) {
        logger.error('Error querying the database for customer_email', { error: err.message });
        throw err;
    }
};

const loginCustomer = async (customer_email) => {
    try {
        const result = await client.query(
            DB_COMMANDS.CUSTOMER_EMAIL_SELECT,
            [customer_email]
        );
        if (result.rows.length === 0) {
            logger.warn('No user data found for email', { customer_email });
        } else {
            logger.info('User data retrieved successfully', { customer_email });
        }
        return result.rows[0];
    } catch (err) {
        logger.error('Error checking user data', { error: err.message, customer_email });
        throw err; 
    }
};



const updateCustomerPassword = async (customer_email, hashedPassword,token) => {
    try {
        const result = await client.query(
            DB_COMMANDS.CUSTOMER_SET_PASSWORD,
            [customer_email, hashedPassword,token]
        );
        logger.info('Customer password updated successfully', { customer_email });
        return result.rowCount > 0; // Return true if any row was updated
    } catch (err) {
        logger.error('Error updating customer password', { error: err.message, customer_email });
        throw err;
    }
};

const getAllCustomers = async () => {
    return client.query(DB_COMMANDS.GET_ALL_CUSTOMERS);
  }
  
  const getCustomerById = async (userId) => {
    return client.query(DB_COMMANDS.GET_CUSTOMER_BY_ID, [userId]);
  }
  const deleteCustomerById = async (userId) => {
    return client.query(DB_COMMANDS.DELETE_CUSTOMER, [userId]);
  }




  

module.exports = {
    createCustomer,
    findCustomerEmail,
    loginCustomer,
    updateCustomerPassword,
    getAllCustomers,
    getCustomerById,
    deleteCustomerById


    
};
