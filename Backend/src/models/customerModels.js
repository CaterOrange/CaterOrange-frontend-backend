const logger = require('../config/logger.js');
const { DB_COMMANDS } = require('../utils/queries.js');
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

const findCustomerToken = async (access_token) => {
    try {
        const result = await client.query(DB_COMMANDS.CUSTOMER_TOKEN_SELECT, [access_token]);
        if (result.rows.length === 0) {
            logger.error('No customer found with token:', access_token);
            return null;
        }
        return result.rows[0];  // Return the customer details, or undefined if not found
    } catch (err) {
        logger.error('Error querying the database for access_token', { error: err.message });
        throw err;
    }
};

const findCustomerEmail = async (customer_email) => {
    try {
        const result = await client.query(DB_COMMANDS.CUSTOMER_EMAIL_SELECT, [customer_email]);
        return result.rows[0];  // Return the customer details, or undefined if not found
    } catch (err) {
        logger.error('Error querying the database for customer_email', { error: err.message });
        throw err;
    }
};

const updateCustomerPassword = async (customer_email, hashedPassword, token) => {
    try {
        const result = await client.query(
            DB_COMMANDS.CUSTOMER_SET_PASSWORD,
            [customer_email, hashedPassword, token]
        );
        logger.info('Customer password updated successfully', { customer_email });
        return result.rowCount > 0; // Return true if any row was updated
    } catch (err) {
        logger.error('Error updating customer password', { error: err.message, customer_email });
        throw err;
    }
};

const updateAccessToken = async (customer_email, access_token) => {
    try {
        const result = await client.query(
            DB_COMMANDS.CUSTOMER_SET_ACCESSTOKEN,
            [customer_email, access_token]
        );
        logger.info('Customer token updated successfully', { customer_email });
        return result.rowCount > 0; // Return true if any row was updated
    } catch (err) {
        logger.error('Error updating customer token', { error: err.message, customer_email });
        throw err;
    }
};

const createCustomerToken = async (customer_email, token) => {
    try {
        const result = await client.query(
            DB_COMMANDS.CUSTOMER_SET_TOKEN,
            [customer_email, token]
        );
        // logger.info('Customer data updated successfully', { customer_email });
        return result.rowCount > 0; // Return true if any row was updated
    } catch (err) {
        logger.error('Error updating customer token', { error: err.message });
        throw err;
    }
};

// Function to find activated customer
const findActivated = async (customer_email) => {
    try {
        const result = await client.query(DB_COMMANDS.CUSTOMER_EMAIL_SELECT, [customer_email]);
        if (result.rows.length > 0) {
            const check = await client.query(DB_COMMANDS.CUSTOMER_ACTIVATED_CHECK, [customer_email]);
            logger.info('Customer activation check result:', check.rows[0]);
            return check.rows[0];
        } else {
            throw new Error("Customer not found because they are deactivated");
        }
    } catch (err) {
        logger.error('Error checking if customer is deactivated', { error: err.message });
        throw err;
    }
};

const createEventOrder = async (customer_id, orderData) => {
    const { order_date, status, total_amount, vendor_id, delivery_id, eventcart_id } = orderData;
    const values = [customer_id, order_date, status, total_amount, vendor_id, delivery_id, eventcart_id];

    try {
        const result = await client.query(DB_COMMANDS.createEventOrder, values);
        logger.info('Event order created successfully:', { customer_id, orderData });
        return result.rows[0];
    } catch (error) {
        logger.error('Error creating event order:', { error: error.message });
        throw new Error('Error creating event order: ' + error.message);
    }
};

const getEventOrderById = async (eventorder_id) => {
    try {
        const result = await client.query(DB_COMMANDS.getEventOrderById, [eventorder_id]);
        logger.info('Retrieved event order:', { eventorder_id, result: result.rows[0] });
        return result.rows[0];
    } catch (error) {
        logger.error('Error retrieving event order:', { error: error.message });
        throw new Error('Error retrieving event order: ' + error.message);
    }
};

const getAllEventOrdersByCustomerId = async (customer_id) => {
    try {
        const result = await client.query(DB_COMMANDS.getAllEventOrdersByCustomerId, [customer_id]);
        logger.info('Retrieved all event orders for customer ID:', { customer_id, count: result.rows.length });
        return result.rows;
    } catch (error) {
        logger.error('Error retrieving event orders:', { error: error.message });
        throw new Error('Error retrieving event orders: ' + error.message);
    }
};

const getAddressesByCustomerId = async (customer_id) => {
    const result = await client.query(DB_COMMANDS.GET_ADDRESSES_BY_CUSTOMER_ID, [customer_id]);
    logger.info('Addresses retrieved for customer ID:', { customer_id, count: result.rows.length });
    return result.rows;
};

const userbytoken = async (access_token) => {
    try {
        const result = await client.query(DB_COMMANDS.GET_USER_BY_TOKEN, [access_token]);
        logger.info('User retrieved by token:', { access_token });
        return result;
    } catch (err) {
        logger.error('Error retrieving user by token:', { error: err.message });
        throw err;
    }
};

const deleteAddressById = async (address_id) => {
    const result = await client.query(DB_COMMANDS.DELETE_ADDRESS_BY_ID, [address_id]);
    logger.info('Address deleted:', { address_id });
    return result.rows[0]; // Return the deleted address details
};

const updateAddressById = async (id, fields, values) => {
    let query = DB_COMMANDS.UPDATE_ADDRESS_BY_ID + ' ' + fields.join(', ') + ' WHERE address_id = $' + (fields.length + 1);
    logger.info('Updating address:', { id, fields, values });
    return client.query(query, [...values, id]);
};

const getCustomerDetails = async (customer_id) => {
    try {
        console.log('cus',customer_id)
        const result = await client.query(DB_COMMANDS.CUSTOMER_SELECT_BY_GID, [customer_id]);
        if (result.rows.length === 0) {
            logger.error('Customer not found for ID:', customer_id);
            return null;
        }
        logger.info('Customer details retrieved:', { customer_id, customer: result.rows[0] });
        return result.rows[0];
    } catch (err) {
        logger.error('Error querying database for customer details', { error: err.message });
        throw err;
    }
};

const getCustomerAddress = async (customer_id) => {
    try {
        const res = await client.query(DB_COMMANDS.GET_ADDRESSES_BY_CUSTOMER_ID, [customer_id]);
        console.log('res',res)
        logger.info('Customer addresses fetched for ID:', { customer_id, count: res.rowCount });

        return res.rows;
    } catch (err) {
        logger.error('Error fetching customer addresses:', { error: err.message });
        throw new Error('Error fetching addresses from the database');
    }
};

const findAdminByCustomerId = async (customer_generated_id) => {
    try {
        const query = 'SELECT * FROM admin WHERE customer_generated_id = $1';
        const result = await client.query(query, [customer_generated_id]);
        logger.info('Admin details found for customer ID:', { customer_generated_id, admin: result.rows[0] });

        return result.rows[0];
    } catch (err) {
        logger.error('Error finding admin by customer ID:', { error: err.message });
        throw err;
    }
};

module.exports = {
    createCustomer,
    findCustomerEmail,
    updateCustomerPassword,
    updateAccessToken,
    createCustomerToken,
    createEventOrder,
    getEventOrderById,
    getAllEventOrdersByCustomerId,
    getAddressesByCustomerId,
    userbytoken,
    deleteAddressById,
    updateAddressById,
    findCustomerToken,
    findActivated,
    getCustomerAddress,
    getCustomerDetails,
    findAdminByCustomerId
};
