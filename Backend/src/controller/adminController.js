const logger = require('../config/logger');
const customerModel = require('../models/customerModels');
const adminModel = require('../models/adminModels')
 const getCustomers = async(req, res)=>{
    try {
    
      const result = await adminModel.getAllCustomers();
      res.status(200).send(result.rows);
    } catch (err) {
      logger.error('Error:', err);
      res.status(500).send('Retrieve error');
    }
  };

  const getCustomerById = async(req, res)=> {
    const id = req.params.id;
    try {
      const result = await adminModel.getCustomerById(id);
      res.status(200).send(result.rows);
    } catch (err) {
      logger.error('Error:', err);
      res.status(500).send('Retrieve error');
    }
  };

  const deleteCustomer = async (req, res)=> {
    const id = req.params.id;
    try {
     const result = await adminModel.deleteCustomerById(id);
      res.status(200).send("Deleted");
    } catch (err) {
      logger.error('Error:', err);
      res.status(500).send('Error deleting user by id');
    }
  };


    const updateUser =async(req, res) => {
      const id = req.params.id;
      const {customer_name,customer_phonenumber,customer_email,customer_address,wallet_amount,group_id} = req.body;

      const fields = [];
      const values = [];
  
      if (customer_name) fields.push('customer_name = $' + (fields.length + 1)), values.push(customer_name);
      if (customer_address) fields.push('customer_address = $' + (fields.length + 1)), values.push(customer_address);
      if (customer_email) fields.push('customer_email = $' + (fields.length + 1)), values.push(customer_email);
      if (customer_phonenumber) fields.push('customer_phonenumber = $' + (fields.length + 1)), values.push(customer_phonenumber);
      if (wallet_amount) fields.push('wallet_amount = $' + (fields.length + 1)), values.push(wallet_amount);
      if (group_id) fields.push('group_id = $' + (fields.length + 1)), values.push(group_id);
  
      if (fields.length === 0) {
        return res.status(400).send('No fields to update');
      }
  
      try {
        const result = await adminModel.updateUser(id,fields,values);
        if (result.rowCount === 0) {
          return res.status(404).send('User not found');
        }
        res.status(200).send('User updated');
      } catch (err) {
        logger.error('Error:', err);
        res.status(500).send('Internal server error');
      }
    }

module.exports = {updateUser,getCustomers, deleteCustomer,getCustomerById};