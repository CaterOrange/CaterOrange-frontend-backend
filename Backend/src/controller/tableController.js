const client = require('../config/dbConfig');
const logger = require('../config/logger');
const { createAddressesTableQuery,
    createCategoryTableQuery,
    createDeliveriesTableQuery,
    createDriversTableQuery,
    createItemsTableQuery,
    createGroupsTableQuery,
    createLogisticCompaniesTableQuery,
    createOrderDetailsTableQuery,
    createOrdersTableQuery,
    createPaymentTableQuery,
    createVendorsTableQuery,
    createOrderMediaTableQuery,
    createCustomerTableQuery} = require('../utils/tableSchema');
    const createTables = async() => 
    {
        try{
            await client.query(createCategoryTableQuery())
        }
        catch(err){
         logger.error('Error in creating category table',err.stack)
        }
        try{
            await client.query(createGroupsTableQuery())
        }
        catch(err){
         logger.error('Error in creating GROUPS table',err.stack)
        }
        try{
            await client.query(createCustomerTableQuery())
        }
        catch(err){
         logger.error('Error in creating Customer table',err.stack)
        }
        try{
            await client.query(createDeliveriesTableQuery())
        }
        catch(err){
         logger.error('Error in creating Deliveries table',err.stack)
        }
        try{
            await client.query(createItemsTableQuery())
        }
        catch(err){
         logger.error('Error in creating ITEMS table',err.stack)
        }
        try{
            await client.query(createAddressesTableQuery())
        }
        catch(err){
         logger.error('Error in creating Addresses table',err.stack)
        }
        try{
            await client.query(createLogisticCompaniesTableQuery())
        }
        catch(err){
         logger.error('Error in creating Logistics table',err.stack)
        }
        try{
            await client.query(createDriversTableQuery())
        }
        catch(err){
         logger.error('Error in creating Drivers table',err.stack)
        }
        try{
            await client.query(createVendorsTableQuery())
        }
        catch(err){
         logger.error('Error in creating Vendors table',err.stack)
        }
        try{
            await client.query(createPaymentTableQuery())
        }
        catch(err){
         logger.error('Error in creating Payments table',err.stack)
        }
        try{
            await client.query(createOrdersTableQuery())
        }
        catch(err){
         logger.error('Error in creating Orders table',err.stack)
        }
        try{
            await client.query(createOrderDetailsTableQuery())
        }
        catch(err){
         logger.error('Error in creating OrderDetails table',err.stack)
        }
        try{
            await client.query(createOrderMediaTableQuery())
        }
        catch(err){
         logger.error('Error in creating GROUPS table',err.stack)
        }
       
        

    }
    
    module.exports =
    {
        createTables
    }