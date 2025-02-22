// corporateOrderModel.js
const { DB_COMMANDS } = require('../../utils/queries.js');
const client = require('../../config/dbConfig.js');
const logger = require('../../config/logger.js');

const getCorporateCategories = async () => {
    try {
        const res = await client.query(DB_COMMANDS.GETCORPORATECATEGORY);
        logger.info('Corporate categories fetched successfully'); // Moved before return
        return res.rows;
    } catch (err) {
        logger.error('Error fetching categories from the database:', { error: err.message });
        throw new Error('Error fetching categories from the database');
    }
}

module.exports = {
    getCorporateCategories
}
