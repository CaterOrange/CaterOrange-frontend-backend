const { ApolloServer, gql } = require('apollo-server');
const { GraphQLScalarType, Kind } = require('graphql');
const client = require('../../config/dbConfig');
const { v2: cloudinary } = require('cloudinary');
const logger = require('../../config/logger');

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: 'dimuwrwxw', 
  api_key: '888367322417257', 
  api_secret: 'xXByzVUNWdJ__uExTTGlomF5iDM' 
});

const uploadCategoryMedia = async (mediaInput, tags = 'category') => {
  let mediaItems = [];
  
  // Normalize input to always be an array
  const files = Array.isArray(mediaInput) ? mediaInput : [mediaInput];
  
  for (const file of files) {
    try {
      // Skip empty or null inputs
      if (!file) {
        console.warn('Skipping empty file');
        continue;
      }

      // Debugging: Log file details
      console.log('Processing media:', {
        type: typeof file,
        value: file && file.substring ? file.substring(0, 50) + '...' : file
      });

      // Determine upload method based on input type
      let uploadResult;
      const uploadOptions = {
        folder: tags,
        transformation: {
          width: 500,
          height: 1000,
          quality: 'auto',
          fetch_format: 'auto'
        }
      };

      // Handle different input types
      if (typeof file === 'string') {
        if (file.startsWith('data:image/')) {
          // Base64 image
          uploadResult = await cloudinary.uploader.upload(file, uploadOptions);
        } else if (file.startsWith('http')) {
          // URL upload
          uploadResult = await cloudinary.uploader.upload(file, uploadOptions);
        } else {
          // Assume local file path
          uploadResult = await cloudinary.uploader.upload(file, uploadOptions);
        }
      } else if (file && file.url) {
        // Object with url property
        uploadResult = await cloudinary.uploader.upload(file.url, uploadOptions);
      } else {
        console.warn('Unsupported file type:', file);
        continue;
      }

      // Add uploaded URL to media items
      mediaItems.push(uploadResult.secure_url);
    } catch (error) {
      // Comprehensive error logging
      console.error('Cloudinary Upload Error:', {
        message: error.message,
        name: error.name,
        http_code: error.http_code,
        file: file
      });

      // Optional: skip failed uploads instead of throwing
      console.warn(`Skipping failed upload for: ${file}`);
    }
  }
  
  // Return JSON string with media items
  return JSON.stringify({ 
    items: mediaItems,
    upload_timestamp: new Date().toISOString()
  });
};
const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'A custom DateTime scalar with formatted date and time',
  serialize(value) {
    const date = value instanceof Date ? value : new Date(value);
    
    return date.toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  },
  parseValue(value) {
    // Parse input to Date object
    return value ? new Date(value) : null;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  }
});

const JsonScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'A JSON scalar type',
  parseValue(value) {
    return value; // value from the client input variables
  },
  serialize(value) {
    return value; // value sent to the client
  },
  parseLiteral(ast) {
    switch (ast.kind) {
      case Kind.OBJECT:
      case Kind.ARRAY:
        return ast.value; // AST object or array
      case Kind.STRING:
      case Kind.INT:
      case Kind.FLOAT:
      case Kind.BOOLEAN:
        return ast.value; // simple scalar types
      default:
        return null; // Invalid input
    }
  }
});

const typeDefs = gql`
  scalar DateTime
  scalar JSON

  type Analytics {
    total_customers: Int!
    corporate_orders: Int!
    event_orders: Int!
    total_orders: Int!
  }

  type Customer {
    customer_id: ID!
    customer_name: String!
    customer_email: String!
    customer_phonenumber: String
    isdeactivated: Boolean
    access_token: String
  }
  
  type CorporateOrder {
    corporateorder_generated_id: String
    customer_generated_id: String
    order_details: JSON!
    total_amount: Int
    paymentid: Int
    ordered_at: DateTime
    payment_status: String
    corporate_order_status: String
  customer_name: String  
  customer_phonenumber: String
      category_name: String  # Added this field

  }

  type Payment {
    paymentid: ID!
    paymenttype: String
    merchantreferenceid: String
    phonepereferenceid: String
    From: String
    instrument: String
    creationdate: DateTime
    transactiondate: DateTime
    settlementdate: DateTime
    bankreferenceno: String
    amount: Float
    fee: Float
    igst: Float
    cgst: Float  
    sgst: Float
    customer_generated_id: String
    paymentdate: DateTime
  }

  type Category {
    category_id: Int
    category_name: String
    category_description: String
    category_price: Int
    category_media: String
    addedat: DateTime
    closure_time: String
    is_deactivated: Boolean
    vendor_price: Int  # Added this field
  }

  type EventOrders {
    eventorder_generated_id: String
    customer_generated_id: String
    ordered_at: DateTime
    delivery_status: String
    paymentid: Int
    delivery_details: JSON
    event_order_details: JSON
    payment_status: String
    event_order_status: String
    total_amount: Float 
  }

  type ItemList {
    productname: String
    category_name: String
    price_category: String
    isdual: Boolean
    Plate_Units: String
    priceperunit: Float
    minunitsperplate: Int
    wtorvol_units: String
    price_per_wtorvol_units: Float
    min_wtorvol_units_per_plate: Int  
  }  
  type TodayStats {
    total_orders: Int!
    breakfast_count: Int!
    lunch_count: Int!
    dinner_count: Int!
    snacks_count: Int!
    total_amount: Float!
  }

  type Query {
    getAllCustomers: [Customer!]!
    getAllPayments: [Payment!]!
    getAllCategory: [Category!]!
    getAllEvents: [EventOrders!]!
    getAllOrders: [CorporateOrder!]!
    getAllItems: [ItemList!]!
    getAnalytics: Analytics!
    getTodayCorporateOrders: [CorporateOrder!]!
    getTodayStats: TodayStats!
  }

  type Mutation {
    updateCustomer(id: ID!, name: String, email: String, phoneNumber: String): Customer!
    toggleDeactivation(id: ID!, isdeactivated: Boolean!): Customer!
    updateEventOrderStatus(id: ID!, status: String!): EventOrders!
    updateCorporateOrderStatus(id: ID!, status: String!): CorporateOrder!
     updateOrderAcceptStatus(orderId: ID!, orderIndex: Int!, status: String!): CorporateOrder!
      updateDeliveryStatus(orderId: ID!, orderIndex: Int!, status: String!): CorporateOrder!

    createCategory(
      category_name: String!, 
      category_description: String!,
      category_price: Int!,
      vendor_price: Int!,
      category_media: String!
      is_deactivated: Boolean
      closure_time: String
    ): Category!
    updateCategory(
      category_id: Int, 
      category_name: String,
      category_description: String, 
      category_price: Int
      category_media:String,
      vendor_price: Int
      is_deactivated: Boolean
      closure_time: String
    ): Category!
    deleteCategory(category_id: Int!): Boolean!

    updateCorporateOrderMedia(
    corporateOrderGeneratedId: ID!, 
    categoryId: Int!, 
    media: JSON!
  ): CorporateOrder!

  }
`;

