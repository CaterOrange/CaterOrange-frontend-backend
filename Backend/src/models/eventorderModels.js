const logger = require('../config/logger.js');
const { DB_COMMANDS} = require('../utils/queries.js');
const client = require('../config/dbConfig.js');



// Insert event order
const insertEventOrder = async (orderData) => {
  const result = await client.query(DB_COMMANDS.INSERT_EVENT_ORDER, [
    orderData.customer_id,
    orderData.ordered_at,
    orderData.delivery_status,
    orderData.total_amount,
    orderData.delivery_details,
    orderData.event_order_details,
    orderData.event_media,
    orderData.customer_address,
    orderData.payment_status,
    orderData.event_order_status
  ]);
  return result.rows[0];
};

const addToCart = async (customer_id, total_amount, cart_order_details, address) => {
  const query = `
    INSERT INTO event_cart (customer_id, total_amount, cart_order_details, address,order_date)
    VALUES ($1, $2, $3, $4,$5)
    RETURNING *;
  `;
  const now = Date.now(); // Current timestamp in milliseconds
const isoString = new Date(now).toISOString(); 
  const values = [customer_id, total_amount, JSON.stringify(cart_order_details), JSON.stringify(address),isoString];

  try {
    const result = await client.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error inserting into event_cart:', error);
    throw error;
  }
};

// Get cart details by customer_id
const getcartbyCustomerId = async (customerId) => {
  const query = `SELECT * FROM event_cart WHERE customer_id = $1;`;
  const values = [customerId];
  const result = await client.query(query, values);
  return result.rows;
};

// Update the cart (e.g., update total amount, cart details)

const updateCart = async (query, values) => {
  try {
    const result = await client.query(query, values);
    return result; // Return the result of the query
  } catch (error) {
    console.error('Error executing update cart query:', error);
    throw error; // Throw error to be caught by the controller
  }
};

// Delete a product from the cart
const deleteCart = async (cartId) => {
  const query = `DELETE FROM event_cart WHERE eventcart_id = $1;`;
  const values = [cartId];
  await client.query(query, values);
};

// Function to fetch all event categories
async function getAllEventCategories() {
  try {
    const { rows } = await client.query(DB_COMMANDS.getEventCategoriesQuery);
    return rows;
  } catch (error) {
    throw new Error('Error fetching event categories');
  }
}
const menuPageMethod = async (Category_name, start, limit) => {
  try {
    const result = await client.query(DB_COMMANDS.eventMenuPageQuery(), [Category_name, limit, start]);
    return result.rows;
  } catch (err) {
    logger.error(`Error in fetching products of Category_name: ${Category_name}`, err);
    throw err; 
  }
}; 

module.exports = {
  insertEventOrder,
  addToCart,
  getcartbyCustomerId,
  updateCart,
  deleteCart,
  getAllEventCategories,
  menuPageMethod
};
