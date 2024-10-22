const client = require("../config/dbConfig");
const logger = require('../config/logger.js');
const { DB_COMMANDS } = require('../utils/queries.js');

const updateOrder = async (order_id, payment_id, payment_status) => {
    const query = `
        UPDATE corporate_orders
        SET paymentid = $1, payment_status = $2
        WHERE corporateorder_generated_id = $3
        RETURNING *;
    `;

    const values = [payment_id, payment_status, order_id];

    try {
        const result = await client.query(query, values);
        logger.info('Corporate order updated successfully:', { order_id, payment_id, payment_status });
        return result.rows[0]; // Return the updated order details
    } catch (error) {
        logger.error('Error updating corporate order:', { error: error.message });
        throw error;
    }
};

const deleteCart = async (customer_id) => {
    const query = `
     DELETE FROM corporate_cart WHERE customer_generated_id = $1;
  ;
    `;

    const values = [customer_id];

    try {
        const result = await client.query(query, values);
        logger.info('deleted carts successfully:', { customer_id });
        return result.rows[0]; // Return the updated order details
    } catch (error) {
        logger.error('Error deleting carts after payment:', { error: error.message });
        throw error;
    }
};
const getOrdergenId = async (customer_id) => {
    try {
        const result = await client.query(DB_COMMANDS.GET_ORDER_GENID, [customer_id]);
        if (result.rows.length === 0) {
            logger.error('Order not found for customer ID:', { customer_id });
            return null;
        }
        logger.info('Order generated ID retrieved successfully:', { customer_id });
        return result.rows[0];
    } catch (err) {
        logger.error('Error querying database for order generated ID:', { error: err.message });
        throw err;
    }
};

const getEOrdergenId = async (customer_id) => {
    try {
        const result = await client.query(DB_COMMANDS.GET_ORDER_EVENTGENID, [customer_id]);
        if (result.rows.length === 0) {
            logger.error('Event order not found for customer ID:', { customer_id });
            return null;
        }
        logger.info('Event order generated ID retrieved successfully:', { customer_id });
        return result.rows[0];
    } catch (err) {
        logger.error('Error querying database for event order generated ID:', { error: err.message });
        throw err;
    }
};

module.exports = { updateOrder, getOrdergenId, getEOrdergenId ,deleteCart};
