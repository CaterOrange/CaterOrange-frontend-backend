const { ApolloServer, gql } = require('apollo-server');
const { GraphQLScalarType, Kind } = require('graphql');
const client = require('../../config/dbConfig');

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
      category_media: String!
      is_deactivated: Boolean
      closure_time: String
    ): Category!
    updateCategory(
      category_id: Int, 
      category_name: String,
      category_description: String, 
      category_price: Int
      is_deactivated: Boolean
      closure_time: String
    ): Category!
    deleteCategory(category_id: Int!): Boolean!
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
    // Get all orders
    const ordersResult = await client.query(
      `SELECT co.*, c.customer_name, c.customer_phonenumber 
       FROM corporate_orders co 
       JOIN customer c ON co.customer_generated_id = c.customer_generated_id 
       ORDER BY co.ordered_at DESC`,
    );
    
    // Get all category mappings
    const categoriesResult = await client.query(
      `SELECT category_id, category_name FROM corporate_category`
    );
    
    // Create category lookup map
    const categoryMap = {};
    categoriesResult.rows.forEach(cat => {
      categoryMap[cat.category_id] = cat.category_name;
    });
    
    // Process each order to include category names
    const processedOrders = ordersResult.rows.map(order => {
      // Parse order_details regardless of whether it's a single order or multiple
      try {
        // Handle string format (JSON)
        if (typeof order.order_details === 'string') {
          const parsedDetails = JSON.parse(order.order_details);
          // Process array of order details
          const detailsWithCategories = parsedDetails.map(detail => ({
            ...detail,
            category_name: categoryMap[detail.category_id] || 'Unknown Category'
          }));
          // Keep original string format but with updated content
          order.order_details = JSON.stringify(detailsWithCategories);
        } 
        // Handle array format (already parsed)
        else if (Array.isArray(order.order_details)) {
          order.order_details = order.order_details.map(detail => ({
            ...detail,
            category_name: categoryMap[detail.category_id] || 'Unknown Category'
          }));
        }
        // Add category_name at order level for easy reference
        const firstDetail = typeof order.order_details === 'string' 
          ? JSON.parse(order.order_details)[0]
          : order.order_details[0];
          
        if (firstDetail && firstDetail.category_id) {
          order.category_name = categoryMap[firstDetail.category_id] || 'Unknown Category';
        }
      } catch (error) {
        console.error(`Failed to process order ${order.corporateorder_generated_id}:`, error);
      }
      
      return order;
    });
    
    return processedOrders;
  },
  getTodayCorporateOrders: async () => {
    // First get orders
    const ordersResult = await client.query(
      `SELECT co.*, c.customer_name, c.customer_phonenumber
       FROM corporate_orders co
       JOIN customer c ON co.customer_generated_id = c.customer_generated_id
       ORDER BY co.ordered_at DESC`,
    );
  
    console.log("Fetched Orders:", ordersResult.rows);
  
    // Get all category mappings
    const categoriesResult = await client.query(
      `SELECT category_id, category_name FROM corporate_category`
    );
  
    // Create category lookup map
    const categoryMap = {};
    categoriesResult.rows.forEach(cat => {
      categoryMap[cat.category_id] = cat.category_name;
    });
  
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    console.log("Today's Date:", today);
  
    // Add category names and filter by processing_date
    const filteredOrders = ordersResult.rows
      .map(order => {
        console.log("Processing Order ID:", order.order_id);
  
        // Check if order_details exists
        if (!order.order_details) {
          console.log(`Order ID ${order.order_id} has no order_details`);
          return null;
        }
  
        // If order_details is a string, parse it
        if (typeof order.order_details === "string") {
          try {
            order.order_details = JSON.parse(order.order_details);
            console.log("Parsed order_details:", order.order_details);
          } catch (error) {
            console.error(`Error parsing order_details for Order ID ${order.order_id}:`, error);
            return null;
          }
        }
  
        // Ensure order_details is an array
        if (!Array.isArray(order.order_details)) {
          console.log(`Order ID ${order.order_id} has invalid order_details format:`, order.order_details);
          return null;
        }
  
        // Log each processing_date before filtering
        order.order_details.forEach(detail => {
          console.log(`Order ID ${order.order_id} - Processing Date:`, detail.processing_date);
        });
  
        // Check if any order detail has processing_date as current date
        const hasTodayProcessing = order.order_details.some(detail => detail.processing_date === today);
  
        if (!hasTodayProcessing) {
          console.log(`Order ID ${order.order_id} does not have today's processing_date`);
          return null;
        }
  
        // Add category names to each order detail
        order.order_details = order.order_details.map(detail => ({
          ...detail,
          category_name: categoryMap[detail.category_id] || 'Unknown Category'
        }));
  
        return order;
      })
      .filter(order => order !== null); // Remove null entries
  
    console.log("Filtered Orders:", filteredOrders);
    return filteredOrders;
  },
  
  // getTodayCorporateOrders: async () => {
  //   // First get orders
  //   const ordersResult = await client.query(
  //     `SELECT co.*, c.customer_name, c.customer_phonenumber
  //      FROM corporate_orders co
  //      JOIN customer c ON co.customer_generated_id = c.customer_generated_id
  //      WHERE DATE(co.ordered_at) = CURRENT_DATE
  //      ORDER BY co.ordered_at DESC`,
  //   );
  
  //   // Get all category mappings
  //   const categoriesResult = await client.query(
  //     `SELECT category_id, category_name FROM corporate_category`
  //   );
  
  //   // Create category lookup map
  //   const categoryMap = {};
  //   categoriesResult.rows.forEach(cat => {
  //     categoryMap[cat.category_id] = cat.category_name;
  //   });
  
  //   // Filter orders with order_details having processing_date as current date
  //   const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  //   console.log("Today:", today);
  //   // Add category names and filter by processing_date
  //   const filteredOrders = ordersResult.rows
  //     .filter(order => {
  //       if (!order.order_details || !Array.isArray(order.order_details)) {
  //         return false;
  //       }
  //       // Check if any order detail has processing_date as current date
  //       return order.order_details.some(detail => {
  //         console.log("Processing Date:", detail.processing_date);
  //         return detail.processing_date === today;
  //       });
  //     })
  //     .map(order => {
  //       // Add category names to each order detail
  //       if (order.order_details && Array.isArray(order.order_details)) {
  //         order.order_details = order.order_details.map(detail => {
  //           return {
  //             ...detail,
  //             category_name: categoryMap[detail.category_id] || 'Unknown Category'
  //           };
  //         });
  //       }
  //       return order;
  //     });
  
  //   return filteredOrders;
  // },
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
    // updateCorporateOrderStatus: async (_, { id, status }) => {
    //   const result = await client.query(
    //     'UPDATE corporate_orders SET corporate_order_status = $1 WHERE corporateorder_generated_id = $2 RETURNING *',
    //     [status, id]
    //   );updateCorporateOrderStatus
    //   return result.rows[0];
    // },
    createCategory: async (_, { category_name, category_description, category_price, category_media, closure_time, is_deactivated }) => {
      const result = await client.query(
        'INSERT INTO corporate_category (category_name, category_description, category_price, category_media, closure_time, addedat, is_deactivated) VALUES ($1, $2, $3, $4, $5, NOW(), $6) RETURNING *',
        [category_name, category_description, category_price, category_media, closure_time, is_deactivated]
      );
      return result.rows[0];
    },
    
    updateCategory: async (_, { category_id, category_name, category_description, category_price, closure_time, is_deactivated }) => {
      const fields = [];
      const values = [];
      let query = 'UPDATE corporate_category SET ';
    
      if (category_name) {
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
      if (closure_time !== undefined) {
        fields.push(`closure_time = $${fields.length + 1}`);
        values.push(closure_time);
      }
      if (is_deactivated !== undefined) {
        fields.push(`is_deactivated = $${fields.length + 1}`);
        values.push(is_deactivated);
      }
    
      if (fields.length === 0) {
        throw new Error('No fields to update');
      }
    
      values.push(category_id);
      query += fields.join(', ') + ` WHERE category_id = $${fields.length + 1} RETURNING *`;
    
      const result = await client.query(query, values);
      return result.rows[0];
    },
    
    deleteCategory: async (_, { category_id }) => {
      const result = await client.query('DELETE FROM corporate_category WHERE category_id = $1', [category_id]);
      return result.rowCount > 0;
    },
    updateDeliveryStatus : async (_, { orderId, orderIndex, status }) => {
      try {
        // First, get the current order details
        const currentOrderQuery = await client.query(
          'SELECT order_details FROM corporate_orders WHERE corporateorder_generated_id = $1',
          [orderId]
        );
        
        if (currentOrderQuery.rows.length === 0) {
          throw new Error('Order not found');
        }
        
        const orderDetails = Array.isArray(currentOrderQuery.rows[0].order_details)
          ? currentOrderQuery.rows[0].order_details
          : JSON.parse(currentOrderQuery.rows[0].order_details);
        
        // Validate orderIndex
        if (orderIndex < 0 || orderIndex >= orderDetails.length) {
          throw new Error('Invalid order index');
        }
        
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
        
        // Create a new object for the updated item
        const updatedOrderDetails = orderDetails.map((item, index) => {
          if (index === orderIndex) {
            return { 
              ...item, 
              delivery_status: status,
              [`${status.toLowerCase()}_at`]: new Date().toISOString()
            };
          }
          return item;
        });
        
        // Update order details in database
        const updateQuery = `
          UPDATE corporate_orders 
          SET order_details = $1
          WHERE corporateorder_generated_id = $2 
          RETURNING *
        `;
        
        const result = await client.query(updateQuery, [
          JSON.stringify(updatedOrderDetails),
          orderId
        ]);
        
        return result.rows[0];
      } catch (error) {
        console.error("Error in updateDeliveryStatus:", error);
        throw error;
      }
    },
    
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
  }

   






};
module.exports = { typeDefs, resolvers };
