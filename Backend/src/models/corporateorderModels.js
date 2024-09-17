// corporateOrderModel.js
const { DB_COMMANDS } = require('../utils/queries.js');
const client = require('../config/dbConfig.js');
const logger = require('../config/logger.js');

const insertCorporateOrderDetails = async (corporateorder_id, details) => {
  const query = DB_COMMANDS.INSERT_CORPORATE_ORDER_DETAILS;
  
  const values = [
    corporateorder_id,
    details.processing_date,
    details.delivery_status,
    details.category_id,
    details.quantity,
    details.active_quantity,
    details.media ? JSON.stringify(details.media) : null,
    JSON.stringify(details.delivery_details)
  ];

  try {
    const result = await client.query(query, values);
    return result.rows[0];
  } catch (error) {
    logger.error('Error inserting corporate order details:', error);
    throw new Error('Error inserting corporate order details: ' + error.message);
  }
};

const getOrderDetailsById = async (corporateorder_id) => {
  const query = DB_COMMANDS.GET_ORDER_DETAILS_BY_ID;
  
  const values = [corporateorder_id];
  
  try {
    const result = await client.query(query, values);
    return result.rows[0]; // Return the first matching row
  } catch (error) {
    logger.error('Error retrieving corporate order details:', error);
    throw new Error('Error retrieving corporate order details: ' + error.message);
  }
};

module.exports = {
  insertCorporateOrderDetails,
  getOrderDetailsById
};
