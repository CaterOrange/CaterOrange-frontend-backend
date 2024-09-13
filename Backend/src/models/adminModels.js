const { DB_COMMANDS} = require('../utils/queries.js');
const client = require('../config/dbConfig.js');
const getAllCustomers = async () => {
    return client.query(DB_COMMANDS.GET_ALL_CUSTOMERS);
  }
  
  const getCustomerById = async (userId) => {
    return client.query(DB_COMMANDS.GET_CUSTOMER_BY_ID, [userId]);
  }
  const deleteCustomerById = async (userId) => {
    return client.query(DB_COMMANDS.DELETE_CUSTOMER, [userId]);
  }

  const updateUser = async (id, fields, values) => {
    let query = DB_COMMANDS.UPDATE_USER + ' ' + fields.join(', ') + ' WHERE customer_id = $' + (fields.length + 1);
    return client.query(query, [...values, id]);
  }

module.exports = {
    getAllCustomers,
    getCustomerById,
    deleteCustomerById,
    updateUser
}