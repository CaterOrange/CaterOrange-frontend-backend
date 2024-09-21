// corporateOrderModel.js
const { DB_COMMANDS } = require('../utils/queries.js');
const client = require('../config/dbConfig.js');
const logger = require('../config/logger.js');

const getCorporateCategories = async () => {
    try {
        const res = await client.query(DB_COMMANDS.GETCORPORATECATEGORY);
        return res.rows;
        logger.info('Corporate categories fetched successfully')
    } catch (err) {
        throw new Error('Error fetching categories from the database');
    }
}
const getcategoryname= async(categoryId)=>{
    try{
        const category_name= await client.query(DB_COMMANDS.GET_CATEGORY_NAME,[categoryId]);
        
        logger.info('category name fetched in model', category_name);
        return category_name.rows[0];
    }catch (err) {
        logger.error('Error fetching category_name', { error: err.message});
        throw err;
    }
  }
module.exports= {
    getCorporateCategories,
    getcategoryname
}