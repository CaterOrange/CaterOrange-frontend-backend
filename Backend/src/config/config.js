const { Client } = require('pg');
require('dotenv').config();
const logger = require('./logger'); // Ensure this path is correct

const Client1 = new Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  password: process.env.PG_PASSWORD
});

const createDatabase = async () => {
  try {
    await Client1.connect();
    console.log("Connected to PostgreSQL server");

    const databaseName = process.env.DATABASE;

    // Query to check if the database exists
    const checkDatabaseExistsQuery = `
      SELECT 1
      FROM pg_database
      WHERE datname = $1;
    `;
   
    const result = await Client1.query(checkDatabaseExistsQuery, [databaseName]);

    if (result.rowCount === 0) {
      console.log('Database does not exist. Creating database...');

      // Create the database
      const createDatabaseQuery =` CREATE DATABASE ${databaseName}`;
      await Client1.query(createDatabaseQuery);

      console.log('Database created successfully');
    } else {
      console.log('Database already exists');
    }
  } catch (err) {
    console.error('Error creating database:', err.message);
    logger.error('Error creating database:', err.stack);
  } finally {
    await Client1.end();
  }
};

module.exports = { createDatabase };