const resolvers = {
  DateTime: DateTimeScalar,
  JSON: JsonScalar,

  Query: {
    getAllCustomers: async () => {
      const result = await client.query('SELECT * FROM customer');
      return result.rows;
    },
    getAllPayments: async () => {
      try {
        const result = await client.query('SELECT * FROM payment');
        return result.rows;
      } catch (err) {
        console.error('Error retrieving payments:', err);
        throw new Error('Error retrieving payments');
      }
    },
    getAllCategory: async () => {
      const result = await client.query('SELECT * FROM corporate_category');
      console.log("Corporate_Category:", result.rows);
      return result.rows;
    },
    getAllEvents: async () => {
      const result = await client.query('SELECT * FROM event_orders');
      return result.rows;
    },

    getAllOrders: async () => {
  try {
    // Get all orders with customer info and details in a single query
    const result = await client.query(
      `SELECT 
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
       ORDER BY co.ordered_at DESC`
    );
    
    // Group order details by order
    const orderMap = {};
    
    result.rows.forEach(row => {
      const orderId = row.corporateorder_generated_id;
      
      if (!orderMap[orderId]) {
        // Create a new order entry
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
      
      // Add order detail if it exists
      if (row.order_detail_id) {
        orderMap[orderId].order_details.push({
          order_detail_id: row.order_detail_id,
          processing_date: row.processing_date,
          delivery_status: row.delivery_status,
          category_id: row.category_id,
          category_name: row.category_name,
          quantity: row.quantity,
          active_quantity: row.active_quantity,
          media: row.media,
          delivery_details: row.delivery_details,
          addedat: row.addedat
        });
      }
    });
    
    // Convert map to array
    const orders = Object.values(orderMap);
    
    // Convert order_details to JSON string for each order
    orders.forEach(order => {
      order.order_details = JSON.stringify(order.order_details);
    });
    
    console.log("Corporate Orders:", orders);
    return orders;
    
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    throw error;
  }
}
    
    ,

    getTodayCorporateOrders: async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        console.log("Today's Date admin route:", today);
    
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
              media: row.media && Object.keys(row.media).length > 0 ? row.media : "No Media", // Check if media exists
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
        console.error("Error in getTodayCorporateOrders:", error);
        throw error;
      }
    }
    ,
  
    getAllItems: async () => {
      const result = await client.query('SELECT * FROM event_products');
      return result.rows;
    },
    getTodayStats: async () => {
      const todayOrdersQuery = `
        SELECT 
          COUNT(*) as total_orders,
          SUM(total_amount) as total_amount,
          SUM(CASE 
              WHEN order_details->>'meal_type' = 'breakfast' THEN 1 
              ELSE 0 
          END) as breakfast_count,
          SUM(CASE 
              WHEN order_details->>'meal_type' = 'lunch' THEN 1 
              ELSE 0 
          END) as lunch_count,
          SUM(CASE 
              WHEN order_details->>'meal_type' = 'dinner' THEN 1 
              ELSE 0 
          END) as dinner_count,
          SUM(CASE 
              WHEN order_details->>'meal_type' = 'snacks' THEN 1 
              ELSE 0 
          END) as snacks_count
        FROM corporate_orders
        WHERE DATE(ordered_at) = CURRENT_DATE`;

      const todayStats = await client.query(todayOrdersQuery);
      const stats = todayStats.rows[0];

      return {
        total_orders: parseInt(stats.total_orders) || 0,
        breakfast_count: parseInt(stats.breakfast_count) || 0,
        lunch_count: parseInt(stats.lunch_count) || 0,
        dinner_count: parseInt(stats.dinner_count) || 0,
        snacks_count: parseInt(stats.snacks_count) || 0,
        total_amount: parseFloat(stats.total_amount) || 0
      };
    },
    getAnalytics: async () => {
      const totalCustomers = await client.query('SELECT COUNT(*) FROM customer');
      const corporateOrders = await client.query('SELECT COUNT(*) FROM corporate_orders');
      const eventOrders = await client.query('SELECT COUNT(*) FROM event_orders');
      const totalOrders = parseInt(corporateOrders.rows[0].count) + parseInt(eventOrders.rows[0].count);

      return {
        total_customers: parseInt(totalCustomers.rows[0].count),
        corporate_orders: parseInt(corporateOrders.rows[0].count),
        event_orders: parseInt(eventOrders.rows[0].count),
        total_orders: parseInt(totalOrders)
      };
    }
  },

  Mutation: {

    updateCorporateOrderMedia: async (_, { corporateOrderGeneratedId, categoryId, media }) => {
      try {
        // Check if the order and category exist
        const orderCheck = await client.query(
          'SELECT * FROM corporateorder_details WHERE corporateorder_generated_id = $1 AND category_id = $2',
          [corporateOrderGeneratedId, categoryId]
        );
        
        if (orderCheck.rows.length === 0) {
          throw new Error('No matching record found for the provided category and order ID');
        }
    
        // Get existing media
        let existingMedia = orderCheck.rows[0].media || { urls: [] };
        if (typeof existingMedia === 'string') {
          try {
            existingMedia = JSON.parse(existingMedia);
          } catch (e) {
            existingMedia = { urls: [] };
          }
        }
        
        if (!existingMedia.urls) {
          existingMedia.urls = [];
        }
    
        // Process media uploads to Cloudinary
        let newMediaUrls = [];
        
        // Handle media input based on its structure
        if (media) {
          // If media is an array of URLs
          if (Array.isArray(media)) {
            for (const url of media) {
              try {
                const uploadResult = await cloudinary.uploader.upload(url, {
                  folder: 'corporate_order_media',
                  transformation: {
                    width: 500,
                    height: 1000,
                    quality: 'auto',
                    fetch_format: 'auto'
                  }
                });
                newMediaUrls.push(uploadResult.secure_url);
              } catch (error) {
                console.error("Error uploading to Cloudinary:", error);
                throw new Error('Error uploading media to Cloudinary');
              }
            }
          } 
          // If media is a single URL
          else if (typeof media === 'string') {
            try {
              const uploadResult = await cloudinary.uploader.upload(media, {
                folder: 'corporate_order_media',
                transformation: {
                  width: 500,
                  height: 1000,
                  quality: 'auto',
                  fetch_format: 'auto'
                }
              });
              newMediaUrls.push(uploadResult.secure_url);
            } catch (error) {
              console.error("Error uploading to Cloudinary:", error);
              throw new Error('Error uploading media to Cloudinary');
            }
          }
          // If media is an object with urls property (JSON format)
          else if (media.urls && Array.isArray(media.urls)) {
            for (const url of media.urls) {
              try {
                const uploadResult = await cloudinary.uploader.upload(url, {
                  folder: 'corporate_order_media',
                  transformation: {
                    width: 500,
                    height: 1000,
                    quality: 'auto',
                    fetch_format: 'auto'
                  }
                });
                newMediaUrls.push(uploadResult.secure_url);
              } catch (error) {
                console.error("Error uploading to Cloudinary:", error);
                throw new Error('Error uploading media to Cloudinary');
              }
            }
          }
        }
    
        // Combine existing and new media URLs
        const combinedUrls = [...existingMedia.urls, ...newMediaUrls];
        const mediaJson = { urls: combinedUrls };
    
        // Update the database
        const result = await client.query(
          'UPDATE corporateorder_details SET media = $1 WHERE category_id = $2 AND corporateorder_generated_id = $3 RETURNING *',
          [mediaJson, categoryId, corporateOrderGeneratedId]
        );
        
        if (result.rowCount === 0) {
          throw new Error('Failed to update media for order');
        }
    
        // Fetch the complete order to return
        const orderQuery = `
          SELECT 
            co.*,
            c.customer_name,
            c.customer_phonenumber
          FROM corporate_orders co
          JOIN customer c ON co.customer_generated_id = c.customer_generated_id
          WHERE co.corporateorder_generated_id = $1
        `;
        
        const orderResult = await client.query(orderQuery, [corporateOrderGeneratedId]);
        
        if (orderResult.rows.length === 0) {
          throw new Error('Order not found after update');
        }
        
        return orderResult.rows[0];
      } catch (error) {
        console.error("Error in updateCorporateOrderMedia:", error);
        throw error;
      }
    }


    ,
    updateCustomer: async (_, { id, name, email, phoneNumber }) => {
      const fields = [];
      const values = [];
      let query = 'UPDATE customer SET ';

      if (name) {
        fields.push(`customer_name = $${fields.length + 1}`);
        values.push(name);
      }
      if (email) {
        fields.push(`customer_email = $${fields.length + 1}`);
        values.push(email);
      }
      if (phoneNumber) {
        fields.push(`customer_phonenumber = $${fields.length + 1}`);
        values.push(phoneNumber);
      }

      query += fields.join(', ') + ` WHERE customer_id = $${fields.length + 1} RETURNING *`;
      values.push(id);

      const result = await client.query(query, values);
      return result.rows[0];
    },
    toggleDeactivation: async (_, { id, isdeactivated }) => {
      const result = await client.query(
        'UPDATE customer SET isdeactivated = $1 WHERE customer_id = $2 RETURNING *',
        [isdeactivated, id]
      );
      return result.rows[0];
    },
    updateEventOrderStatus: async (_, { id, status }) => {
      const result = await client.query(
        'UPDATE event_orders SET event_order_status = $1 WHERE eventorder_generated_id = $2 RETURNING *',
        [status, id]
      );
      return result.rows[0];
    },
    
createCategory : async (_, { 
  category_name, 
  category_description, 
  category_price, 
  vendor_price, 
  category_media, 
  closure_time, 
  is_deactivated = false 
}) => {
  try {
    // Log input for debugging
    console.log('Creating category with media:', category_media);

    // Process media if provided
    let processedMedia = null;
    if (category_media) {
      try {
        const uploadResult = await uploadCategoryMedia(category_media, category_name);
        const mediaUrls = JSON.parse(uploadResult).items;
        processedMedia = mediaUrls.length > 0 ? mediaUrls[0] : null;
        console.log('Processed Media:', processedMedia);
      } catch (uploadError) {
        console.error('Media upload error:', uploadError);
        // Optional: You can choose to continue without media or handle the error
      }
    }
    
    const result = await client.query(
      'INSERT INTO corporate_category (category_name, category_description, category_price, vendor_price, category_media, closure_time, is_deactivated, addedat) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
      [
        category_name, 
        category_description, 
        category_price, 
        vendor_price, 
        processedMedia, 
        closure_time, 
        is_deactivated
      ]
    );
    return result.rows[0];
  } catch (error) {
    logger.error(`Error creating category: ${error.message}`);
    console.error('Full error details:', error);
    throw new Error(`Category creation failed: ${error.message}`);
  }
},

 updateCategory:async (_, { 
  category_id, 
  category_name, 
  category_description, 
  category_price, 
  vendor_price, 
  category_media,
  closure_time, 
  is_deactivated 
}) => {
  try {
    const fields = [];
    const values = [];
    let query = 'UPDATE corporate_category SET ';

    // Existing field updates
    if (category_name !== undefined) {
      fields.push(`category_name = $${fields.length + 1}`);
      values.push(category_name);
    }
    if (category_description !== undefined) {
      fields.push(`category_description = $${fields.length + 1}`);
      values.push(category_description);
    }
    if (category_price !== undefined) {
      fields.push(`category_price = $${fields.length + 1}`);
      values.push(category_price);
    }
    if (vendor_price !== undefined) {
      fields.push(`vendor_price = $${fields.length + 1}`);
      values.push(vendor_price);
    }
    if (closure_time !== undefined) {
      fields.push(`closure_time = $${fields.length + 1}`);
      values.push(closure_time);
    }
    if (is_deactivated !== undefined) {
      fields.push(`is_deactivated = $${fields.length + 1}`);
      values.push(is_deactivated);
    }
    
    // Handle media upload and update
    if (category_media !== undefined) {
      // Upload new media
      const uploadResult = await uploadCategoryMedia(category_media, category_name);
      const mediaUrls = JSON.parse(uploadResult).items;
      const processedMedia = mediaUrls.length > 0 ? mediaUrls[0] : null;
      
      fields.push(`category_media = $${fields.length + 1}`);
      values.push(processedMedia);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(category_id);
    query += fields.join(', ') + ` WHERE category_id = $${fields.length + 1} RETURNING *`;

    const result = await client.query(query, values);
    return result.rows[0];
  } catch (error) {
    logger.error(`Error updating category: ${error.message}`);
    throw new Error(`Category update failed: ${error.message}`);
  }
},
    deleteCategory: async (_, { category_id }) => {
      const result = await client.query('DELETE FROM corporate_category WHERE category_id = $1', [category_id]);
      return result.rowCount > 0;
    },

    
    updateDeliveryStatus: async (_, { orderId, orderIndex, status }) => {
      try {
        // Validate status
        const validStatuses = [
          'Pending',
          'Accepted',
          'Shipped',
          'Delivered',
          'Cancelled by user',
          'Cancelled by admin'
        ];
        
        if (!validStatuses.includes(status)) {
          throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }
        
        // Check if the order exists
        const orderCheck = await client.query(
          'SELECT corporateorder_generated_id FROM corporate_orders WHERE corporateorder_generated_id = $1',
          [orderId]
        );
        
        if (orderCheck.rows.length === 0) {
          throw new Error('Order not found');
        }
        
        // Get the order detail by order ID and index
        const orderDetailsQuery = await client.query(
          'SELECT order_detail_id FROM corporateorder_details WHERE corporateorder_generated_id = $1 ORDER BY order_detail_id LIMIT 1 OFFSET $2',
          [orderId, orderIndex]
        );
        
        if (orderDetailsQuery.rows.length === 0) {
          throw new Error('Order detail not found');
        }
        
        const orderDetailId = orderDetailsQuery.rows[0].order_detail_id;
        
        // Update ONLY the delivery_status in the corporateorder_details table
        const updateQuery = `
          UPDATE corporateorder_details 
          SET delivery_status = $1
          WHERE order_detail_id = $2
          RETURNING *
        `;
        
        const result = await client.query(updateQuery, [status, orderDetailId]);
        
        if (result.rows.length === 0) {
          throw new Error('Failed to update order detail');
        }
        
        // Get the updated order with all its details
        const updatedOrderQuery = `
          SELECT 
            co.*,
            c.customer_name,
            c.customer_phonenumber,
            json_agg(
              json_build_object(
                'order_detail_id', cod.order_detail_id,
                'category_name', cat.category_name,
                'quantity', cod.quantity,
                'active_quantity', cod.active_quantity,
                'processing_date', cod.processing_date,
                'delivery_status', cod.delivery_status
              )
            ) as order_details
          FROM corporate_orders co 
          JOIN customer c ON co.customer_generated_id = c.customer_generated_id
          JOIN corporateorder_details cod ON co.corporateorder_generated_id = cod.corporateorder_generated_id
          LEFT JOIN corporate_category cat ON cod.category_id = cat.category_id
          WHERE co.corporateorder_generated_id = $1
          GROUP BY co.corporateorder_id, co.corporateorder_generated_id, c.customer_name, c.customer_phonenumber
        `;
        
        const updatedOrder = await client.query(updatedOrderQuery, [orderId]);
        
        if (updatedOrder.rows.length === 0) {
          throw new Error('Failed to retrieve updated order');
        }
        
        return updatedOrder.rows[0];
      } catch (error) {
        console.error("Error in updateDeliveryStatus:", error);
        throw error;
      }
    }
  ,



    updateCorporateOrderStatus : async (_, { id, status }) => {
      try {
        const validStatuses = [
          'Pending',
          'Confirmed',
          'Active',
          'Completed',
          'Cancelled by user',
          'Cancelled by admin'
        ];
    
        if (!validStatuses.includes(status)) {
          throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }
    
        const result = await client.query(
          'UPDATE corporate_orders SET corporate_order_status = $1 WHERE corporateorder_generated_id = $2 RETURNING *',
          [status, id]
        );
    
        if (result.rows.length === 0) {
          throw new Error('Order not found');
        }
    
        return result.rows[0];
      } catch (error) {
        console.error("Error in updateCorporateOrderStatus:", error);
        throw error;
      }
    }


    ,



    
  }



};
module.exports = { typeDefs, resolvers };
// const { ApolloServer, gql } = require('apollo-server');
// const { GraphQLScalarType, Kind } = require('graphql');
// const client = require('../../config/dbConfig');


