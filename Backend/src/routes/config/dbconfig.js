const {Client} = require('pg')
require('dotenv').config()

const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DBPORT, 
  });
  
  module.exports = client;