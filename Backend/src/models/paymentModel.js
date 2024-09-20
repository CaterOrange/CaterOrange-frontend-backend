const client = require("../config/dbconfig");

const updateOrder = async (order_id, payment_id, payment_status) => {
    const query = `
        UPDATE event_orders
        SET paymentid = $1, payment_status = $2
        WHERE eventorder_id = $3
        RETURNING *;
    `;

    const values = [payment_id, payment_status, order_id];

    try {
        const result = await client.query(query, values);
        return result;
    } catch (error) {
        console.error('Error updating corporate order:', error);
        throw error;
    }
};
module.exports ={updateOrder}