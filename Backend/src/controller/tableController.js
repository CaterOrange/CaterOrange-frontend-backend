const client = require('../config/dbConfig');
const logger = require('../config/logger');
const { createCustomerTableQuery,
    createVendorsTableQuery,
    createDriversTableQuery,
    createCorporatePaymentTableQuery,
    createEventPaymentTableQuery,
    createCorporateOrdersTableQuery,
    createCorporateOrderDetailsTableQuery,
    createEventOrdersTableQuery,
    createEventOrderDetailsTableQuery,
    createCategoryTableQuery,
    createGroupsTableQuery,
    createCorporateOrderMediaTableQuery,
    createEventOrderMediaTableQuery,
    createAddressesTableQuery,
    createEventCartTableQuery,
    createCorporateCartTableQuery,
    createAllProductsTableQuery,
    createEventAddressTableQuery} = require('../utils/tableSchema');
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
        await client.query(createVendorsTableQuery());
        console.log('Vendors table created successfully');
      } catch (error) {
        console.error('Error creating Vendors table:', error);
      }
      try {
        await client.query(createDriversTableQuery());
        console.log('Drivers table created successfully');
      } catch (error) {
        console.error('Error creating Drivers table:', error);
      }
      
  
      try {
        await client.query(createCategoryTableQuery());
        console.log('Category table created successfully');
      } catch (error) {
        console.error('Error creating Category table:', error);
      }
      try{
        await client.query(createAllProductsTableQuery());
        console.log("All products table create successfully");
      }
      catch(error){
        console.error('Error creating All products table',error);
      }
      try{
        await client.query(createEventAddressTableQuery());
        console.log("Event address table create successfully");
      }
      catch(error){
        console.error('Error creating Event address table',error);
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
        await client.query(createEventOrderDetailsTableQuery());
        console.log('Event Order Details table created successfully');
      } catch (error) {
        console.error('Error creating Event Order Details table:', error);
      }
      try {
        await client.query(createCorporatePaymentTableQuery());
        console.log('Corporate Payment table created successfully');
      } catch (error) {
        console.error('Error creating Payment table:', error);
      }
      try {
        await client.query(createEventPaymentTableQuery());
        console.log('Event Payment table created successfully');
      } catch (error) {
        console.error('Error creating Payment table:', error);
      }
          try {
            await client.query(createCorporateOrderMediaTableQuery());
            console.log('Corporate Order Media table created successfully');
          } catch (error) {
            console.error('Error creating Corporate Order Media table:', error);
          }
      
          try {
            await client.query(createEventOrderMediaTableQuery());
            console.log('Event Order Media table created successfully');
          } catch (error) {
            console.error('Error creating Event Order Media table:', error);
          }

          try {
            await client.query(createAddressesTableQuery());
            console.log('Addresses table created successfully');
          } catch (error) {
            console.error('Error creating Addresses table:', error);
          }
      
        }
    module.exports =
    {
        createTables
    }