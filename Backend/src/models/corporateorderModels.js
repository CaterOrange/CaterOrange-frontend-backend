// corporateOrderModel.js
const { DB_COMMANDS } = require('../utils/queries.js');
const client = require('../config/dbConfig.js');
const logger = require('../config/logger.js');


const findCustomerByGid = async (customer_generated_id) => {
  try {
      const result = await client.query(DB_COMMANDS.CUSTOMER_SELECT_BY_GID, [customer_generated_id]);
      if (result.rows.length === 0) {
          logger.error('No customer found with email:', customer_generated_id);
          return null;
      }
      console.log('result[',result.rows)
      return result.rows[0];  // Return the customer details, or undefined if not found
  } catch (err) {
      logger.error('Error querying the database for customer_generated_id', { error: err.message });
      throw err;
  }
};

const add_cart = async (customer_id, cart_order_details, total_amount) =>{
  try{
     const result = await client.query(
  DB_COMMANDS.ADD_CORPORATECART,[customer_id, cart_order_details, total_amount ])
  logger.info('cart data added successfully');
  return result.rows[0];
} catch (err) {
  logger.error('Error adding cart data in model', { error: err.message });
  throw err;
}
}

const getCarts = async ( customer_id ) => {
  try {
      logger.info('Fetching corporate carts...');
      const res = await client.query(DB_COMMANDS.GETCARTS,[customer_id]);
      
      if (res.rowCount === 0) {
          logger.info('No carts found');
      } else {
          logger.info(`Corporate carts fetched successfully: ${res.rowCount} carts`);
      }

      return res.rows;
  } catch (err) {
      logger.error('Error fetching carts:', err);
      throw new Error('Error fetching carts from the database');
  }
};
const updateQuantity=async(corporatecart_id,date,quantity) =>{
  try {
      logger.info('adding update quantity.',{corporatecart_id,date,quantity});
      const data=await client.query(DB_COMMANDS.GETPRICE,[corporatecart_id,date])
      console.log('price',data.rows[0])
      const price=data.rows[0].price
      const total=data.rows[0].total_amount
      const quant=data.rows[0].quantity
      const balance_amount=total-(price*quant)
      const total_amount=(price*quantity)+balance_amount
      console.log('amount',total_amount)
      const res = await client.query(DB_COMMANDS.UPDATEQUANTITY,[corporatecart_id,date,quantity,total_amount]);
      console.log('in updatequary',res)
     

      return res;
  } catch (err) {
      logger.error('Error fetching carts:', err);
      throw new Error('Error fetching carts from the database');
  }
}
const deleteCart = async (corporatecart_id, date) => {
  try {
      logger.info('Delete quantity.', { corporatecart_id, date });

      // Step 1: Get the price and quantity for the item to be removed
      const data = await client.query(DB_COMMANDS.GETPRICE, [corporatecart_id, date]);
      if (data.rows.length === 0) {
          throw new Error('Item not found in cart');
      }

      const { price, quantity, total_amount } = data.rows[0];
      const amount = price * quantity;
      console.log(amount)
      const new_total_amount = total_amount - amount;
      console.log(new_total_amount)

      // Step 2: Update cart_order_details and total_amount
      await client.query(DB_COMMANDS.DELETECARTITEM, [corporatecart_id, date, new_total_amount]);

      // Step 3: Check if cart_order_details is empty after the update and delete if necessary
      const result = await client.query(DB_COMMANDS.DELETECARTROW, [corporatecart_id]);

      console.log('DELETE SUCCESS', result);

      return result;
  } catch (err) {
      logger.error('Error deleting from cart:', err);
      throw new Error('Error deleting from the database');
  }
};

const insertCartToOrder = async(customer_generated_id, order_details, total_amount, paymentid, customer_address, payment_status) => {
  try {
      console.log('Transfer cart to order in model', {
          order_details,
          customer_generated_id,
          total_amount,
          paymentid,
          customer_address,
          payment_status
      });

      // Convert order details to JSON string if it's not already
      //const orderDetailsJSON = JSON.stringify(order_details);
  
      const result = await client.query(
          DB_COMMANDS.INSERT_CART_TO_ORDER,
          [ customer_generated_id, order_details, total_amount, paymentid, customer_address, payment_status]
      );

      logger.info('Cart Data added to orders table in model', result);
      return result.rows[0]; // Return the inserted row
  } catch (err) {
      logger.error('Error transferring cart to orders in model', { error: err.message, stack: err.stack });
      throw err; // Optionally re-throw the error for further handling
  }
};


const getcategoryname= async(categoryId)=>{
  try{
      const category_name= await client.query(DB_COMMANDS.GET_CATEGORY_NAME,[categoryId]);
      
      logger.info('category name fetched in model', category_name);
      return category_name.rows[0];
  }catch (err) {
      logger.error('Error fetching category_name', { error: err.message});
      throw err;
  }
}

const getOrderDetailsById = async (customer_id) => {
  console.log("in model",customer_id)
  
  try {
    const result = await client.query(DB_COMMANDS.FETCH_ORDERS,[customer_id]);
    logger.info("all orders:",result.rows)
    return result.rows; // Return the first matching row
  } catch (error) {
    throw new Error('Error retrieving corporate order details: ' + error.message);
  }
}

const insertCorporateOrderDetails = async (corporateorder_id, processing_date,delivery_status,category_id,quantity,active_quantity,media, delivery_details ) => {
  console.log('in model')
  const result = await client.query(DB_COMMANDS.INSERT_CORPORATE_ORDER_DETAILS,[corporateorder_id, processing_date,delivery_status,category_id,quantity,active_quantity,media, delivery_details ]);
  console.log("success in model",result)
  return result.rows[0];
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
  findCustomerByGid
};