// const { v2: cloudinary } = require('cloudinary');

// // Configure Cloudinary



// const DateTimeScalar = new GraphQLScalarType({
//   name: 'DateTime',
//   description: 'A custom DateTime scalar with formatted date and time',
//   serialize(value) {
//     const date = value instanceof Date ? value : new Date(value);
    
//     return date.toLocaleString('en-GB', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//       hour12: false
//     });
//   },
//   parseValue(value) {
//     // Parse input to Date object
//     return value ? new Date(value) : null;
//   },
//   parseLiteral(ast) {
//     if (ast.kind === Kind.STRING) {
//       return new Date(ast.value);
//     }
//     return null;
//   }
// });

// const JsonScalar = new GraphQLScalarType({
//   name: 'JSON',
//   description: 'A JSON scalar type',
//   parseValue(value) {
//     return value; // value from the client input variables
//   },
//   serialize(value) {
//     return value; // value sent to the client
//   },
//   parseLiteral(ast) {
//     switch (ast.kind) {
//       case Kind.OBJECT:
//       case Kind.ARRAY:
//         return ast.value; // AST object or array
//       case Kind.STRING:
//       case Kind.INT:
//       case Kind.FLOAT:
//       case Kind.BOOLEAN:
//         return ast.value; // simple scalar types
//       default:
//         return null; // Invalid input
//     }
//   }
// });

