const DB_COMMANDS = {
    CUSTOMER_INSERT: `
        INSERT INTO customer 
        (customer_name, customer_email, customer_password, customer_phonenumber, access_token) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *`,  
    CUSTOMER_EMAIL_SELECT: `
        SELECT * FROM customer 
        WHERE customer_email = $1`,
    CUSTOMER_SELECT_BY_GID:`
        SELECT * FROM customer WHERE customer_generated_id=$1
    `,
    CUSTOMER_SET_PASSWORD:`UPDATE customer 
        SET customer_password = $2, access_token = $3
        WHERE customer_email = $1`,

    CUSTOMER_SET_ACCESSTOKEN: `UPDATE customer 
        SET access_token = $2
        WHERE customer_email = $1`,
    CUSTOMER_TOKEN_SELECT: `
    SELECT * FROM customer 
    WHERE access_token = $1`,
  
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
    `,
    CUSTOMER_ACTIVATED_CHECK: `
    SELECT customer_name 
    FROM customer 
    WHERE customer_email = $1 AND isdeactivated IS FALSE;  `
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
    
    delivery_status,
    total_amount,
    delivery_details,
    event_order_details,
    event_media,
    customer_address,
    payment_status,
    event_order_status,
    number_of_plates,
    processing_date
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9,$10,$11
  ) RETURNING *`,
    GET_ADDRESSES_BY_CUSTOMER_ID: `
    SELECT * FROM address WHERE customer_id = $1
    `,
    GET_USER_BY_TOKEN:`SELECT * FROM customer WHERE access_token=$1`,
    getEventCategoriesQuery : `SELECT * FROM event_category`,
    eventMenuPageQuery:`SELECT * FROM all_products 
                   WHERE category_name = $1 
                   LIMIT $2 OFFSET $3;`,
    getAllPayments:`SELECT * FROM payment`,
    DELETE_ADDRESS_BY_ID : `DELETE FROM address 
                WHERE address_id = $1 
                RETURNING *;`,
    UPDATE_ADDRESS_BY_ID:`UPDATE address SET`,
    SELECT_ADDRESS:`
SELECT * FROM address WHERE address_id=$1`,
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
  `,
  GET_EVENTORDER_DETAILS_BY_ID: `SELECT * FROM event_orders WHERE customer_id=$1;`,
  GETCORPORATECATEGORY:`
  select * from corporate_category
  `,
  ADD_CORPORATECART:`
  INSERT INTO corporate_cart  (customer_id, cart_order_details,total_amount) 
  VALUES ($1, $2, $3) 
  RETURNING *
`,
GETCARTS:`
  SELECT * FROM corporate_cart WHERE customer_id = $1
`,
GETPRICE: `
SELECT 
  jsonb_element->>'price' AS price,
  jsonb_element->>'quantity' AS quantity,
  total_amount
FROM corporate_cart,
     jsonb_array_elements(cart_order_details::jsonb) AS jsonb_element
WHERE corporatecart_id = $1
  AND jsonb_element->>'date' = $2;
`
,
  UPDATEQUANTITY: `
  UPDATE corporate_cart
  SET total_amount = $4,
      cart_order_details = (
        SELECT jsonb_agg(
          CASE
            WHEN jsonb_element->>'date' = $2 THEN
              jsonb_set(jsonb_element, '{quantity}', to_jsonb($3::text), false)
            ELSE
              jsonb_element
          END
        )
        FROM jsonb_array_elements(cart_order_details::jsonb) AS jsonb_element
      )
  WHERE corporatecart_id = $1;
`,
DELETECARTITEM:`
UPDATE corporate_cart
SET total_amount=$3,cart_order_details = (
    SELECT jsonb_agg(item) 
    FROM jsonb_array_elements(cart_order_details::jsonb) AS item
    WHERE (item->>'date')::text != $2
)
WHERE corporatecart_id = $1;

`,
DELETECARTROW:`
            DELETE FROM corporate_cart
            WHERE corporatecart_id = $1
              AND (cart_order_details IS NULL OR jsonb_array_length(cart_order_details::jsonb) = 0);
        `,
INSERT_CART_TO_ORDER:`INSERT INTO corporate_orders
        (customer_generated_id,order_details,total_amount, paymentid, customer_address ,payment_status ) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *`,
  GET_CATEGORY_NAME: `
      SELECT category_name FROM  corporate_category WHERE category_id= $1
  `,
  GET_ALL_ADDRESSES:`
  SELECT * FROM address WHERE customer_id=$1
  `,
  FETCH_ORDERS:`SELECT corporateorder_generated_id, order_details,ordered_at
  FROM corporate_orders 
  WHERE customer_generated_id = $1 AND payment_status='Success'
`,
GET_ORDER_GENID: `
  SELECT corporateorder_generated_id FROM corporate_orders WHERE customer_generated_id=$1
`,
GET_ORDER_EVENTGENID: `
  SELECT eventorder_generated_id FROM event_orders WHERE customer_id=$1
`

 };


module.exports = { DB_COMMANDS };




