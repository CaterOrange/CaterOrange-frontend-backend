const logger = require('../../config/logger');
const client = require('../../config/dbConfig.js');

const getCorporateOrderDetails = async (corporateOrderGeneratedId, categoryId) => {
    try {
        const result = await client.query(
            'SELECT * FROM corporateorder_details WHERE corporateorder_generated_id = $1 AND category_id = $2',
            [corporateOrderGeneratedId, categoryId]
        );
        
        return result.rows[0] || null;

    } catch (error) {
        logger.error(`Error in getCorporateOrderDetails: ${error.message}`);
        throw error;
    }
};

const updateCorporateOrderMedia = async (corporateOrderGeneratedId, categoryId, mediaJson) => {
    try {
        const result = await client.query(
            'UPDATE corporateorder_details SET media = $1 WHERE category_id = $2 AND corporateorder_generated_id = $3 RETURNING *',
            [mediaJson, categoryId, corporateOrderGeneratedId]
        );
        
        return result.rows[0] || null;
    } catch (error) {
        logger.error(`Error in updateCorporateOrderMedia: ${error.message}`);
        throw error;
    }
};

const getCorporateOrderWithCustomerDetails = async (corporateOrderGeneratedId) => {
    try {
        const query = `
            SELECT 
                co.*,
                c.customer_name,
                c.customer_phonenumber
            FROM corporate_orders co
            JOIN customer c ON co.customer_generated_id = c.customer_generated_id
            WHERE co.corporateorder_generated_id = $1
        `;
        
        const result = await client.query(query, [corporateOrderGeneratedId]);
        
        return result.rows[0] || null;
    } catch (error) {
        logger.error(`Error in getCorporateOrderWithCustomerDetails: ${error.message}`);
        throw error;
    }
};

const getTodayCorporateOrders = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log("Today's Date:", today);

    const result = await client.query(`
      SELECT 
        co.corporateorder_id, 
        co.corporateorder_generated_id,
        co.customer_generated_id,
        co.order_details,
        co.total_amount,
        co.paymentid,
        co.customer_address,
        co.ordered_at,
        co.payment_status,
        co.corporate_order_status,
        
        a.address_id,
        a.tag as address_tag,
        a.pincode,
        a.line1,
        a.line2,
        a.location,
        a.ship_to_name,
        a.ship_to_phone_number,

        cod.order_detail_id,
        cod.processing_date,
        cod.delivery_status,
        cod.category_id,
        cod.quantity,
        cod.active_quantity,
        cod.media,
        cod.delivery_details,
        cod.addedat,

        cc.category_name
      FROM corporate_orders co 
      JOIN address a ON co.customer_generated_id = a.customer_id
      LEFT JOIN corporateorder_details cod ON co.corporateorder_generated_id = cod.corporateorder_generated_id
      LEFT JOIN corporate_category cc ON cod.category_id = cc.category_id
      WHERE cod.processing_date = $1
      ORDER BY co.ordered_at DESC
    `, [today]);

    const orderMap = {};

    result.rows.forEach(row => {
      const orderId = row.corporateorder_generated_id;

      if (!orderMap[orderId]) {
        orderMap[orderId] = {
          corporateorder_id: row.corporateorder_id,
          corporateorder_generated_id: row.corporateorder_generated_id,
          customer_generated_id: row.customer_generated_id,
          total_amount: row.total_amount,
          paymentid: row.paymentid,
          customer_address: row.customer_address,
          ordered_at: row.ordered_at,
          payment_status: row.payment_status,
          corporate_order_status: row.corporate_order_status,
          address: {
            address_id: row.address_id,
            tag: row.address_tag,
            pincode: row.pincode,
            line1: row.line1,
            line2: row.line2,
            location: row.location,
            ship_to_name: row.ship_to_name,
            ship_to_phone_number: row.ship_to_phone_number
          },
          order_details: []
        };
      }

      // Process the media data to handle both old and new format
      let mediaData = null;
      if (row.media) {
        if (typeof row.media === 'string') {
          try {
            mediaData = JSON.parse(row.media);
          } catch (e) {
            mediaData = { items: [] };
          }
        } else {
          mediaData = row.media;
        }
        
        // Ensure we have a proper format for both old and new media structures
        if (mediaData && mediaData.urls && !mediaData.items) {
          // Convert old format to new format
          mediaData = {
            items: mediaData.urls.map(url => ({
              url: url,
              tag: 'untagged',
              type: url.match(/\.(mp4|mov|avi|wmv|flv|mkv)$/i) ? 'video' : 'image',
              created_at: new Date().toISOString()
            }))
          };
        }
      } else {
        mediaData = { items: [] };
      }

      // Safely check for media items
      const hasMedia = mediaData && 
                       ((mediaData.items && mediaData.items.length > 0) || 
                        (mediaData.urls && mediaData.urls.length > 0));

      // Add order detail with media check
      if (row.order_detail_id) {
        orderMap[orderId].order_details.push({
          order_detail_id: row.order_detail_id,
          processing_date: row.processing_date,
          delivery_status: row.delivery_status,
          category_id: row.category_id,
          category_name: row.category_name,
          quantity: row.quantity,
          active_quantity: row.active_quantity,
          media: hasMedia ? mediaData : "No Media",
          delivery_details: row.delivery_details,
          addedat: row.addedat
        });
      }
    });

    const orders = Object.values(orderMap);

    orders.forEach(order => {
      order.order_details = JSON.stringify(order.order_details);
    });

    console.log("Today's Corporate Orders:", orders);
    return orders;
  } catch (error) {
    logger.error("Error in getTodayCorporateOrders:", error);
    throw error;
  }
}


