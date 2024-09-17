const client = require('../config/dbConfig');
const logger = require('../config/logger');
const { createCustomerTableQuery,
  createPaymentTableQuery,
  createCorporateOrdersTableQuery,
  createCorporateOrderDetailsTableQuery,
  createEventOrdersTableQuery,
  createCorporateCategoryTableQuery,
  createGroupsTableQuery,
  createAddressesTableQuery,
  createEventCartTableQuery,
  createCorporateCartTableQuery,
  createEventProductsTableQuery} = require('../utils/tableSchema');
    const createTables = async() => 
    {
      try {

        await client.query(createGroupsTableQuery());
        console.log('Groups table created successfully');
      } catch (error) {
        console.error('Error creating Groups table:', error);
      }

      try {
        await client.query(createCustomerTableQuery());
        console.log('Customer table created successfully');
      } catch (error) {
        console.error('Error creating Customer table:', error);
      } 

      try {
         await client.query(createAddressesTableQuery());
         console.log('Addresses table created successfully');
        } catch (error) {
         console.error('Error creating Addresses table:', error);
        }
      
  
      try {
        await client.query(createCorporateCategoryTableQuery());
        console.log('Category table created successfully');
      } catch (error) {
        console.error('Error creating Category table:', error);
      }
      try {
        await client.query(createEventCartTableQuery());
        console.log('Event Cart table created successfully');
      } catch (error) {
        console.error('Error creating Event Cart table:', error);
      }
  
      try {
        await client.query(createCorporateCartTableQuery());
        console.log('Corporate Cart table created successfully');
      } catch (error) {
        console.error('Error creating Corporate Cart table:', error);
      }
      try {
        await client.query(createEventProductsTableQuery());
        console.log('Event_products table created successfully');
      } catch (error) {
        console.error('Error creating Event_products table:', error);
      }
      try {
        await client.query(createCorporateOrdersTableQuery());
        console.log('Corporate Orders table created successfully');
      } catch (error) {
        console.error('Error creating Corporate Orders table:', error);
      }
  
      try {
        await client.query(createEventOrdersTableQuery());
        console.log('Event Orders table created successfully');
      } catch (error) {
        console.error('Error creating Event Orders table:', error);
      }
      try {
        await client.query(createCorporateOrderDetailsTableQuery());
        console.log('Corporate Order Details table created successfully');
      } catch (error) {
        console.error('Error creating Corporate Order Details table:', error);
      }
  
      try {
        await client.query(createPaymentTableQuery());
        console.log('Corporate Payment table created successfully');
      } catch (error) {
        console.error('Error  Payment table:', error);
      }
      
      
       
    }
 
    module.exports =
    {
        createTables
    }