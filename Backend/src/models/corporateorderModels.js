// corporateOrderModel.js
const { DB_COMMANDS } = require('../utils/queries.js');
const client = require('../config/dbConfig.js');
const logger = require('../config/logger.js');

const findCustomerByGid = async (customer_generated_id) => {
    try {
        const result = await client.query(DB_COMMANDS.CUSTOMER_SELECT_BY_GID, [customer_generated_id]);
        if (result.rows.length === 0) {
            logger.error('No customer found with generated ID:', customer_generated_id);
            return null;
        }
        logger.info('Customer found:', result.rows[0]);
        return result.rows[0];  // Return the customer details, or undefined if not found
    } catch (err) {
        logger.error('Error querying the database for customer_generated_id', { error: err.message });
        throw err;
    }
};

const add_cart = async (customer_generated_id, cart_order_details, total_amount) => {
    try {
        const result = await client.query(
            DB_COMMANDS.ADD_CORPORATECART, [customer_generated_id, cart_order_details, total_amount]
        );
        logger.info('Cart data added successfully for customer ID:', customer_generated_id);
        return result.rows[0];
    } catch (err) {
        logger.error('Error adding cart data in model', { error: err.message });
        throw err;
    }
}

const getCarts = async (customer_generated_id) => {
    try {
        logger.info('Fetching corporate carts for customer ID:',customer_generated_id);
        const res = await client.query(DB_COMMANDS.GETCARTS, [customer_generated_id]);

        if (res.rowCount === 0) {
            logger.info('No carts found for customer ID:', customer_generated_id);
        } else {
            logger.info(`Corporate carts fetched successfully: ${res.rowCount} carts for customer ID:`, customer_generated_id);
        }

        return res.rows;
    } catch (err) {
        logger.error('Error fetching carts:', { error: err.message });
        throw new Error('Error fetching carts from the database');
    }
};

const updateQuantity = async (corporatecart_id, date, quantity) => {
    try {
        logger.info('Updating quantity for cart ID:', corporatecart_id, 'on date:', date, 'to quantity:', quantity);
        const data = await client.query(DB_COMMANDS.GETPRICE, [corporatecart_id, date]);
        logger.info('Price data fetched:', data.rows[0]);

        const price = data.rows[0].price;
        const total = data.rows[0].total_amount;
        const quant = data.rows[0].quantity;
        const balance_amount = total - (price * quant);
        const total_amount = (price * quantity) + balance_amount;

        logger.info('New total amount calculated:', total_amount);
        const res = await client.query(DB_COMMANDS.UPDATEQUANTITY, [corporatecart_id, date, quantity, total_amount]);
        logger.info('Quantity updated successfully:', res);

        return res;
    } catch (err) {
        logger.error('Error updating quantity:', { error: err.message });
        throw new Error('Error updating quantity in the database');
    }
}

const deleteCart = async (corporatecart_id, date) => {
    try {
        logger.info('Deleting cart item with ID:', corporatecart_id, 'on date:', date);

        // Step 1: Get the price and quantity for the item to be removed
        const data = await client.query(DB_COMMANDS.GETPRICE, [corporatecart_id, date]);
        if (data.rows.length === 0) {
            throw new Error('Item not found in cart');
        }

        const { price, quantity, total_amount } = data.rows[0];
        const amount = price * quantity;
        const new_total_amount = total_amount - amount;

        // Step 2: Update cart_order_details and total_amount
        await client.query(DB_COMMANDS.DELETECARTITEM, [corporatecart_id, date, new_total_amount]);

        // Step 3: Check if cart_order_details is empty after the update and delete if necessary
        const result = await client.query(DB_COMMANDS.DELETECARTROW, [corporatecart_id]);
        logger.info('Cart item deleted successfully:', result);

        return result;
    } catch (err) {
        logger.error('Error deleting from cart:', { error: err.message });
        throw new Error('Error deleting from the database');
    }
};

const insertCartToOrder = async (customer_generated_id, order_details, total_amount, paymentid, customer_address, payment_status) => {
    try {
        logger.info(`Transferring cart to order in model:${order_details},
            ${customer_generated_id},
            ${total_amount},
            ${paymentid},
           ${customer_address},
            ${payment_status}`
        );
        console.log(order_details,customer_generated_id,total_amount,paymentid,customer_address,payment_status);
        const result = await client.query(
            DB_COMMANDS.INSERT_CART_TO_ORDER,
            [customer_generated_id, JSON.stringify(order_details), total_amount, paymentid, customer_address, payment_status]
        );

        logger.info('Cart data added to orders table in model:', result);
        return result.rows[0]; // Return the inserted row
    } catch (err) {
        logger.error('Error transferring cart to orders in model', { error: err.message, stack: err.stack });
        throw err; // Optionally re-throw the error for further handling
    }
};

const getcategoryname = async (categoryId) => {
    try {
        const category_name = await client.query(DB_COMMANDS.GET_CATEGORY_NAME, [categoryId]);
        logger.info('Category name fetched in model:', category_name);
        return category_name.rows[0];
    } catch (err) {
        logger.error('Error fetching category_name', { error: err.message });
        throw err;
    }
}

const getOrderDetailsById = async (customer_id) => {
    logger.info(`Fetching order details for customer ID:${customer_id}`);

    try {
        const result = await client.query(DB_COMMANDS.FETCH_ORDERS, [customer_id]);
        logger.info(`All orders fetched:${result.rows} we got nothing`);
        return result.rows; // Return the first matching row
    } catch (error) {
        logger.error('Error retrieving corporate order details:', { error: error.message });
        throw new Error('Error retrieving corporate order details: ' + error.message);
    }
}

const insertCorporateOrderDetails = async (corporateorder_id, processing_date, delivery_status, category_id, quantity, active_quantity, media, delivery_details) => {
    logger.info('Inserting corporate order details:', {
        corporateorder_id,
        processing_date,
        delivery_status,
        category_id,
        quantity,
        active_quantity,
        media,
        delivery_details
    });

    try {
        const result = await client.query(DB_COMMANDS.INSERT_CORPORATE_ORDER_DETAILS, [corporateorder_id, processing_date, delivery_status, category_id, quantity, active_quantity, media, delivery_details]);
        logger.info("Successfully inserted corporate order details:", result);
        return result.rows[0];
    } catch (err) {
        logger.error('Error inserting corporate order details:', { error: err.message });
        throw err;
    }
};


const getCartCountById = async (customer_id) => {
    try {
        const result = await client.query(DB_COMMANDS.getCartCountById, [customer_id]);
        logger.info('Retrieved cart count :', { customer_id, result: result.rows[0] });
        console.log(result.rows[0].total_quantity)
        return result.rows[0].total_quantity;
    } catch (error) {
        logger.error('Error retrieving cart count:', { error: error.message });
        throw new Error('Error retrieving cart count: ' + error.message);
    }
};


module.exports = {
    insertCartToOrder,
    getcategoryname,
    insertCorporateOrderDetails,
    getOrderDetailsById,
    deleteCart,
    updateQuantity,
    getCarts,
    add_cart,
    findCustomerByGid,
    getCartCountById
};