// const typeDefs = gql`
//   scalar DateTime
//   scalar JSON

//   type Analytics {
//     total_customers: Int!
//     corporate_orders: Int!
//     event_orders: Int!
//     total_orders: Int!
//   }

//   type Customer {
//     customer_id: ID!
//     customer_name: String!
//     customer_email: String!
//     customer_phonenumber: String
//     isdeactivated: Boolean
//     access_token: String
//   }
  
//   type CorporateOrder {
//     corporateorder_generated_id: String
//     customer_generated_id: String
//     order_details: JSON!
//     total_amount: Int
//     paymentid: Int
//     ordered_at: DateTime
//     payment_status: String
//     corporate_order_status: String
//   customer_name: String  
//   customer_phonenumber: String
//       category_name: String  # Added this field

//   }

//   type Payment {
//     paymentid: ID!
//     paymenttype: String
//     merchantreferenceid: String
//     phonepereferenceid: String
//     From: String
//     instrument: String
//     creationdate: DateTime
//     transactiondate: DateTime
//     settlementdate: DateTime
//     bankreferenceno: String
//     amount: Float
//     fee: Float
//     igst: Float
//     cgst: Float  
//     sgst: Float
//     customer_generated_id: String
//     paymentdate: DateTime
//   }

//   type Category {
//     category_id: Int
//     category_name: String
//     category_description: String
//     category_price: Int
//     category_media: String
//     addedat: DateTime
//     closure_time: String
//     is_deactivated: Boolean
//     vendor_price: Int  # Added this field
//   }

