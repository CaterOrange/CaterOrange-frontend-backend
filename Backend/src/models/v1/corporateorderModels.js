// const { DB_COMMANDS } = require('../../utils/queries.js');
// const client = require('../../config/dbConfig.js');
// const logger = require('../../config/logger.js');
// const findCustomerByGid = async (customer_generated_id) => {
//     try {
//         const result = await client.query(DB_COMMANDS.CUSTOMER_SELECT_BY_GID, [customer_generated_id]);
//         if (result.rows.length === 0) {
//             logger.error('No customer found with generated ID:', customer_generated_id);
//             return null;
//         }
//         logger.info('Customer found:', result.rows[0]);
//         return result.rows[0];  // Return the customer details, or undefined if not found
//     } catch (err) {
//         logger.error('Error querying the database for customer_generated_id', { error: err.message });
//         throw err;
//     }
// };
// const add_cart = async (customer_generated_id, cart_order_details, total_amount) => {
//     try {
//         const result = await client.query(
//             DB_COMMANDS.ADD_CORPORATECART, [customer_generated_id, cart_order_details, total_amount]
//         );
//         logger.info('Cart data added successfully for customer ID:', customer_generated_id);
//         return result.rows[0];
//     } catch (err) {
//         logger.error('Error adding cart data in model', { error: err.message });
//         throw err;
//     }
// }
// const getCarts = async (customer_generated_id) => {
//     try {
//         logger.info('Fetching corporate carts for customer ID:',customer_generated_id);
//         const res = await client.query(DB_COMMANDS.GETCARTS, [customer_generated_id]);

//         if (res.rowCount === 0) {
//             logger.info('No carts found for customer ID:', customer_generated_id);
//         } else {
//             logger.info(`Corporate carts fetched successfully: ${res.rowCount} carts for customer ID:`, customer_generated_id);
//         }

//         return res.rows;
//     } catch (err) {
//         logger.error('Error fetching carts:', { error: err.message });
//         throw new Error('Error fetching carts from the database');
//     }
// };
// const updateQuantity = async (corporatecart_id, date, quantity) => {
//     try {
//         logger.info('Updating quantity for cart ID:', corporatecart_id, 'on date:', date, 'to quantity:', quantity);
//         const data = await client.query(DB_COMMANDS.GETPRICE, [corporatecart_id, date]);
//         logger.info('Price data fetched:', data.rows[0]);

//         const price = data.rows[0].price;
//         const total = data.rows[0].total_amount;
//         const quant = data.rows[0].quantity;
//         const balance_amount = total - (price * quant);
//         const total_amount = (price * quantity) + balance_amount;

//         logger.info('New total amount calculated:', total_amount);
//         const res = await client.query(DB_COMMANDS.UPDATEQUANTITY, [corporatecart_id, date, quantity, total_amount]);
//         logger.info('Quantity updated successfully:', res);

//         return res;
//     } catch (err) {
//         logger.error('Error updating quantity:', { error: err.message });
//         throw new Error('Error updating quantity in the database');
//     }
// }
// const deleteCart = async (corporatecart_id, date) => {
//     try {
//         logger.info('Deleting cart item with ID:', corporatecart_id, 'on date:', date);

//         // Step 1: Get the price and quantity for the item to be removed
//         const data = await client.query(DB_COMMANDS.GETPRICE, [corporatecart_id, date]);
//         if (data.rows.length === 0) {
//             throw new Error('Item not found in cart');
//         }

//         const { price, quantity, total_amount } = data.rows[0];
//         const amount = price * quantity;
//         const new_total_amount = total_amount - amount;

//         // Step 2: Update cart_order_details and total_amount
//         await client.query(DB_COMMANDS.DELETECARTITEM, [corporatecart_id, date, new_total_amount]);

//         // Step 3: Check if cart_order_details is empty after the update and delete if necessary
//         const result = await client.query(DB_COMMANDS.DELETECARTROW, [corporatecart_id]);
//         logger.info('Cart item deleted successfully:', result);

//         return result;
//     } catch (err) {
//         logger.error('Error deleting from cart:', { error: err.message });
//         throw new Error('Error deleting from the database');
//     }
// };
// const insertCartToOrder = async (
//     customer_generated_id, 
//     order_details, 
//     total_amount, 
//     paymentid, 
//     customer_address, 
//     payment_status,
//     corporate_order_status
//   ) => {
//     try {
//       logger.info(
//         `Transferring cart to order in model:
//         order_details: ${JSON.stringify(order_details)},
//         customer_generated_id: ${customer_generated_id},
//         total_amount: ${total_amount},
//         paymentid: ${paymentid},
//         customer_address: ${JSON.stringify(customer_address)},
//         payment_status: ${payment_status},
//         corporate_order_status: ${corporate_order_status}`
//       );
  
