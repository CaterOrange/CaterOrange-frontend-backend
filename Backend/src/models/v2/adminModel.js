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

    // const today = "2025-03-03";


    console.log("Today's Date admin route :", today);

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
        c.customer_name, 
        c.customer_phonenumber,

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
      JOIN customer c ON co.customer_generated_id = c.customer_generated_id 
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
          customer_name: row.customer_name,
          customer_phonenumber: row.customer_phonenumber,
          order_details: []
        };
      }

      // Process the media data to handle both old and new format
      let mediaData = { items: [] }; // Default value
      
      if (row.media) {
        if (typeof row.media === 'string') {
          try {
            mediaData = JSON.parse(row.media);
          } catch (e) {
            mediaData = { items: [] };
          }
        } else {
          // If it's already an object
          mediaData = row.media;
        }
        
        // Ensure mediaData has an items property
        if (!mediaData.items) {
          mediaData.items = [];
        }
        
        // Convert old format to new format if needed
        if (mediaData.urls && Array.isArray(mediaData.urls)) {
          mediaData.items = mediaData.urls.map(url => ({
            url: url,
            tag: 'untagged',
            type: url.match(/\.(mp4|mov|avi|wmv|flv|mkv)$/i) ? 'video' : 'image',
            created_at: new Date().toISOString()
          }));
        }
      }

      // Add order detail with safe media check
      if (row.order_detail_id) {
        // Safe check for mediaData structure
        const hasMedia = mediaData && 
                        (mediaData.items && mediaData.items.length > 0) || 
                        (mediaData.urls && Array.isArray(mediaData.urls) && mediaData.urls.length > 0);
        
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

    // Check if orders array is not empty
    if (!orders || orders.length === 0) {
      return [];
    }
    
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



module.exports = {
    getCorporateOrderDetails,
    updateCorporateOrderMedia,
    getCorporateOrderWithCustomerDetails,
    getTodayCorporateOrders 

};