//   type EventOrders {
//     eventorder_generated_id: String
//     customer_generated_id: String
//     ordered_at: DateTime
//     delivery_status: String
//     paymentid: Int
//     delivery_details: JSON
//     event_order_details: JSON
//     payment_status: String
//     event_order_status: String
//     total_amount: Float 
//   }

//   type ItemList {
//     productname: String
//     category_name: String
//     price_category: String
//     isdual: Boolean
//     Plate_Units: String
//     priceperunit: Float
//     minunitsperplate: Int
//     wtorvol_units: String
//     price_per_wtorvol_units: Float
//     min_wtorvol_units_per_plate: Int  
//   }  
//   type TodayStats {
//     total_orders: Int!
//     breakfast_count: Int!
//     lunch_count: Int!
//     dinner_count: Int!
//     snacks_count: Int!
//     total_amount: Float!
//   }

//   type Query {
//     getAllCustomers: [Customer!]!
//     getAllPayments: [Payment!]!
//     getAllCategory: [Category!]!
//     getAllEvents: [EventOrders!]!
//     getAllOrders: [CorporateOrder!]!
//     getAllItems: [ItemList!]!
//     getAnalytics: Analytics!
//     getTodayCorporateOrders: [CorporateOrder!]!
//     getTodayStats: TodayStats!
//   }

//   type Mutation {
//     updateCustomer(id: ID!, name: String, email: String, phoneNumber: String): Customer!
//     toggleDeactivation(id: ID!, isdeactivated: Boolean!): Customer!
//     updateEventOrderStatus(id: ID!, status: String!): EventOrders!
//     updateCorporateOrderStatus(id: ID!, status: String!): CorporateOrder!
//      updateOrderAcceptStatus(orderId: ID!, orderIndex: Int!, status: String!): CorporateOrder!
//       updateDeliveryStatus(orderId: ID!, orderIndex: Int!, status: String!): CorporateOrder!

//     createCategory(
//       category_name: String!, 
//       category_description: String!,
//       category_price: Int!,
//       vendor_price: Int!,
//       category_media: String!
//       is_deactivated: Boolean
//       closure_time: String
//     ): Category!
//     updateCategory(
//       category_id: Int, 
//       category_name: String,
//       category_description: String, 
//       category_price: Int
//       vendor_price: Int
//       is_deactivated: Boolean
//       closure_time: String
//     ): Category!
//     deleteCategory(category_id: Int!): Boolean!

//     updateCorporateOrderMedia(
//     corporateOrderGeneratedId: ID!, 
//     categoryId: Int!, 
//     media: JSON!
//   ): CorporateOrder!

//   }
// `;

// const resolvers = {
//   DateTime: DateTimeScalar,
//   JSON: JsonScalar,

//   Query: {
//     getAllCustomers: async () => {
//       const result = await client.query('SELECT * FROM customer');
//       return result.rows;
//     },
//     getAllPayments: async () => {
//       try {
//         const result = await client.query('SELECT * FROM payment');
//         return result.rows;
//       } catch (err) {
//         console.error('Error retrieving payments:', err);
//         throw new Error('Error retrieving payments');
//       }
//     },
//     getAllCategory: async () => {
//       const result = await client.query('SELECT * FROM corporate_category');
//       console.log("Corporate_Category:", result.rows);
//       return result.rows;
//     },
//     getAllEvents: async () => {
//       const result = await client.query('SELECT * FROM event_orders');
//       return result.rows;
//     },

//     getAllOrders: async () => {
//   try {
//     // Get all orders with customer info and details in a single query
//     const result = await client.query(
//       `SELECT 
//         co.corporateorder_id, 
//         co.corporateorder_generated_id,
//         co.customer_generated_id,
//         co.order_details,
//         co.total_amount,
//         co.paymentid,
//         co.customer_address,
//         co.ordered_at,
//         co.payment_status,
//         co.corporate_order_status,
//         c.customer_name, 
//         c.customer_phonenumber,

//         cod.order_detail_id,
//         cod.processing_date,
//         cod.delivery_status,
//         cod.category_id,
//         cod.quantity,
//         cod.active_quantity,
//         cod.media,
//         cod.delivery_details,
//         cod.addedat,

//         cc.category_name
//        FROM corporate_orders co 
//        JOIN customer c ON co.customer_generated_id = c.customer_generated_id 
//        LEFT JOIN corporateorder_details cod ON co.corporateorder_generated_id = cod.corporateorder_generated_id
//        LEFT JOIN corporate_category cc ON cod.category_id = cc.category_id
//        ORDER BY co.ordered_at DESC`
//     );
    
