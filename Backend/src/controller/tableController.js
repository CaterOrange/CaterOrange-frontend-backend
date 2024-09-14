const client = require('../config/dbConfig');
const logger = require('../config/logger');
const {
    createCustomerTableQuery,
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
    createEventAddressTableQuery
} = require('../utils/tableSchema');

const createTables = async () => {
    try {
        // Create tables with no foreign key dependencies first
        try {
            await client.query(createGroupsTableQuery());
            console.log('Groups table created successfully');
        } catch (error) {
            console.error('Error creating Groups table:', error.message);
            logger.error('Error creating Groups table:', error.stack);
        }

        try {
            await client.query(createCategoryTableQuery());
            console.log('Category table created successfully');
        } catch (error) {
            console.error('Error creating Category table:', error.message);
            logger.error('Error creating Category table:', error.stack);
        }

        try {
            await client.query(createCustomerTableQuery());
            console.log('Customer table created successfully');
        } catch (error) {
            console.error('Error creating Customer table:', error.message);
            logger.error('Error creating Customer table:', error.stack);
        }

        try {
            await client.query(createVendorsTableQuery());
            console.log('Vendors table created successfully');
        } catch (error) {
            console.error('Error creating Vendors table:', error.message);
            logger.error('Error creating Vendors table:', error.stack);
        }

        try {
            await client.query(createDriversTableQuery());
            console.log('Drivers table created successfully');
        } catch (error) {
            console.error('Error creating Drivers table:', error.message);
            logger.error('Error creating Drivers table:', error.stack);
        }

        try {
            await client.query(createAddressesTableQuery());
            console.log('Addresses table created successfully');
        } catch (error) {
            console.error('Error creating Addresses table:', error.message);
            logger.error('Error creating Addresses table:', error.stack);
        }

        try {
            await client.query(createEventAddressTableQuery());
            console.log('Event Address table created successfully');
        } catch (error) {
            console.error('Error creating Event Address table:', error.message);
            logger.error('Error creating Event Address table:', error.stack);
        }

        try {
            await client.query(createAllProductsTableQuery());
            console.log('All Products table created successfully');
        } catch (error) {
            console.error('Error creating All Products table:', error.message);
            logger.error('Error creating All Products table:', error.stack);
        }

        // Now create tables that reference the above tables via foreign keys
        try {
            await client.query(createEventCartTableQuery());
            console.log('Event Cart table created successfully');
        } catch (error) {
            console.error('Error creating Event Cart table:', error.message);
            logger.error('Error creating Event Cart table:', error.stack);
        }

        try {
            await client.query(createCorporateCartTableQuery());
            console.log('Corporate Cart table created successfully');
        } catch (error) {
            console.error('Error creating Corporate Cart table:', error.message);
            logger.error('Error creating Corporate Cart table:', error.stack);
        }

        try {
            await client.query(createCorporateOrdersTableQuery());
            console.log('Corporate Orders table created successfully');
        } catch (error) {
            console.error('Error creating Corporate Orders table:', error.message);
            logger.error('Error creating Corporate Orders table:', error.stack);
        }

        try {
            await client.query(createEventOrdersTableQuery());
            console.log('Event Orders table created successfully');
        } catch (error) {
            console.error('Error creating Event Orders table:', error.message);
            logger.error('Error creating Event Orders table:', error.stack);
        }

        try {
            await client.query(createCorporateOrderDetailsTableQuery());
            console.log('Corporate Order Details table created successfully');
        } catch (error) {
            console.error('Error creating Corporate Order Details table:', error.message);
            logger.error('Error creating Corporate Order Details table:', error.stack);
        }

        try {
            await client.query(createEventOrderDetailsTableQuery());
            console.log('Event Order Details table created successfully');
        } catch (error) {
            console.error('Error creating Event Order Details table:', error.message);
            logger.error('Error creating Event Order Details table:', error.stack);
        }

        try {
            await client.query(createCorporatePaymentTableQuery());
            console.log('Corporate Payment table created successfully');
        } catch (error) {
            console.error('Error creating Corporate Payment table:', error.message);
            logger.error('Error creating Corporate Payment table:', error.stack);
        }

        try {
            await client.query(createEventPaymentTableQuery());
            console.log('Event Payment table created successfully');
        } catch (error) {
            console.error('Error creating Event Payment table:', error.message);
            logger.error('Error creating Event Payment table:', error.stack);
        }

        try {
            await client.query(createCorporateOrderMediaTableQuery());
            console.log('Corporate Order Media table created successfully');
        } catch (error) {
            console.error('Error creating Corporate Order Media table:', error.message);
            logger.error('Error creating Corporate Order Media table:', error.stack);
        }

        try {
            await client.query(createEventOrderMediaTableQuery());
            console.log('Event Order Media table created successfully');
        } catch (error) {
            console.error('Error creating Event Order Media table:', error.message);
            logger.error('Error creating Event Order Media table:', error.stack);
        }
    } catch (error) {
        console.error('Error in creating tables process:', error.message);
        logger.error('Error in creating tables process:', error.stack);
    }
}

module.exports = {
    createTables
}