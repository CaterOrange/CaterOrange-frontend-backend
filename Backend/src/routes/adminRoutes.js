const { ApolloServer, gql } = require('apollo-server');
const { GraphQLScalarType, Kind } = require('graphql');
const client = require('../config/dbConfig.js');
const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'A custom DateTime scalar with formatted date and time',
  serialize(value) {
    // Handle different input types
    const date = value instanceof Date ? value : new Date(value);
    
    // Format to a readable date and time string
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

// JSON Scalar (from your original implementation)
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

// GraphQL Schema
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

  type Query {
    getAllCustomers: [Customer!]!
    getAllPayments: [Payment!]!
    getAllCategory: [Category!]!
    getAllEvents: [EventOrders!]!
    getAllOrders: [CorporateOrder!]!
    getAllItems: [ItemList!]!
    getAnalytics: Analytics!
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
    ): Category!
    updateCategory(
      category_id: Int, 
      category_name: String,
      category_description: String, 
      category_price: Int
    ): Category!
    deleteCategory(category_id: Int!): Boolean!
  }
`;

// Resolvers
const resolvers = {
  // Add custom scalar resolvers
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
      const result = await client.query('SELECT * FROM corporate_orders');
      return result.rows;
    },
    getAllItems: async () => {
      const result = await client.query('SELECT * FROM event_products');
      return result.rows;
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
    updateCorporateOrderStatus: async (_, { id, status }) => {
      const result = await client.query(
        'UPDATE corporate_orders SET corporate_order_status = $1 WHERE corporateorder_generated_id = $2 RETURNING *',
        [status, id]
      );
      return result.rows[0];
    },
    createCategory: async (_, { category_name, category_description, category_price, category_media }) => {
      const result = await client.query(
        'INSERT INTO corporate_category (category_name, category_description, category_price, category_media, addedat) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
        [category_name, category_description, category_price, category_media]
      );
      return result.rows[0];
    },
   
    updateCategory: async (_, { category_id, category_name, category_description, category_price }) => {
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
 

  


     updateOrderAcceptStatus : async (_, { orderId, orderIndex, status }) => {
      console.log("orderId:", orderId);
      try {
        const currentOrderQuery = await client.query(
          'SELECT order_details FROM corporate_orders WHERE corporateorder_generated_id = $1',
          [orderId]
        );
        
        if (currentOrderQuery.rows.length === 0) {
          throw new Error('Order not found');
        }
        
        // Parse the order details as JSON if it's a string
        const orderDetails = Array.isArray(currentOrderQuery.rows[0].order_details)
          ? currentOrderQuery.rows[0].order_details
          : JSON.parse(currentOrderQuery.rows[0].order_details);
        
        console.log("orderDetails:", orderDetails);
        
        // Validate orderIndex
        if (orderIndex < 0 || orderIndex >= orderDetails.length) {
          throw new Error('Invalid order index');
        }
        
        // Validate status
        const validStatuses = ['accepted', 'rejected', 'pending'];
        if (!validStatuses.includes(status)) {
          throw new Error('Invalid status. Must be accepted, rejected, or pending');
        }
        
        // Create a new array with the updated status
        const updatedOrderDetails = orderDetails.map((item, index) => {
          if (index === orderIndex) {
            return { ...item, accept_status: status };
          }
          return item;
        });
        
        // Check if all items are processed
        const allItemsProcessed = updatedOrderDetails.every(
          item => item.accept_status === 'accepted' || item.accept_status === 'rejected'
        );
        
        let updateQuery = `
          UPDATE corporate_orders 
          SET order_details = $1
        `;
        const queryParams = [JSON.stringify(updatedOrderDetails)];
        
        // if (allItemsProcessed) {
        //   const allAccepted = updatedOrderDetails.every(item => item.accept_status === 'accepted');
        //   const newOrderStatus = allAccepted ? 'accepted' : 'partially rejected';
        //   updateQuery += `, corporate_order_status = $2`;
        //   queryParams.push(newOrderStatus);
        // }
        

        if (allItemsProcessed) {
          const allAccepted = updatedOrderDetails.every(item => item.accept_status === 'accepted');
          const allRejected = updatedOrderDetails.every(item => item.accept_status === 'rejected');
          let newOrderStatus;
      
          if (allAccepted) {
              newOrderStatus = 'accepted';
          } else if (allRejected) {
              newOrderStatus = 'rejected';
          } else {
              newOrderStatus = 'partially rejected';
          }
      
          updateQuery += `, corporate_order_status = $2`;
          queryParams.push(newOrderStatus);
      }
      


        updateQuery += ` WHERE corporateorder_generated_id = $${queryParams.length + 1} RETURNING *`;
        queryParams.push(orderId);
    
        const result = await client.query(updateQuery, queryParams);
        console.log("result:", result);
        
        return result.rows[0];
      } catch (error) {
        console.error("Error in updateOrderAcceptStatus:", error);
        throw error;
      }
    },

     updateDeliveryStatus: async (_, { orderId, orderIndex, status }) => {
      try {
        // First, get the current order details
        const currentOrderQuery = await client.query(
          'SELECT order_details FROM corporate_orders WHERE corporateorder_generated_id = $1',
          [orderId]
        );
        
        if (currentOrderQuery.rows.length === 0) {
          throw new Error('Order not found');
        }
        
        // Create a new array from the order details
        // const orderDetails = [...currentOrderQuery.rows[0].order_details];
        const orderDetails = Array.isArray(currentOrderQuery.rows[0].order_details)
        ? currentOrderQuery.rows[0].order_details
        : JSON.parse(currentOrderQuery.rows[0].order_details);
      
        // Validate orderIndex
        if (orderIndex < 0 || orderIndex >= orderDetails.length) {
          throw new Error('Invalid order index');
        }
        
        // Validate status
        const validStatuses = ['processing', 'shipped', 'delivered'];
        if (!validStatuses.includes(status)) {
          throw new Error('Invalid status. Must be processing, shipped, or delivered');
        }
        
        // Validate the state transition
        const currentStatus = orderDetails[orderIndex].delivery_status || 'processing';
        const isValidTransition = (current, next) => {
          const transitions = {
            'processing': ['shipped'],
            'shipped': ['delivered'],
            'delivered': []
          };
          return transitions[current]?.includes(next);
        };

        if (!isValidTransition(currentStatus, status) && status !== 'processing') {
          throw new Error(`Invalid status transition from ${currentStatus} to ${status}`);
        }
        
        // Create a new object for the updated item
        const updatedOrderDetails = orderDetails.map((item, index) => {
          if (index === orderIndex) {
            return { 
              ...item, 
              delivery_status: status,
              // Add timestamp for status change
              [`${status}_at`]: new Date().toISOString()
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
    }



  },
};

module.exports = { typeDefs, resolvers };
