// const logger = require('../config/logger.js'); // Ensure logger is imported
// const client = require("../config/dbConfig");

// const updateeventOrder = async (order_id, payment_id, payment_status) => {
//     const query = `
//         UPDATE event_orders
//         SET paymentid = $1, payment_status = $2
//         WHERE eventorder_generated_id = $3
//         RETURNING *;
//     `;
//   console.log(order_id,payment_id,payment_status)
//     const values = [payment_id, payment_status, order_id];

//     try {
//         const result = await client.query(query, values);
//         logger.info('Event order updated successfully:', { order_id, payment_id, payment_status });
//         console.log("result in model",result)
//         return result.rows[0]; // Return the updated order details
//     } catch (error) {
//         logger.error('Error updating event order:', error);
//         throw error;
//     }
// };

const logger = require('../config/logger.js'); // Ensure logger is imported
const client = require("../config/dbConfig");

const updateeventOrder = async (order_id, payment_id, payment_status) => {
    const query = `
        UPDATE event_orders
        SET paymentid = $1, payment_status = $2
        WHERE eventorder_generated_id = $3
        RETURNING *;
    `;
  console.log(order_id,payment_id,payment_status)
    const values = [payment_id, payment_status, order_id];

    try {
        const result = await client.query(query, values);
        logger.info('Event order updated successfully:', { order_id, payment_id, payment_status });
        console.log("result in model",result)
        return result.rows[0]; // Return the updated order details
    } catch (error) {
        logger.error('Error updating event order:', error);
        throw error;
    }
};

module.exports = { updateeventOrder };
// module.exports = { updateeventOrder };