const updateSingleCorporateOrderDeliveryStatus = async (corporateOrderGeneratedId, categoryId, deliveryStatus) => {
  try {
      const result = await client.query(
          'UPDATE corporateorder_details SET delivery_status = $1 WHERE category_id = $2 AND corporateorder_generated_id = $3 RETURNING *',
          [deliveryStatus, categoryId, corporateOrderGeneratedId]
      );
      
      return result.rows[0] || null;
  } catch (error) {
      logger.error(`Error in updateCorporateOrderDeliveryStatus: ${error.message}`);
      throw error;
  }
};


const updateCorporateOrderDeliveryStatus = async (corporateOrderGeneratedId, categoryId, deliveryStatus) => {
  try {
      const result = await client.query(
          'UPDATE corporateorder_details SET delivery_status = $1, updatedat = NOW() WHERE category_id = $2 AND corporateorder_generated_id = $3 RETURNING *',
          [deliveryStatus, categoryId, corporateOrderGeneratedId]
      );
      
      // If the update was successful, update timestamps in the main corporateorders table
      if (result.rows.length > 0) {
          await client.query(
              'UPDATE corporateorders SET updatedat = NOW() WHERE corporateorder_generated_id = $1',
              [corporateOrderGeneratedId]
          );
      }
      
      return result.rows[0] || null;
  } catch (error) {
      logger.error(`Error in updateCorporateOrderDeliveryStatus: ${error.message}`);
      throw error;
  }
};





// Check if a corporate order exists
const checkCorporateOrderExists = async (corporateOrderId) => {
  try {
      const result = await client.query(
          'SELECT corporateorder_id FROM corporate_orders WHERE corporateorder_generated_id = $1',
          [corporateOrderId]
      );
      
      return result.rows.length > 0;
  } catch (error) {
      logger.error(`Error in checkCorporateOrderExists: ${error.message}`);
      throw error;
  }
};

// Get all categories for a corporate order
const getCorporateOrderCategoryDetails = async (corporateOrderId) => {
  try {
      const result = await client.query(
          'SELECT order_detail_id, category_id FROM corporateorder_details WHERE corporateorder_generated_id = $1',
          [corporateOrderId]
      );
      
      return result.rows;
  } catch (error) {
      logger.error(`Error in getCorporateOrderCategoryDetails: ${error.message}`);
      throw error;
  }
};

const updateAllCategoriesDeliveryStatus = async (corporateOrderId, deliveryStatus) => {
  try {
      // First update all categories for this order
      const updateResult = await client.query(
          `UPDATE corporateorder_details 
           SET delivery_status = $1
           WHERE corporateorder_generated_id = $2
           RETURNING order_detail_id, category_id, delivery_status`,
          [deliveryStatus, corporateOrderId]
      );
      
      // Then update the timestamp in the main order table
      if (updateResult.rows.length > 0) {
          await client.query(
              'UPDATE corporateorders SET updatedat = NOW() WHERE corporateorder_generated_id = $1',
              [corporateOrderId]
          );
      }
      
      return updateResult.rows;
  } catch (error) {
      logger.error(`Error in updateAllCategoriesDeliveryStatus: ${error.message}`);
      throw error;
  }
};


module.exports = {
    getCorporateOrderDetails,
    updateCorporateOrderMedia,
    getCorporateOrderWithCustomerDetails,
    getTodayCorporateOrders ,
    updateSingleCorporateOrderDeliveryStatus,
    updateCorporateOrderDeliveryStatus,
    checkCorporateOrderExists,
    getCorporateOrderCategoryDetails,
    updateAllCategoriesDeliveryStatus
    };