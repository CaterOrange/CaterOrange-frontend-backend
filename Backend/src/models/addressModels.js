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

const select_default_address = async (customer_email) => {
    try {
        console.log('in model default address');
        const result = await client.query(
            DB_COMMANDS.SELECT_NAME_PHONE,
            [customer_email]
        );
        console.log("answer",result.rows[0]);
        
        logger.info('Default address retrieved successfully');
        return result.rows[0];  
    } catch (err) {
        logger.error('Error retrieving default address data');
        throw err;
    }
}

module.exports={
    createaddress,
    select_default_address
}