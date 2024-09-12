const client = require('../config/dbConfig');
const logger = require('../config/logger');
const { createCustomerTableQuery,
    createVendorsTableQuery,
    createLogisticCompaniesTableQuery,
    createDriversTableQuery,
    createCorporatePaymentTableQuery,
    createEventPaymentTableQuery,
    createCorporateOrdersTableQuery,
    createCorporateOrderDetailsTableQuery,
    createEventOrdersTableQuery,
    createEventOrderDetailsTableQuery,
    createCategoryTableQuery,
    createGroupsTableQuery,
    createDeliveriesTableQuery,
    createCorporateOrderMediaTableQuery,
    createEventOrderMediaTableQuery,
    createAddressesTableQuery,
    createEventCartTableQuery,
    createCorporateCartTableQuery,
    createEventMasterTableQuery,
    createQuantityTableQuery,
    createKgTableQuery,
    createLitreTableQuery,
    createKgQuantityTableQuery,
    createLitreQuantityTableQuery} = require('../utils/tableSchema');
    const createTables = async() => 
    {
        try {
            await client.query(createGroupsTableQuery());
            console.log('Groups table created successfully');
          } catch (error) {
            console.error('Error creating Groups table:', error);
          }
      
          try {
            await client.query(createCategoryTableQuery());
            console.log('Category table created successfully');
          } catch (error) {
            console.error('Error creating Category table:', error);
          }
      
          try {
            await client.query(createDeliveriesTableQuery());
            console.log('Deliveries table created successfully');
          } catch (error) {
            console.error('Error creating Deliveries table:', error);
          }
      
          try {
            await client.query(createVendorsTableQuery());
            console.log('Vendors table created successfully');
          } catch (error) {
            console.error('Error creating Vendors table:', error);
          }
      
          try {
            await client.query(createLogisticCompaniesTableQuery());
            console.log('Logistic Companies table created successfully');
          } catch (error) {
            console.error('Error creating Logistic Companies table:', error);
          }
      
          try {
            await client.query(createDriversTableQuery());
            console.log('Drivers table created successfully');
          } catch (error) {
            console.error('Error creating Drivers table:', error);
          }
      
          try {
            await client.query(createCustomerTableQuery());
            console.log('Customer table created successfully');
          } catch (error) {
            console.error('Error creating Customer table:', error);
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
            await client.query(createEventMasterTableQuery());
            console.log('Event Master table created successfully');
          } catch (error) {
            console.error('Error creating Event Master table:', error);
          }
      
          try {
            await client.query(createQuantityTableQuery());
            console.log('Quantity table created successfully');
          } catch (error) {
            console.error('Error creating Quantity table:', error);
          }
      
          try {
            await client.query(createKgTableQuery());
            console.log('Kg table created successfully');
          } catch (error) {
            console.error('Error creating Kg table:', error);
          }
      
          try {
            await client.query(createLitreTableQuery());
            console.log('Litre table created successfully');
          } catch (error) {
            console.error('Error creating Litre table:', error);
          }
      
          try {
            await client.query(createKgQuantityTableQuery());
            console.log('Kg Quantity table created successfully');
          } catch (error) {
            console.error('Error creating Kg Quantity table:', error);
          }
      
          try {
            await client.query(createLitreQuantityTableQuery());
            console.log('Litre Quantity table created successfully');
          } catch (error) {
            console.error('Error creating Litre Quantity table:', error);
          }
       
    }
 
    module.exports =
    {
        createTables
    }