//       // Start a transaction
//       await client.query('BEGIN');
  
//       // First, insert the main corporate order with empty order_details array
//       const corporateOrderResult = await client.query(
//         `INSERT INTO corporate_orders (
//           customer_generated_id, 
//           order_details,
//           total_amount, 
//           Paymentid, 
//           customer_address, 
//           payment_status,
//           corporate_order_status
//         ) 
//         VALUES ($1, $2, $3, $4, $5, $6, $7) 
//         RETURNING *`,
//         [
//           customer_generated_id,
//           [], // Start with empty array, will update after inserting details
//           total_amount,
//           paymentid,
//           customer_address,
//           payment_status,
//           corporate_order_status
//         ]
//       );
  
//       const corporateOrder = corporateOrderResult.rows[0];
//       const orderDetailIds = [];
  
//       // Insert order details and collect their IDs
//       for (const detail of order_details) {
//         const detailResult = await client.query(
//           `INSERT INTO corporateorder_details (
//             corporateorder_generated_id,
//             category_id,
//             quantity,
//             active_quantity,
//             media,
//             delivery_details
//           )
//           VALUES ($1, $2, $3, $4, $5, $6)
//           RETURNING order_detail_id`,
//           [
//             corporateOrder.corporateorder_generated_id,
//             detail.category_id,
//             detail.quantity,
//             detail.active_quantity,
//             detail.media,
//             detail.delivery_details
//           ]
//         );
//         orderDetailIds.push(detailResult.rows[0].order_detail_id);
//       }
  
//       // Update the corporate_orders table with the collected order_detail_ids
//       await client.query(
//         `UPDATE corporate_orders 
//          SET order_details = $1 
//          WHERE corporateorder_generated_id = $2`,
//         [orderDetailIds, corporateOrder.corporateorder_generated_id]
//       );
  
//       // Get the final updated order
//       const finalOrderResult = await client.query(
//         `SELECT * FROM corporate_orders 
//          WHERE corporateorder_generated_id = $1`,
//         [corporateOrder.corporateorder_generated_id]
//       );
  
//       // Commit the transaction
//       await client.query('COMMIT');
  
//       logger.info('Cart data added to orders table in model:', finalOrderResult.rows[0]);
//       return finalOrderResult.rows[0];
  
//     } catch (err) {
//       // Rollback in case of error
//       await client.query('ROLLBACK');
//       logger.error('Error transferring cart to orders in model', { 
//         error: err.message, 
//         stack: err.stack 
//       });
//       throw err;
//     }
//   };
// const getcategoryname = async (categoryId) => {
//     try {
//         const category_name = await client.query(DB_COMMANDS.GET_CATEGORY_NAME, [categoryId]);
//         logger.info('Category name fetched in model:', category_name);
//         return category_name.rows[0];
//     } catch (err) {
//         logger.error('Error fetching category_name', { error: err.message });
//         throw err;
//     }
// }
   
// const getOrderDetailsById = async (customer_id) => {
//     logger.info(`Fetching order details for customer ID:${customer_id}`);

//     try {
//         const result = await client.query(DB_COMMANDS.FETCH_ORDERS, [customer_id]);
//         logger.info(`All orders fetched:${result.rows} we got nothing`);
//         return result.rows; // Return the first matching row
//     } catch (error) {
//         logger.error('Error retrieving corporate order details:', { error: error.message });
//         throw new Error('Error retrieving corporate order details: ' + error.message);
//     }
// }

// const insertCorporateOrderDetails = async (corporateorder_generated_id, processing_date, delivery_status, category_id, quantity, active_quantity, media, delivery_details) => {
//     logger.info('Inserting corporate order details:', {
//         corporateorder_generated_id,
//         processing_date,
//         delivery_status,
//         category_id,
//         quantity,
//         active_quantity,
//         media,
//         delivery_details
//     });

//     try {
//         const result = await client.query(DB_COMMANDS.INSERT_CORPORATE_ORDER_DETAILS, [corporateorder_generated_id, processing_date, delivery_status, category_id, quantity, active_quantity, media, delivery_details]);
//         logger.info("Successfully inserted corporate order details:", result);
//         return result.rows[0];
//     } catch (err) {
//         logger.error('Error inserting corporate order details:', { error: err.message });
//         throw err;
//     }
// };


