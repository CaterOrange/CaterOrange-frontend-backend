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

module.exports= {
    getCorporateCategories
}