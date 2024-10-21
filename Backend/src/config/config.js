const { Client } = require('pg');
require('dotenv').config();
const logger = require('./logger'); 
const { URL } = require('url');  // Import the URL module

const Client1 = new Client({
  connectionString: process.env.PG_DATABASE_URL, 
});

// Function to extract the database name from the connection string URL
const getDatabaseNameFromURL = (connectionString) => {
  try {
    const dbUrl = new URL(connectionString);
    return dbUrl.pathname.slice(1);  // Extracts the part after the "/" (i.e., the database name)
  } catch (err) {
    console.error('Invalid connection string', err);
    return null;
  }
};

const createDatabase = async () => {
  try {
    await Client1.connect();
    console.log("Connected to PostgreSQL server");

    const databaseName = getDatabaseNameFromURL(process.env.DATABASE_URL);
    
    if (!databaseName) {
      throw new Error("Could not extract the database name from the connection URL");
    }

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
