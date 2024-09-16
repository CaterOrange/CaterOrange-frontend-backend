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
const createEventOrder = async (customer_id, orderData) => {
    const { order_date, status, total_amount, vendor_id, delivery_id, eventcart_id } = orderData;
    const values = [customer_id, order_date, status, total_amount, vendor_id, delivery_id, eventcart_id];
  
    try {
        const result = await client.query(DB_COMMANDS.createEventOrder, values);
        return result.rows[0];
    } catch (error) {
        throw new Error('Error creating event order: ' + error.message);
    }
}

  const getEventOrderById = async (eventorder_id)=> {
    try {
        const result = await client.query(DB_COMMANDS.getEventOrderById, [eventorder_id]);
        return result.rows[0];
    } catch (error) {
        throw new Error('Error retrieving event order: ' + error.message);
    }
}

 const  getAllEventOrdersByCustomerId = async(customer_id)=> {
    try {
        const result = await client.query(DB_COMMANDS.getAllEventOrdersByCustomerId, [customer_id]);
        return result.rows;
    } catch (error) {
        throw new Error('Error retrieving event orders: ' + error.message);
    }
}
const getAddressesByCustomerId = async (customer_id) => {
    const result = await client.query(DB_COMMANDS.GET_ADDRESSES_BY_CUSTOMER_ID, [customer_id]);
    return result.rows;
  };
const userbytoken = async (access_token) => {
    return client.query(DB_COMMANDS.GET_USER_BY_TOKEN, [access_token]);
  }

module.exports = {
    createCustomer,
    findCustomerEmail,
    loginCustomer,
    updateCustomerPassword,
    createEventOrder,
    getEventOrderById,
    getAllEventOrdersByCustomerId,
    getAddressesByCustomerId,
    userbytoken

   


    
};
