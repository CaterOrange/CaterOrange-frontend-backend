const logger = require('../config/logger.js');
const { DB_COMMANDS} = require('../utils/queries.js');
const client = require('../config/dbconfig.js');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.SECRET_KEY; 


const createaddress = async (customer_id,tag,pincode,line1,line2,location,ship_to_name,ship_to_phone_number) => {
  try {
      console.log('in model address')
      const locationArray = JSON.parse(location);
      const result = await client.query(
          DB_COMMANDS.CREATE_ADDRESS,
          [customer_id,tag,pincode,line1,line2,locationArray,ship_to_name,ship_to_phone_number]
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
    const result = await client.query(DB_COMMANDS.CUSTOMER_EMAIL_SELECT, [customer_email]);
    console.log(result.rows[0])
    return result.rows[0];  

} catch (err) {
    logger.error('Error querying the database for customer_email', { error: err.message });
    throw err;
}
}


const getUserIdFromToken = (token) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET); 
      console.log("decoded:",decoded);
      console.log(decoded.id);
      return decoded.id;
    } catch (error) {
      throw new Error('Invalid Token');
    }
  }


  const updateAddressById = async (address_id, tag, pincode, line1, line2) => {
    try {
      const query = `
        UPDATE address 
        SET tag = $1, pincode = $2, line1 = $3, line2 = $4 
        WHERE address_id = $5 
        RETURNING *;
      `;
      const values = [tag, pincode, line1, line2, address_id];
      const result = await client.query(query, values);
  
      return result.rows[0]; 
    } catch (error) {
      throw error;
    }
  };



module.exports={
    createaddress,
    select_default_address,
    getUserIdFromToken,
    updateAddressById,
}