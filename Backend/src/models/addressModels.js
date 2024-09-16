const logger = require('../config/logger.js');
const { DB_COMMANDS} = require('../utils/queries.js');
const client = require('../config/dbConfig.js');

const createaddress = async (customer_id,tag,pincode,line1,line2,location,ship_to_name,ship_to_phone_number) => {
    try {
        console.log('in model address')
        const result = await client.query(
            DB_COMMANDS.CREATE_ADDRESS,
            [customer_id,tag,pincode,line1,line2,location,ship_to_name,ship_to_phone_number]
        );
        logger.info('address added successfully');
        return result.rows[0];  
    } catch (err) {
        logger.error('Error adding address data');
        throw err;
    }
};
module.exports={
    createaddress
}