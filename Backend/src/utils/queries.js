const DB_COMMANDS = {
    CUSTOMER_INSERT: `
        INSERT INTO customer 
        (customer_name, customer_email, customer_password, customer_phonenumber, access_token) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *`,  
    CUSTOMER_EMAIL_SELECT: `
        SELECT * FROM customer 
        WHERE customer_email = $1`,
    CUSTOMER_SET_PASSWORD:`UPDATE customer 
        SET customer_password = $2, access_token = $3
        WHERE customer_email = $1`,
    CUSTOMER_SET_ACCESSTOKEN: `UPDATE customer 
        SET access_token = $2
        WHERE customer_email = $1`,
    GET_ALL_CUSTOMERS:`SELECT * FROM customer`,
    GET_CUSTOMER_BY_ID:`SELECT * FROM customer WHERE customer_id=$1`,
    GET_CUSTOMER_CORPORATE_ORDERS:`SELECT * FROM corporate WHERE customer_id=$1`,
    GET_CUSTOMER_EVENT_ORDERS:``,
    CREATE_ADDRESS:`
    INSERT INTO address (customer_id,tag,pincode,line1,line2,location,ship_to_name,ship_to_phone_number) values 
    ($1, $2, $3, $4, $5,$6,$7,$8) 
    RETURNING *
    `,
    CUSTOMER_SET_TOKEN: `UPDATE customer 
        SET access_token = $2
        WHERE customer_email = $1`,

};


module.exports = { DB_COMMANDS };




