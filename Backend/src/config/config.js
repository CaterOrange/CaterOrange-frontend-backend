const { Client } = require('pg');
require('dotenv').config();
const logger = require('./logger'); 

const Client1 = new Client({
  connectionString: process.env.PG_DATABASE_URL
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
      WHERE LOWER(datname) = LOWER($1);
    `;
   
    const result = await Client1.query(checkDatabaseExistsQuery, [databaseName]);

    if (result.rowCount === 0) {
      console.log('Database does not exist. Creating database...');

      // Create the database
      const createDatabaseQuery = `CREATE DATABASE "${databaseName}"`;
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