// const getCartCountById = async (customer_id) => {
//     try {
//         const result = await client.query(DB_COMMANDS.getCartCountById, [customer_id]);
//         logger.info('Retrieved cart count :', { customer_id, result: result.rows[0] });
//         console.log(result.rows[0].total_quantity)
//         return result.rows[0].total_quantity;
//     } catch (error) {
//         logger.error('Error retrieving cart count:', { error: error.message });
//         throw new Error('Error retrieving cart count: ' + error.message);
//     }
// };
// // const updateOrderDetailsIds = async (corporateOrderId, order_details) => {
// //     logger.info('Updating order details for corporate order:', {
// //         corporateOrderId,
// //         order_details: JSON.stringify(order_details)
// //     });

// //     try {
// //         await client.query('BEGIN');

// //         // Handle case where order_details might be undefined or empty
// //         if (!order_details || (Array.isArray(order_details) && order_details.length === 0)) {
// //             // Just update with empty array if no details provided
// //             const updateResult = await client.query(
// //                 `UPDATE corporate_orders 
// //                  SET order_details = $1 
// //                  WHERE corporateorder_generated_id = $2 
// //                  RETURNING *`,
// //                 [[], corporateOrderId]
// //             );

// //             if (updateResult.rowCount === 0) {
// //                 throw new Error(`Corporate order with ID ${corporateOrderId} not found`);
// //             }

// //             await client.query('COMMIT');
// //             logger.info('Order details cleared successfully:', updateResult.rows[0]);
// //             return updateResult.rows[0];
// //         }

// //         // Extract just the IDs if order_details is an array of objects
// //         let orderDetailIds = Array.isArray(order_details) 
// //             ? order_details.map(detail => typeof detail === 'object' && detail.order_detail_id ? 
// //                 detail.order_detail_id : detail)
// //             : order_details;

// //         // Ensure we have an array of IDs
// //         if (!Array.isArray(orderDetailIds)) {
// //             orderDetailIds = [orderDetailIds];
// //         }

// //         // Filter out any undefined or null values
// //         orderDetailIds = orderDetailIds.filter(id => id !== undefined && id !== null);

// //         if (orderDetailIds.length === 0) {
// //             // If after filtering we have no valid IDs, just set an empty array
// //             const updateResult = await client.query(
// //                 `UPDATE corporate_orders 
// //                  SET order_details = $1 
// //                  WHERE corporateorder_generated_id = $2 
// //                  RETURNING *`,
// //                 [[], corporateOrderId]
// //             );

// //             if (updateResult.rowCount === 0) {
// //                 throw new Error(`Corporate order with ID ${corporateOrderId} not found`);
// //             }

// //             await client.query('COMMIT');
// //             logger.info('Order details cleared successfully:', updateResult.rows[0]);
// //             return updateResult.rows[0];
// //         }

// //         // First check if the corporate order exists
// //         const orderExists = await client.query(
// //             `SELECT corporateorder_generated_id FROM corporate_orders 
// //              WHERE corporateorder_generated_id = $1`,
// //             [corporateOrderId]
// //         );

// //         if (orderExists.rowCount === 0) {
// //             throw new Error(`Corporate order with ID ${corporateOrderId} not found`);
// //         }

// //         // Check which order detail IDs actually exist for this order
// //         const existingDetailIds = await client.query(
// //             `SELECT order_detail_id FROM corporateorder_details 
// //              WHERE corporateorder_generated_id = $1 
// //              AND order_detail_id = ANY($2::int[])`,
// //             [corporateOrderId, orderDetailIds]
// //         );

// //         const validDetailIds = existingDetailIds.rows.map(row => row.order_detail_id);
        
// //         // Log which IDs were invalid for debugging
// //         const invalidIds = orderDetailIds.filter(id => !validDetailIds.includes(id));
// //         if (invalidIds.length > 0) {
// //             logger.warn('Invalid order detail IDs:', {
// //                 corporateOrderId,
// //                 invalidIds
// //             });
// //         }

// //         // Update the corporate order with only valid order detail IDs
// //         const updateResult = await client.query(
// //             `UPDATE corporate_orders 
// //              SET order_details = $1 
// //              WHERE corporateorder_generated_id = $2 
// //              RETURNING *`,
// //             [validDetailIds, corporateOrderId]
// //         );