//     // Group order details by order
//     const orderMap = {};
    
//     result.rows.forEach(row => {
//       const orderId = row.corporateorder_generated_id;
      
//       if (!orderMap[orderId]) {
//         // Create a new order entry
//         orderMap[orderId] = {
//           corporateorder_id: row.corporateorder_id,
//           corporateorder_generated_id: row.corporateorder_generated_id,
//           customer_generated_id: row.customer_generated_id,
//           total_amount: row.total_amount,
//           paymentid: row.paymentid,
//           customer_address: row.customer_address,
//           ordered_at: row.ordered_at,
//           payment_status: row.payment_status,
//           corporate_order_status: row.corporate_order_status,
//           customer_name: row.customer_name,
//           customer_phonenumber: row.customer_phonenumber,
//           order_details: []
//         };
//       }
      
//       // Add order detail if it exists
//       if (row.order_detail_id) {
//         orderMap[orderId].order_details.push({
//           order_detail_id: row.order_detail_id,
//           processing_date: row.processing_date,
//           delivery_status: row.delivery_status,
//           category_id: row.category_id,
//           category_name: row.category_name,
//           quantity: row.quantity,
//           active_quantity: row.active_quantity,
//           media: row.media,
//           delivery_details: row.delivery_details,
//           addedat: row.addedat
//         });
//       }
//     });
    
//     // Convert map to array
//     const orders = Object.values(orderMap);
    
//     // Convert order_details to JSON string for each order
//     orders.forEach(order => {
//       order.order_details = JSON.stringify(order.order_details);
//     });
    
//     console.log("Corporate Orders:", orders);
//     return orders;
    
//   } catch (error) {
//     console.error("Error in getAllOrders:", error);
//     throw error;
//   }
// }
    
//     ,

//     getTodayCorporateOrders: async () => {
//       try {
//         const today = new Date().toISOString().split('T')[0];
//         console.log("Today's Date admin route:", today);
    
//         const result = await client.query(`
//           SELECT 
//             co.corporateorder_id, 
//             co.corporateorder_generated_id,
//             co.customer_generated_id,
//             co.order_details,
//             co.total_amount,
//             co.paymentid,
//             co.customer_address,
//             co.ordered_at,
//             co.payment_status,
//             co.corporate_order_status,
//             c.customer_name, 
//             c.customer_phonenumber,
    
//             cod.order_detail_id,
//             cod.processing_date,
//             cod.delivery_status,
//             cod.category_id,
//             cod.quantity,
//             cod.active_quantity,
//             cod.media,
//             cod.delivery_details,
//             cod.addedat,
    
//             cc.category_name
//           FROM corporate_orders co 
//           JOIN customer c ON co.customer_generated_id = c.customer_generated_id 
//           LEFT JOIN corporateorder_details cod ON co.corporateorder_generated_id = cod.corporateorder_generated_id
//           LEFT JOIN corporate_category cc ON cod.category_id = cc.category_id
//           WHERE cod.processing_date = $1
//           ORDER BY co.ordered_at DESC
//         `, [today]);
    
//         const orderMap = {};
    
//         result.rows.forEach(row => {
//           const orderId = row.corporateorder_generated_id;
    
//           if (!orderMap[orderId]) {
//             orderMap[orderId] = {
//               corporateorder_id: row.corporateorder_id,
//               corporateorder_generated_id: row.corporateorder_generated_id,
//               customer_generated_id: row.customer_generated_id,
//               total_amount: row.total_amount,
//               paymentid: row.paymentid,
//               customer_address: row.customer_address,
//               ordered_at: row.ordered_at,
//               payment_status: row.payment_status,
//               corporate_order_status: row.corporate_order_status,
//               customer_name: row.customer_name,
//               customer_phonenumber: row.customer_phonenumber,
//               order_details: []
//             };
//           }
    
//           // Add order detail with media check
//           if (row.order_detail_id) {
//             orderMap[orderId].order_details.push({
//               order_detail_id: row.order_detail_id,
//               processing_date: row.processing_date,
//               delivery_status: row.delivery_status,
//               category_id: row.category_id,
//               category_name: row.category_name,
//               quantity: row.quantity,
//               active_quantity: row.active_quantity,
//               media: row.media && Object.keys(row.media).length > 0 ? row.media : "No Media", // Check if media exists
//               delivery_details: row.delivery_details,
//               addedat: row.addedat
//             });
//           }
//         });
    
//         const orders = Object.values(orderMap);
    
//         orders.forEach(order => {
//           order.order_details = JSON.stringify(order.order_details);
//         });
    
//         console.log("Today's Corporate Orders:", orders);
//         return orders;
//       } catch (error) {
//         console.error("Error in getTodayCorporateOrders:", error);
//         throw error;
//       }
//     }
//     ,
  
//     getAllItems: async () => {
//       const result = await client.query('SELECT * FROM event_products');
//       return result.rows;
//     },
//     getTodayStats: async () => {
//       const todayOrdersQuery = `
//         SELECT 
//           COUNT(*) as total_orders,
//           SUM(total_amount) as total_amount,
//           SUM(CASE 
//               WHEN order_details->>'meal_type' = 'breakfast' THEN 1 
//               ELSE 0 
//           END) as breakfast_count,
//           SUM(CASE 
//               WHEN order_details->>'meal_type' = 'lunch' THEN 1 
//               ELSE 0 
//           END) as lunch_count,
//           SUM(CASE 
//               WHEN order_details->>'meal_type' = 'dinner' THEN 1 
//               ELSE 0 
//           END) as dinner_count,
//           SUM(CASE 
//               WHEN order_details->>'meal_type' = 'snacks' THEN 1 
//               ELSE 0 
//           END) as snacks_count
//         FROM corporate_orders
//         WHERE DATE(ordered_at) = CURRENT_DATE`;

//       const todayStats = await client.query(todayOrdersQuery);
//       const stats = todayStats.rows[0];

