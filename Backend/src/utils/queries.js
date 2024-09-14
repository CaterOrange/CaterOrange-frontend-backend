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
    GET_ALL_CUSTOMERS:`SELECT * FROM customer`,
    GET_CUSTOMER_BY_ID:`SELECT * FROM customer WHERE customer_id=$1`,
    DELETE_CUSTOMER:`DELETE FROM customer WHERE customer_id=$1`,
    UPDATE_USER: 'UPDATE customer SET',
    createEventOrder : `
        INSERT INTO event_orders (customer_id, order_date, status, total_amount, vendor_id, delivery_id, eventcart_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    getEventOrderById : `
       SELECT * FROM event_orders WHERE eventorder_id = $1  `,
    getAllEventOrdersByCustomerId : `
        SELECT * FROM event_orders WHERE customer_id = $1`,
    
    
};

module.exports = { DB_COMMANDS };