// //         await client.query('COMMIT');
// //         logger.info('Order details updated successfully:', updateResult.rows[0]);
// //         return updateResult.rows[0];

// //     } catch (err) {
// //         await client.query('ROLLBACK');
// //         logger.error('Error updating order details:', { 
// //             error: err.message,
// //             stack: err.stack 
// //         });
// //         throw err;
// //     }
// // };
// const updateOrderDetailsIds = async (corporateOrderId) => {
//     logger.info('Updating order details for corporate order:', {
//         corporateOrderId
//     });

//     try {
//         await client.query('BEGIN');

//         // First check if the corporate order exists
//         const orderExists = await client.query(
//             `SELECT corporateorder_generated_id FROM corporate_orders 
//              WHERE corporateorder_generated_id = $1`,
//             [corporateOrderId]
//         );

//         if (orderExists.rowCount === 0) {
//             throw new Error(`Corporate order with ID ${corporateOrderId} not found`);
//         }

//         // Fetch all order detail IDs for this corporate order
//         const detailIdsResult = await client.query(
//             `SELECT order_detail_id FROM corporateorder_details 
//              WHERE corporateorder_generated_id = $1
//              ORDER BY order_detail_id`,
//             [corporateOrderId]
//         );

//         const orderDetailIds = detailIdsResult.rows.map(row => row.order_detail_id);
        
//         logger.info('Found order detail IDs:', {
//             corporateOrderId,
//             orderDetailIds
//         });

//         // Update the corporate order with all associated order detail IDs
//         const updateResult = await client.query(
//             `UPDATE corporate_orders 
//              SET order_details = $1 
//              WHERE corporateorder_generated_id = $2 
//              RETURNING *`,
//             [orderDetailIds, corporateOrderId]
//         );

//         await client.query('COMMIT');
//         logger.info('Order details updated successfully:', updateResult.rows[0]);
//         return updateResult.rows[0];

//     } catch (err) {
//         await client.query('ROLLBACK');
//         logger.error('Error updating order details:', { 
//             error: err.message,
//             stack: err.stack 
//         });
//         throw err;
//     }
// };

// module.exports = {
//     updateOrderDetailsIds,
//     insertCartToOrder,
//     getcategoryname,
//     insertCorporateOrderDetails,
//     getOrderDetailsById,
//     deleteCart,
//     updateQuantity,
//     getCarts,
//     add_cart,
//     findCustomerByGid,
//     getCartCountById
// };