//       return {
//         total_orders: parseInt(stats.total_orders) || 0,
//         breakfast_count: parseInt(stats.breakfast_count) || 0,
//         lunch_count: parseInt(stats.lunch_count) || 0,
//         dinner_count: parseInt(stats.dinner_count) || 0,
//         snacks_count: parseInt(stats.snacks_count) || 0,
//         total_amount: parseFloat(stats.total_amount) || 0
//       };
//     },
//     getAnalytics: async () => {
//       const totalCustomers = await client.query('SELECT COUNT(*) FROM customer');
//       const corporateOrders = await client.query('SELECT COUNT(*) FROM corporate_orders');
//       const eventOrders = await client.query('SELECT COUNT(*) FROM event_orders');
//       const totalOrders = parseInt(corporateOrders.rows[0].count) + parseInt(eventOrders.rows[0].count);

//       return {
//         total_customers: parseInt(totalCustomers.rows[0].count),
//         corporate_orders: parseInt(corporateOrders.rows[0].count),
//         event_orders: parseInt(eventOrders.rows[0].count),
//         total_orders: parseInt(totalOrders)
//       };
//     }
//   },

//   Mutation: {

//     updateCorporateOrderMedia: async (_, { corporateOrderGeneratedId, categoryId, media }) => {
//       try {
//         // Check if the order and category exist
//         const orderCheck = await client.query(
//           'SELECT * FROM corporateorder_details WHERE corporateorder_generated_id = $1 AND category_id = $2',
//           [corporateOrderGeneratedId, categoryId]
//         );
        
//         if (orderCheck.rows.length === 0) {
//           throw new Error('No matching record found for the provided category and order ID');
//         }
    
//         // Get existing media
//         let existingMedia = orderCheck.rows[0].media || { urls: [] };
//         if (typeof existingMedia === 'string') {
//           try {
//             existingMedia = JSON.parse(existingMedia);
//           } catch (e) {
//             existingMedia = { urls: [] };
//           }
//         }
        
//         if (!existingMedia.urls) {
//           existingMedia.urls = [];
//         }
    
//         // Process media uploads to Cloudinary
//         let newMediaUrls = [];
        
//         // Handle media input based on its structure
//         if (media) {
//           // If media is an array of URLs
//           if (Array.isArray(media)) {
//             for (const url of media) {
//               try {
//                 const uploadResult = await cloudinary.uploader.upload(url, {
//                   folder: 'corporate_order_media',
//                   transformation: {
//                     width: 500,
//                     height: 1000,
//                     quality: 'auto',
//                     fetch_format: 'auto'
//                   }
//                 });
//                 newMediaUrls.push(uploadResult.secure_url);
//               } catch (error) {
//                 console.error("Error uploading to Cloudinary:", error);
//                 throw new Error('Error uploading media to Cloudinary');
//               }
//             }
//           } 
//           // If media is a single URL
//           else if (typeof media === 'string') {
//             try {
//               const uploadResult = await cloudinary.uploader.upload(media, {
//                 folder: 'corporate_order_media',
//                 transformation: {
//                   width: 500,
//                   height: 1000,
//                   quality: 'auto',
//                   fetch_format: 'auto'
//                 }
//               });
//               newMediaUrls.push(uploadResult.secure_url);
//             } catch (error) {
//               console.error("Error uploading to Cloudinary:", error);
//               throw new Error('Error uploading media to Cloudinary');
//             }
//           }
//           // If media is an object with urls property (JSON format)
//           else if (media.urls && Array.isArray(media.urls)) {
//             for (const url of media.urls) {
//               try {
//                 const uploadResult = await cloudinary.uploader.upload(url, {
//                   folder: 'corporate_order_media',
//                   transformation: {
//                     width: 500,
//                     height: 1000,
//                     quality: 'auto',
//                     fetch_format: 'auto'
//                   }
//                 });
//                 newMediaUrls.push(uploadResult.secure_url);
//               } catch (error) {
//                 console.error("Error uploading to Cloudinary:", error);
//                 throw new Error('Error uploading media to Cloudinary');
//               }
//             }
//           }
//         }
    
//         // Combine existing and new media URLs
//         const combinedUrls = [...existingMedia.urls, ...newMediaUrls];
//         const mediaJson = { urls: combinedUrls };
    
//         // Update the database
//         const result = await client.query(
//           'UPDATE corporateorder_details SET media = $1 WHERE category_id = $2 AND corporateorder_generated_id = $3 RETURNING *',
//           [mediaJson, categoryId, corporateOrderGeneratedId]
//         );
        
//         if (result.rowCount === 0) {
//           throw new Error('Failed to update media for order');
//         }
    
//         // Fetch the complete order to return
//         const orderQuery = `
//           SELECT 
//             co.*,
//             c.customer_name,
//             c.customer_phonenumber
//           FROM corporate_orders co
//           JOIN customer c ON co.customer_generated_id = c.customer_generated_id
//           WHERE co.corporateorder_generated_id = $1
//         `;
        
//         const orderResult = await client.query(orderQuery, [corporateOrderGeneratedId]);
        
//         if (orderResult.rows.length === 0) {
//           throw new Error('Order not found after update');
//         }
        
//         return orderResult.rows[0];
//       } catch (error) {
//         console.error("Error in updateCorporateOrderMedia:", error);
//         throw error;
//       }
//     }


//     ,
//     updateCustomer: async (_, { id, name, email, phoneNumber }) => {
//       const fields = [];
//       const values = [];
//       let query = 'UPDATE customer SET ';

//       if (name) {
//         fields.push(`customer_name = $${fields.length + 1}`);
//         values.push(name);
//       }
//       if (email) {
//         fields.push(`customer_email = $${fields.length + 1}`);
//         values.push(email);
//       }
//       if (phoneNumber) {
//         fields.push(`customer_phonenumber = $${fields.length + 1}`);
//         values.push(phoneNumber);
//       }

//       query += fields.join(', ') + ` WHERE customer_id = $${fields.length + 1} RETURNING *`;
//       values.push(id);

//       const result = await client.query(query, values);
//       return result.rows[0];
//     },
//     toggleDeactivation: async (_, { id, isdeactivated }) => {
//       const result = await client.query(
//         'UPDATE customer SET isdeactivated = $1 WHERE customer_id = $2 RETURNING *',
//         [isdeactivated, id]
//       );
//       return result.rows[0];
//     },
//     updateEventOrderStatus: async (_, { id, status }) => {
//       const result = await client.query(
//         'UPDATE event_orders SET event_order_status = $1 WHERE eventorder_generated_id = $2 RETURNING *',
//         [status, id]
//       );
//       return result.rows[0];
//     },
    
