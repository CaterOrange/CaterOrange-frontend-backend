const client = require('../config/dbConfig');
const logger = require('../config/logger');
const { createDatabase } = require('../config/config');
const { createTables } = require('../controller/tableController');
const { fetchAndInsertCSVData } = require('../../products');

const initDatabase = async () => {
  try {
    await createDatabase();
    logger.info('Database created or already exists');

    await client.connect();
    logger.info('Connected to the Caterorange DB');

    await createTables();
    logger.info('Tables created successfully');

    await fetchAndInsertCSVData();
    logger.info('CSV data fetched and inserted successfully');

    return client;
  } catch (error) {
    logger.error('Database initialization error:', error.message);
    throw error;
  }
};

module.exports = { initDatabase };