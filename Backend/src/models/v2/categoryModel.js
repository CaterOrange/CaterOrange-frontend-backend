
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
const getClosureTimeByCategoryId = async (categoryId) => {
    const query = `
        SELECT closure_time 
        FROM corporate_category 
        WHERE category_id = $1
    `;
    const { rows } = await client.query(query, [categoryId]); // Use `rows`, not `result`
    return rows;
};

module.exports = {
    getCorporateCategories,
    getClosureTimeByCategoryId
}
