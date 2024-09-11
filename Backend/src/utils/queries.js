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
        WHERE customer_email = $1`
};

module.exports = { DB_COMMANDS };
