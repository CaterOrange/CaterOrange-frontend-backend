const client = require('../config/dbConfig');
const { DB_COMMANDS } = require('../utils/queries');

const createGroup = async (groupLocation) => {
  const result = await client.query(DB_COMMANDS.CREATE_GROUP, [groupLocation]);
  return result.rows[0];
};

const deleteGroup = async (groupId) => {
  const result = await client.query(DB_COMMANDS.DELETE_GROUP, [groupId]);
  return result.rows[0];
};

const getAllGroups = async () => {
    try {
      const result = await client.query(DB_COMMANDS.GET_ALL_GROUPS);
      return result.rows;
    } catch (err) {
      throw new Error(`Error fetching groups: ${err.message}`);
    }
  };
  

module.exports = { createGroup, deleteGroup,getAllGroups};
