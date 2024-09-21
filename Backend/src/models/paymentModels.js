const client = require("../config/dbConfig");
const { DB_COMMANDS } = require("../utils/queries");
const logger = require('../config/logger.js');

const updateOrder = async (order_id, payment_id, payment_status) => {
    const query = `
        UPDATE corporate_orders
        SET paymentid = $1, payment_status = $2
        WHERE corporateorder_id = $3
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

const getOrdergenId=async(customer_id)=>{
   try{
    const result= await client.query(DB_COMMANDS.GET_ORDER_GENID,[customer_id]);
        if(result.rows.length === 0){
            logger.error('order not found')
            return null;
        }
        return result.rows[0];
    }catch(err){
        logger.error('Error in querying database',{error:err.message});
        throw err;
    }
  }

module.exports ={updateOrder, getOrdergenId}