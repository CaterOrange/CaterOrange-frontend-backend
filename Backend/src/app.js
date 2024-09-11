const express = require('express');
const client = require('./config/dbConfig');
const logger = require('./config/logger');
const { createTables } = require('./controller/tableController');
const { createDatabase } = require('./config/config');
require('dotenv').config();
const allRoutes = require('./routes/customerRoutes.js');

const app = express();
app.use(express.json());


const initializeApp = async () => {
  try {
    await createDatabase();
    logger.info('Database created or already exists');

    await client.connect();
    logger.info('Connected to the Caterorange DB');

    await createTables();
    logger.info('Tables created successfully');

    app.use(express.json());

    app.listen(process.env.PORT, () => {
      logger.info(`Server is running on port ${process.env.PORT}`);
    });
  } catch (err) {
    logger.error('Initialization error:', err.message);
    process.exit(1);
  }
};

initializeApp();
app.use('/', allRoutes);