//     createCategory: async (_, { category_name, category_description, category_price, vendor_price, category_media, closure_time, is_deactivated = true }) => {
//       const result = await client.query(
//         'INSERT INTO corporate_category (category_name, category_description, category_price, vendor_price, category_media, closure_time, is_deactivated, addedat) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
//         [category_name, category_description, category_price, vendor_price, category_media, closure_time, is_deactivated]
//       );
//       return result.rows[0];
//     },
    
//     updateCategory: async (_, { category_id, category_name, category_description, category_price, vendor_price, closure_time, is_deactivated }) => {
//       const fields = [];
//       const values = [];
//       let query = 'UPDATE corporate_category SET ';
    
//       if (category_name !== undefined) {
//         fields.push(`category_name = $${fields.length + 1}`);
//         values.push(category_name);
//       }
//       if (category_description !== undefined) {
//         fields.push(`category_description = $${fields.length + 1}`);
//         values.push(category_description);
//       }
//       if (category_price !== undefined) {
//         fields.push(`category_price = $${fields.length + 1}`);
//         values.push(category_price);
//       }
//       if (vendor_price !== undefined) {
//         fields.push(`vendor_price = $${fields.length + 1}`);
//         values.push(vendor_price);
//       }
//       if (closure_time !== undefined) {
//         fields.push(`closure_time = $${fields.length + 1}`);
//         values.push(closure_time);
//       }
//       if (is_deactivated !== undefined) {
//         fields.push(`is_deactivated = $${fields.length + 1}`);
//         values.push(is_deactivated);
//       }
    
//       if (fields.length === 0) {
//         throw new Error('No fields to update');
//       }
    
//       values.push(category_id);
//       query += fields.join(', ') + ` WHERE category_id = $${fields.length + 1} RETURNING *`;
    
//       const result = await client.query(query, values);
//       return result.rows[0];
//     },
    
//     deleteCategory: async (_, { category_id }) => {
//       const result = await client.query('DELETE FROM corporate_category WHERE category_id = $1', [category_id]);
//       return result.rowCount > 0;
//     },

    
//     updateDeliveryStatus: async (_, { orderId, orderIndex, status }) => {
//       try {
//         // Validate status
//         const validStatuses = [
//           'Pending',
//           'Accepted',
//           'Shipped',
//           'Delivered',
//           'Cancelled by user',
//           'Cancelled by admin'
//         ];
        
//         if (!validStatuses.includes(status)) {
//           throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
//         }
        
//         // Check if the order exists
//         const orderCheck = await client.query(
//           'SELECT corporateorder_generated_id FROM corporate_orders WHERE corporateorder_generated_id = $1',
//           [orderId]
//         );
        
//         if (orderCheck.rows.length === 0) {
//           throw new Error('Order not found');
//         }
        
//         // Get the order detail by order ID and index
//         const orderDetailsQuery = await client.query(
//           'SELECT order_detail_id FROM corporateorder_details WHERE corporateorder_generated_id = $1 ORDER BY order_detail_id LIMIT 1 OFFSET $2',
//           [orderId, orderIndex]
//         );
        
//         if (orderDetailsQuery.rows.length === 0) {
//           throw new Error('Order detail not found');
//         }
        
//         const orderDetailId = orderDetailsQuery.rows[0].order_detail_id;
        
//         // Update ONLY the delivery_status in the corporateorder_details table
//         const updateQuery = `
//           UPDATE corporateorder_details 
//           SET delivery_status = $1
//           WHERE order_detail_id = $2
//           RETURNING *
//         `;
        
//         const result = await client.query(updateQuery, [status, orderDetailId]);
        
//         if (result.rows.length === 0) {
//           throw new Error('Failed to update order detail');
//         }
        
//         // Get the updated order with all its details
//         const updatedOrderQuery = `
//           SELECT 
//             co.*,
//             c.customer_name,
//             c.customer_phonenumber,
//             json_agg(
//               json_build_object(
//                 'order_detail_id', cod.order_detail_id,
//                 'category_name', cat.category_name,
//                 'quantity', cod.quantity,
//                 'active_quantity', cod.active_quantity,
//                 'processing_date', cod.processing_date,
//                 'delivery_status', cod.delivery_status
//               )
//             ) as order_details
//           FROM corporate_orders co 
//           JOIN customer c ON co.customer_generated_id = c.customer_generated_id
//           JOIN corporateorder_details cod ON co.corporateorder_generated_id = cod.corporateorder_generated_id
//           LEFT JOIN corporate_category cat ON cod.category_id = cat.category_id
//           WHERE co.corporateorder_generated_id = $1
//           GROUP BY co.corporateorder_id, co.corporateorder_generated_id, c.customer_name, c.customer_phonenumber
//         `;
        
//         const updatedOrder = await client.query(updatedOrderQuery, [orderId]);
        
//         if (updatedOrder.rows.length === 0) {
//           throw new Error('Failed to retrieve updated order');
//         }
        
//         return updatedOrder.rows[0];
//       } catch (error) {
//         console.error("Error in updateDeliveryStatus:", error);
//         throw error;
//       }
//     }
//   ,



//     updateCorporateOrderStatus : async (_, { id, status }) => {
//       try {
//         const validStatuses = [
//           'Pending',
//           'Confirmed',
//           'Active',
//           'Completed',
//           'Cancelled by user',
//           'Cancelled by admin'
//         ];
    
//         if (!validStatuses.includes(status)) {
//           throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
//         }
    
//         const result = await client.query(
//           'UPDATE corporate_orders SET corporate_order_status = $1 WHERE corporateorder_generated_id = $2 RETURNING *',
//           [status, id]
//         );
    
//         if (result.rows.length === 0) {
//           throw new Error('Order not found');
//         }
    
//         return result.rows[0];
//       } catch (error) {
//         console.error("Error in updateCorporateOrderStatus:", error);
//         throw error;
//       }
//     }


//     ,



    
//   }



// };
// module.exports = { typeDefs, resolvers };