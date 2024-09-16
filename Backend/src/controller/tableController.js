const client = require('../config/dbConfig');
const logger = require('../config/logger');
const {
  createCustomerTableQuery,
  createPaymentTableQuery,
  createCorporateOrdersTableQuery,
  createCorporateOrderDetailsTableQuery,
  createEventOrdersTableQuery,
  createCorporateCategoryTableQuery,
  createEventCategoryTableQuery,
  createGroupsTableQuery,
  createAddressesTableQuery,
  createEventCartTableQuery,
  createCorporateCartTableQuery,
  createEventProductsTableQuery,
  createAllProductsTableQuery
} = require('../utils/tableSchema');

const createTables = async () => {
  try {
    // Create Groups table
    await client.query(createGroupsTableQuery());
    logger.info('Groups table created successfully');

    // Create Customer table
    await client.query(createCustomerTableQuery());
    logger.info('Customer table created successfully');

    // Create Payment table
    await client.query(createPaymentTableQuery());
    logger.info('Payment table created successfully');

    // Create Corporate Orders table
    await client.query(createCorporateOrdersTableQuery());
    logger.info('Corporate Orders table created successfully');

    await client.query(createCorporateCategoryTableQuery());
    logger.info('Corporate Category table created successfully');
    // Create Corporate Order Details table
    await client.query(createCorporateOrderDetailsTableQuery());
    logger.info('Corporate Order Details table created successfully');

    // Create Event Orders table
    await client.query(createEventOrdersTableQuery());
    logger.info('Event Orders table created successfully');
    

    // Create Event Category table
    await client.query(createEventCategoryTableQuery());
    logger.info('Event Category table created successfully');

    // Create Addresses table
    await client.query(createAddressesTableQuery());
    logger.info('Addresses table created successfully');

    // Create Event Cart table
    await client.query(createEventCartTableQuery());
    logger.info('Event Cart table created successfully');

    // Create Corporate Cart table
    await client.query(createCorporateCartTableQuery());
    logger.info('Corporate Cart table created successfully');

    // Create Event Products table
    await client.query(createEventProductsTableQuery());
    logger.info('Event Products table created successfully');

    // Create All Products table
    await client.query(createAllProductsTableQuery());
    logger.info('All Products table created successfully');

  } catch (error) {
    logger.error('Error creating tables: ', error);
    throw error;
  }
};

module.exports = {
  createTables
};
