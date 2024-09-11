const categoryModel = require('../models/categoryModels');
const groupModel = require('../models/groupModels');
const logger = require('../config/logger');
const customerModel = require('../models/customerModels')

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



module.exports = { addCategory, createGroup, deleteGroup,getAllGroups };
