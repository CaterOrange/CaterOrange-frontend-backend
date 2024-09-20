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
  
    GET_CUSTOMER_CORPORATE_ORDERS:`SELECT * FROM corporate WHERE customer_id=$1`,
    GET_CUSTOMER_EVENT_ORDERS:`SELECT * FROM event_orders WHERE customer_id=$1`,
    CREATE_ADDRESS:`
    INSERT INTO address (customer_id,tag,pincode,line1,line2,location,ship_to_name,ship_to_phone_number) values 
    ($1, $2, $3, $4, $5,$6,$7,$8) 
    RETURNING *
    `,
    CUSTOMER_SET_TOKEN: `UPDATE customer 
        SET access_token = $2
        WHERE customer_email = $1`,
    SELECT_NAME_PHONE :`
    SELECT customer_name, customer_phonenumber 
    FROM customer 
    WHERE customer_email = $1;
    `
,

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
    GET_EVENT_CART_BY_ID: `
        SELECT * FROM event_cart WHERE eventcart_id = $1
    `,
    DELETE_EVENT_CART_BY_ID:`DELETE FROM event_cart WHERE eventcart_id = $1`,
    INSERT_EVENT_ORDER:`INSERT INTO event_orders (
    customer_id,
    ordered_at,
    delivery_status,
    total_amount,
    delivery_details,
    event_order_details,
    event_media,
    customer_address,
    payment_status,
    event_order_status
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
  ) RETURNING *`,
    GET_ADDRESSES_BY_CUSTOMER_ID: ` 
    SELECT * FROM addresses WHERE customer_id = $1
    `,
    GET_USER_BY_TOKEN:`SELECT * FROM customer WHERE access_token=$1`,
    getEventCategoriesQuery : `SELECT * FROM event_category`,
    eventMenuPageQuery:`SELECT * FROM all_products 
                   WHERE category_name = $1 
                   LIMIT $2 OFFSET $3;`,
    getAllPayments:`SELECT * FROM payment`,
    DELETE_ADDRESS_BY_ID : `DELETE FROM addresses 
                WHERE address_id = $1 
                RETURNING *;`,
    UPDATE_ADDRESS_BY_ID:`UPDATE addresses SET`,
    INSERT_CORPORATE_ORDER_DETAILS: `
    INSERT INTO corporateorder_details 
    (corporateorder_id, processing_date, delivery_status, category_id, quantity, active_quantity, media, delivery_details)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `,
  
  GET_ORDER_DETAILS_BY_ID: `
    SELECT corporateorder_generated_id, order_details 
    FROM corporate_orders 
    WHERE customer_id = $1;
  `
 };
        



module.exports = { DB_COMMANDS };