const { DB_COMMANDS } = require('../../utils/queries.js');
const client = require('../../config/dbConfig.js');
const logger = require('../../config/logger.js');
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
const insertCartToOrder = async (
    customer_generated_id, 
    order_details, 
    total_amount, 
    paymentid, 
    customer_address, 
    payment_status,
    corporate_order_status
  ) => {
    try {
      logger.info(
        `Transferring cart to order in model:
        order_details: ${JSON.stringify(order_details)},
        customer_generated_id: ${customer_generated_id},
        total_amount: ${total_amount},
        paymentid: ${paymentid},
        customer_address: ${JSON.stringify(customer_address)},
        payment_status: ${payment_status},
        corporate_order_status: ${corporate_order_status}`
      );
  
      // Start a transaction
      await client.query('BEGIN');
  
      // First, insert the main corporate order with empty order_details array
      const corporateOrderResult = await client.query(
        `INSERT INTO corporate_orders (
          customer_generated_id, 
          order_details,
          total_amount, 
          Paymentid, 
          customer_address, 
          payment_status,
          corporate_order_status
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *`,
        [
          customer_generated_id,
          [], // Start with empty array, will update after inserting details
          total_amount,
          paymentid,
          customer_address,
          payment_status,
          corporate_order_status
        ]
      );
  
      const corporateOrder = corporateOrderResult.rows[0];
      const orderDetailIds = [];
  
      // Insert order details and collect their IDs
      for (const detail of order_details) {
        const detailResult = await client.query(
          `INSERT INTO corporateorder_details (
            corporateorder_generated_id,
            category_id,
            quantity,
            active_quantity,
            media,
            delivery_details
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING order_detail_id`,
          [
            corporateOrder.corporateorder_generated_id,
            detail.category_id,
            detail.quantity,
            detail.active_quantity,
            detail.media,
            detail.delivery_details
          ]
        );
        orderDetailIds.push(detailResult.rows[0].order_detail_id);
      }
  
      // Update the corporate_orders table with the collected order_detail_ids
      await client.query(
        `UPDATE corporate_orders 
         SET order_details = $1 
         WHERE corporateorder_generated_id = $2`,
        [orderDetailIds, corporateOrder.corporateorder_generated_id]
      );
  
      // Get the final updated order
      const finalOrderResult = await client.query(
        `SELECT * FROM corporate_orders 
         WHERE corporateorder_generated_id = $1`,
        [corporateOrder.corporateorder_generated_id]
      );
  
      // Commit the transaction
      await client.query('COMMIT');
  
      logger.info('Cart data added to orders table in model:', finalOrderResult.rows[0]);
      return finalOrderResult.rows[0];
  
    } catch (err) {
      // Rollback in case of error
      await client.query('ROLLBACK');
      logger.error('Error transferring cart to orders in model', { 
        error: err.message, 
        stack: err.stack 
      });
      throw err;
    }
  };
  const getcategoryname = async (categoryId) => {
    try {
      console.log('Querying for category ID:', categoryId);
      const category_name = await client.query(DB_COMMANDS.GET_CATEGORY_NAME, [categoryId]);
      console.log('Query result:', category_name);
      
      if (category_name.rows && category_name.rows.length > 0) {
        return category_name.rows[0];
      } else {
        console.log('No category found with ID:', categoryId);
        return null;
      }
    } catch (err) {
      console.error('Error fetching category_name', err);
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

const insertCorporateOrderDetails = async (corporateorder_generated_id, processing_date, delivery_status, category_id, quantity, active_quantity, media, delivery_details) => {
    logger.info('Inserting corporate order details:', {
        corporateorder_generated_id,
        processing_date,
        delivery_status,
        category_id,
        quantity,
        active_quantity,
        media,
        delivery_details
    });

    try {
        const result = await client.query(DB_COMMANDS.INSERT_CORPORATE_ORDER_DETAILS, [corporateorder_generated_id, processing_date, delivery_status, category_id, quantity, active_quantity, media, delivery_details]);
        logger.info("Successfully inserted corporate order details:", result);
        return result.rows[0];
    } catch (err) {
        logger.error('Error inserting corporate order details:', { error: err.message });
        throw err;
    }
};

const updateCorporateOrderDetails = async (corporateorder_generated_id, processing_date, delivery_status, category_id, quantity, active_quantity, media, delivery_details) => {
    logger.info('Updating corporate order details:', {
        corporateorder_generated_id,
        processing_date,
        delivery_status,
        category_id,
        quantity,
        active_quantity,
        media,
        delivery_details
    });

    try {
        const result = await client.query(DB_COMMANDS.UPDATE_CORPORATE_ORDER_DETAILS, [processing_date, delivery_status, category_id, quantity, active_quantity, media, delivery_details, corporateorder_generated_id]);
        logger.info("Successfully updated corporate order details:", result);
        
        if (result.rowCount === 0) {
            throw new Error('No record found with the provided ID');
        }
        
        return result.rows[0];
    } catch (err) {
        logger.error('Error updating corporate order details:', { error: err.message });
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
// const updateOrderDetailsIds = async (corporateOrderId, order_details) => {
//     logger.info('Updating order details for corporate order:', {
//         corporateOrderId,
//         order_details: JSON.stringify(order_details)
//     });

//     try {
//         await client.query('BEGIN');

//         // Handle case where order_details might be undefined or empty
//         if (!order_details || (Array.isArray(order_details) && order_details.length === 0)) {
//             // Just update with empty array if no details provided
//             const updateResult = await client.query(
//                 `UPDATE corporate_orders 
//                  SET order_details = $1 
//                  WHERE corporateorder_generated_id = $2 
//                  RETURNING *`,
//                 [[], corporateOrderId]
//             );

//             if (updateResult.rowCount === 0) {
//                 throw new Error(`Corporate order with ID ${corporateOrderId} not found`);
//             }

//             await client.query('COMMIT');
//             logger.info('Order details cleared successfully:', updateResult.rows[0]);
//             return updateResult.rows[0];
//         }

//         // Extract just the IDs if order_details is an array of objects
//         let orderDetailIds = Array.isArray(order_details) 
//             ? order_details.map(detail => typeof detail === 'object' && detail.order_detail_id ? 
//                 detail.order_detail_id : detail)
//             : order_details;

//         // Ensure we have an array of IDs
//         if (!Array.isArray(orderDetailIds)) {
//             orderDetailIds = [orderDetailIds];
//         }

//         // Filter out any undefined or null values
//         orderDetailIds = orderDetailIds.filter(id => id !== undefined && id !== null);

//         if (orderDetailIds.length === 0) {
//             // If after filtering we have no valid IDs, just set an empty array
//             const updateResult = await client.query(
//                 `UPDATE corporate_orders 
//                  SET order_details = $1 
//                  WHERE corporateorder_generated_id = $2 
//                  RETURNING *`,
//                 [[], corporateOrderId]
//             );

//             if (updateResult.rowCount === 0) {
//                 throw new Error(`Corporate order with ID ${corporateOrderId} not found`);
//             }

//             await client.query('COMMIT');
//             logger.info('Order details cleared successfully:', updateResult.rows[0]);
//             return updateResult.rows[0];
//         }

//         // First check if the corporate order exists
//         const orderExists = await client.query(
//             `SELECT corporateorder_generated_id FROM corporate_orders 
//              WHERE corporateorder_generated_id = $1`,
//             [corporateOrderId]
//         );

//         if (orderExists.rowCount === 0) {
//             throw new Error(`Corporate order with ID ${corporateOrderId} not found`);
//         }

//         // Check which order detail IDs actually exist for this order
//         const existingDetailIds = await client.query(
//             `SELECT order_detail_id FROM corporateorder_details 
//              WHERE corporateorder_generated_id = $1 
//              AND order_detail_id = ANY($2::int[])`,
//             [corporateOrderId, orderDetailIds]
//         );

//         const validDetailIds = existingDetailIds.rows.map(row => row.order_detail_id);
        
//         // Log which IDs were invalid for debugging
//         const invalidIds = orderDetailIds.filter(id => !validDetailIds.includes(id));
//         if (invalidIds.length > 0) {
//             logger.warn('Invalid order detail IDs:', {
//                 corporateOrderId,
//                 invalidIds
//             });
//         }

//         // Update the corporate order with only valid order detail IDs
//         const updateResult = await client.query(
//             `UPDATE corporate_orders 
//              SET order_details = $1 
//              WHERE corporateorder_generated_id = $2 
//              RETURNING *`,
//             [validDetailIds, corporateOrderId]
//         );

//         await client.query('COMMIT');
//         logger.info('Order details updated successfully:', updateResult.rows[0]);
//         return updateResult.rows[0];

//     } catch (err) {
//         await client.query('ROLLBACK');
//         logger.error('Error updating order details:', { 
//             error: err.message,
//             stack: err.stack 
//         });
//         throw err;
//     }
// };
const updateOrderDetailsIds = async (corporateOrderId) => {
    logger.info('Updating order details for corporate order:', {
        corporateOrderId
    });

    try {
        await client.query('BEGIN');

        // First check if the corporate order exists
        const orderExists = await client.query(
            `SELECT corporateorder_generated_id FROM corporate_orders 
             WHERE corporateorder_generated_id = $1`,
            [corporateOrderId]
        );

        if (orderExists.rowCount === 0) {
            throw new Error(`Corporate order with ID ${corporateOrderId} not found`);
        }

        // Fetch all order detail IDs for this corporate order
        const detailIdsResult = await client.query(
            `SELECT order_detail_id FROM corporateorder_details 
             WHERE corporateorder_generated_id = $1
             ORDER BY order_detail_id`,
            [corporateOrderId]
        );

        const orderDetailIds = detailIdsResult.rows.map(row => row.order_detail_id);
        
        logger.info('Found order detail IDs:', {
            corporateOrderId,
            orderDetailIds
        });

        // Update the corporate order with all associated order detail IDs
        const updateResult = await client.query(
            `UPDATE corporate_orders 
             SET order_details = $1 
             WHERE corporateorder_generated_id = $2 
             RETURNING *`,
            [orderDetailIds, corporateOrderId]
        );

        await client.query('COMMIT');
        logger.info('Order details updated successfully:', updateResult.rows[0]);
        return updateResult.rows[0];

    } catch (err) {
        await client.query('ROLLBACK');
        logger.error('Error updating order details:', { 
            error: err.message,
            stack: err.stack 
        });
        throw err;
    }
};

module.exports = {
    updateOrderDetailsIds,
    insertCartToOrder,
    getcategoryname,
    insertCorporateOrderDetails,
    getOrderDetailsById,
    deleteCart,
    updateQuantity,
    getCarts,
    add_cart,
    findCustomerByGid,
    getCartCountById,
    updateCorporateOrderDetails
};
