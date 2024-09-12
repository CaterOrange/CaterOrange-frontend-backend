const categoryModel = require('../models/categoryModels');
const groupModel = require('../models/groupModels');
const logger = require('../config/logger');
const customerModel = require('../models/customerModels');

const addCategory = async (req, res) => {
  try {
    const { categoryName, categoryMedia } = req.body;
    const newCategory = await categoryModel.addCategory(categoryName, categoryMedia);
    res.status(201).json(newCategory);
  } catch (err) {
    logger.error('Error adding category:', err);
    res.status(500).send('Error adding category');
  }
};


const createGroup = async (req, res) => {
    try {
      const { groupLocation } = req.body;
      if (!/^(\(\d+(\.\d+)?,-\d+(\.\d+)?\))$/.test(groupLocation)) {
        return res.status(400).send('Invalid groupLocation format');
      }
      const newGroup = await groupModel.createGroup(groupLocation);
      res.status(201).json(newGroup);
    } catch (err) {
      logger.error('Error creating group:', err);
      res.status(500).send('Error creating group');
    }
  };
  

const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const deletedGroup = await groupModel.deleteGroup(groupId);
    res.status(200).json({message:'Group deleted successfully',deletedGroup});
  } catch (err) {
    logger.error('Error deleting group:', err);
    res.status(500).send('Error deleting group');
  }
};

const getAllGroups = async (req, res) => {
    try {
      const groups = await groupModel.getAllGroups();
      res.status(200).json(groups);
    } catch (err) {
      logger.error('Error fetching groups:', err);
      res.status(500).send('Error fetching groups');
    }
  };

 const getCustomers = async(req, res)=>{
    try {
      const result = await getAllCustomers();
      res.status(200).send(result.rows);
    } catch (err) {
      logger.error('Error:', err);
      res.status(500).send('Retrieve error');
    }
  };

  const getCustomerById = async(req, res)=> {
    const id = req.params.id;
    try {
      const result = await getCustomerById(id);
      res.status(200).send(result.rows);
    } catch (err) {
      logger.error('Error:', err);
      res.status(500).send('Retrieve error');
    }
  };

  const deleteCustomer = async (req, res)=> {
    const id = req.params.id;
    try {
     const result = await deleteCustomerById(id);
      res.status(200).send("Deleted");
    } catch (err) {
      logger.error('Error:', err);
      res.status(500).send('Error deleting user by id');
    }
  };

  const addItem = async (req, res) =>{
      try {
        const result=await additems(req.body);
        res.status(200).send("Items added successfully");
      } catch (err) {
        res.status(500).send("Error in adding Items");
      }
    };
    const deleteItem = async(req, res)=> {
      try {
        const id = parseInt(req.params.id);
        const result=await deleteitems(id);
        res.status(200).send("Items deleted successfully");
      } catch (err) {
        res.status(500).send("Error in deleting Item");
      }
    };
    const updateItem = async(req, res)=> {
      try {
        const id =parseInt(req.params.id);
        const result=await updateitems(id,req.body);
        res.status(200).send("Item updated successfully");
      } catch (err) {
        res.status(500).send("Error in updating Item");
      }
    }



module.exports = { addCategory, createGroup, deleteGroup,getAllGroups,getCustomers, deleteCustomer,addItem,deleteItem, updateItem };
