const logger = require('../config/logger.js');
const { DB_COMMANDS } = require('../utils/queries.js');
const client = require('../config/dbConfig.js');

const getAllProductCategories = async () => {
    try {
        const result = await client.query(`SELECT * FROM event_products`);
        logger.info('Fetched all product categories');
        return result.rows;
    } catch (error) {
        logger.error('Error fetching event products:', error);
        throw new Error('Error fetching event products');
    }
};

const getCartItems = async (customer_id) => {
    try {
        const query = 'SELECT * FROM event_cart WHERE customer_id = $1';
        const result = await client.query(query, [customer_id]);
        logger.info('Fetched cart items for customer:', { customer_id });
        return result.rows;
    } catch (error) {
        logger.error('Error in getCartItems:', error);
        throw new Error('Error fetching event cart items');
    }
};

const addCart = async (customer_id, total_amount, cart_order_details, address, number_of_plates, processing_date, processing_time) => {
    try {
        let cartId;
        const existingCartQuery = `
            SELECT eventcart_id
            FROM event_cart
            WHERE customer_id = $1
        `;
        const existingCartResult = await client.query(existingCartQuery, [customer_id]);

        if (existingCartResult.rows.length > 0) {
            const row = existingCartResult.rows[0];
            const updateQuery = `
                UPDATE event_cart
                SET cart_order_details = $1, total_amount = $2, address = $3
                WHERE eventcart_id = $4
                RETURNING eventcart_id;
            `;
            const updateValues = [
                JSON.stringify(cart_order_details),
                total_amount,
                JSON.stringify(address),
                row.eventcart_id
            ];
            const updateResult = await client.query(updateQuery, updateValues);
            cartId = updateResult.rows[0].eventcart_id;
            logger.info('Cart updated successfully:', { cartId, customer_id });
        } else {
            const insertQuery = `
                INSERT INTO event_cart (customer_id, total_amount, cart_order_details, address, number_of_plates, processing_date, processing_time)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING eventcart_id;
            `;
            const insertValues = [
                customer_id,
                total_amount,
                JSON.stringify(cart_order_details),
                JSON.stringify(address),
                number_of_plates,
                processing_date,
                processing_time
            ];
            const insertResult = await client.query(insertQuery, insertValues);
            cartId = insertResult.rows[0].eventcart_id;
            logger.info('New cart created successfully:', { cartId, customer_id });
        }

        return {
            message: 'Cart updated successfully',
            cart_id: cartId
        };
    } catch (error) {
        logger.error('Error inserting/updating event_cart:', error);
        throw error;
    }
};


const getEventOrderDetailsById = async (customer_id) => {
    const query = DB_COMMANDS.GET_EVENTORDER_DETAILS_BY_ID;
    // const payment_status= 'Success';
    const values = [customer_id];
    const customer_generated_id= values;
    console.log('new id',customer_generated_id)
   
    console.log('id', customer_id)
    try {
        const result = await client.query(query, values);
        logger.info('Retrieved event order details for customer:', { customer_generated_id });
        console.log("order details",result.rows)
        return result.rows;
    } catch (error) {
        logger.error('Error retrieving event order details:', error);
        throw new Error('Error retrieving event order details:' + error.message);
    }
};

const insertEventOrder = async (orderData) => {
    try {
        const cartOrderDetailsJson = JSON.stringify(orderData.cart_order_details);
        const customerAddressJson = JSON.stringify(orderData.customer_address);
        logger.info("cart_order_details JSON: ", cartOrderDetailsJson);
        logger.info("customer_address JSON: ", customerAddressJson);
        const result = await client.query(DB_COMMANDS.INSERT_EVENT_ORDER, [
            orderData.customer_id,
            orderData.delivery_status,
            orderData.amount,
            orderData.delivery_details || null,
            cartOrderDetailsJson,
            orderData.event_media || null,
            customerAddressJson,
            orderData.payment_status,
            orderData.event_order_status,
            orderData.number_of_plates,
            orderData.processing_date
        ]);

        logger.info('Event order inserted successfully:', { orderData });
        return result.rows[0];
    } catch (error) {
        logger.error("Error transferring cart to order:", error);
        throw error;
    }
};

const getCartById = async (eventcart_id) => {
    const query = `SELECT * FROM event_cart WHERE eventcart_id = $1;`;
    const values = [eventcart_id];
    try {
        const result = await client.query(query, values);
        logger.info('Fetched cart by ID:', { eventcart_id });
        return result.rows;
    } catch (error) {
        logger.error('Error fetching cart by ID:', error);
        throw new Error('Error fetching cart by ID:' + error.message);
    }
};

const deleteCart = async (eventcart_id) => {
    const query = `DELETE FROM event_cart WHERE eventcart_id = $1;`; // Using $1 for parameterized query
    const values = [eventcart_id];

    try {
        await client.query(query, values);
        logger.info('Cart deleted:', { eventcart_id });
    } catch (error) {
        logger.error('Error deleting cart:', error);
        throw new Error('Error deleting cart: ' + error.message);
    }
};

module.exports = {
    getAllProductCategories,
    addCart,
    // getOrderDetailsById,
    insertEventOrder,
    getCartById,
    deleteCart,
    getCartItems,
    getEventOrderDetailsById
};
