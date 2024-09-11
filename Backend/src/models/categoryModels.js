const client = require('../config/dbConfig');
const { DB_COMMANDS } = require('../utils/queries');

const addCategory = async (categoryName, categoryMedia) => {
  const result = await client.query(DB_COMMANDS.ADD_CATEGORY, [categoryName, categoryMedia]);
  return result.rows[0];
};

module.exports = { addCategory };
