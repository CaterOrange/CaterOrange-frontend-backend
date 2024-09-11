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
    ADD_CATEGORY: `INSERT INTO category 
        (category_name, category_media) VALUES ($1, $2) RETURNING *`,
    CREATE_GROUP: `INSERT INTO groups (group_location)
        VALUES ($1::point) RETURNING *;`,
        
    DELETE_GROUP: `DELETE FROM groups
        WHERE group_id = $1 RETURNING *`,
    GET_ALL_GROUPS: ` SELECT * FROM groups;`,
    
    
};

module.exports = { DB_COMMANDS };
