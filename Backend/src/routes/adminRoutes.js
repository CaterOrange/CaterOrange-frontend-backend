const { ApolloServer, gql } = require('apollo-server');
const { GraphQLScalarType, Kind } = require('graphql');
const client = require('../config/dbConfig.js');
const { cli } = require('winston/lib/winston/config/index.js');
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
 scalar JSON
  type Analytics 
  {
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
    corporateorder_generated_id: String!
    customer_id: Int
    order_details: JSON!
    total_amount:Int
    paymentid:Int
     order_at: String
    payment_status: String
    corporate_order_status:String
  }

  type Payment {
    paymentid: ID!
    paymenttype: String
    merchantreferenceid: String
    phonepereferenceid: String
    From: String
    instrument: String
    creationdate: String
    transactiondate: String
    settlementdate: String
    bankreferenceno: String
    amount: Int
    fee: Float
    igst: Float
    cgst: Float
    sgst: Float
    customer_id: Int
    paymentdate: String
  }
  type Category
  {
    category_id:Int,
    category_name:String,
    category_description:String,
    category_price:Int,
    category_media:String,
    addedat:String
  }
  type EventOrders
  {
    eventorder_generated_id:String,
    customer_id:Int,
    order_at: String,
    delivery_status:String,
    payment_id:Int,
    delivery_details:JSON,
    event_order_details:JSON,
    payment_status:String,
    event_order_status:String,
    total_amount:Int  
  }
  type ItemList {
    productid: String!
    productname: String!
    category_name: String!
    price_category: String
    isdual: Boolean
    plate_units: String
    priceperunit: Float
    minunitsperplate: Int
    wtorvol_units: String
    price_per_wtorvol_units: Float
    min_wtorvol_per_plate: Int  # Changed to Int for consistency
}
  type Query {
    getAllCustomers: [Customer!]!
    getAllPayments: [Payment!]!
    getAllCategory:[Category!]!
    getAllEvents:[EventOrders!]!
    getAllOrders:[CorporateOrder!]!
    getAllItems:[ItemList]
     getAnalytics: Analytics!
  }

  type Mutation {
    updateCustomer(id: ID!, name: String, email: String, phoneNumber: String): Customer!
    toggleDeactivation(id: ID!, isdeactivated: Boolean!): Customer!
    updateEventOrderStatus(id: ID!, status: String!): EventOrders!
    updateCorporateOrderStatus(id: ID!, status: String!): CorporateOrder!
    createCategory(category_name: String!, category_description:String!,category_price: Int!,category_media:String!): Category!
    updateCategory(category_id: Int, category_name: String,category_description:String, category_price: Int): Category!
    deleteCategory(category_id: Int!): Boolean!
  }
`;

// Resolvers
const resolvers = {
  Query: {
    getAllCustomers: async () => {
      const result = await client.query('SELECT * FROM customer');
      return result.rows;
    },
    getAllPayments: async () => {
      try {
        const result = await client.query('SELECT * FROM payment');
        console.log('Fetched payments:', result.rows); // Add this line for debugging
        return result.rows;
      } catch (err) {
        console.error('Error retrieving payments:', err); // Add this line for debugging
        throw new Error('Error retrieving payments');
      }
    },
    getAllCategory: async () => {
      const result = await client.query('SELECT * FROM corporate_category');
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
          const totalOrders =parseInt( corporateOrders.rows[0].count) +parseInt( eventOrders.rows[0].count);
  
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
    createCategory: async (_, { category_name, category_description,category_price,category_media }) => {
      const result = await client.query(
        'INSERT INTO corporate_category (category_name,category_description,category_price,category_media,addedat) VALUES ($1, $2,$3,$4, NOW()) RETURNING *',
        [category_name,category_description,category_price,category_media]
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


  },
};

module.exports = { typeDefs, resolvers };
