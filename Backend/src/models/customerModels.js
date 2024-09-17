const logger = require('../config/logger.js');
const { DB_COMMANDS} = require('../utils/queries.js');
const client = require('../config/dbConfig.js');

const createCustomer = async (customer_name, customer_email, customer_password, customer_phonenumber, access_token) => {
    try {
        
        const result = await client.query(
            DB_COMMANDS.CUSTOMER_INSERT,
            [customer_name, customer_email, customer_password, customer_phonenumber, access_token]
        );
        logger.info('User data added successfully', {customer_email});
        return result.rows[0];  // Return the created customer
    } catch (err) {
        logger.error('Error adding user data', { error: err.message, customer_email });
        throw err;
    }
};


const findCustomerEmail = async (customer_email ) => {
    try {
        const result = await client.query(DB_COMMANDS.CUSTOMER_EMAIL_SELECT, [customer_email]);
        console.log(result.rows[0])
        return result.rows[0];  // Return the customer details, or undefined if not found

    } catch (err) {
        logger.error('Error querying the database for customer_email', { error: err.message });
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

const updateAccessToken= async(customer_email, access_token)=>{
    try {
        const result = await client.query(
            DB_COMMANDS.CUSTOMER_SET_ACCESSTOKEN,
            [customer_email, access_token]
        );
        logger.info('Customer Token updated successfully', { customer_email });
        return result.rowCount > 0; // Return true if any row was updated
    } catch (err) {
        logger.error('Error updating customer token', { error: err.message, customer_email });
        throw err;
    }
}
const createCustomerToken=async(customer_email,token)=>{
    try {
        const result = await client.query(
            DB_COMMANDS.CUSTOMER_SET_TOKEN,
            [customer_email,token]
        );
        // logger.info('Customer Data updated successfully', { customer_email });
        return result.rowCount > 0; // Return true if any row was updated
    } catch (err) {
        logger.error('Error updating customer token', { error: err.message});
        throw err;
    }
}

// Function to find activated customer
const findActivated = async (customer_email) => {
    try {
        const result = await client.query(DB_COMMANDS.CUSTOMER_EMAIL_SELECT, [customer_email]);
        if (result.rows.length > 0) {
            const check = await client.query(DB_COMMANDS.CUSTOMER_ACTIVATED_CHECK, [customer_email]);
            console.log(check.rows[0])
            return check.rows[0]; 
        } else {
            throw new Error("Customer not found becuase he is deactivated");
        }
    } catch (err) {
        logger.error('Error checking if customer is deactivated', { error: err.message });
        throw err; 
    }
}

module.exports = {
    createCustomer,
    findCustomerEmail,
    updateCustomerPassword,
    updateAccessToken,
    createCustomerToken,
    findActivated
};
