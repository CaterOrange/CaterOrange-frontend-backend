// Create Customer Table
function createCustomerTableQuery() {
  return `
    CREATE SEQUENCE IF NOT EXISTS custom_id_seq START 1;

    CREATE TABLE IF NOT EXISTS customer (
      customer_id SERIAL PRIMARY KEY,
      customer_generated_id VARCHAR(255) UNIQUE DEFAULT 'C' || LPAD(nextval('custom_id_seq')::text, 6, '0'),
      customer_name VARCHAR(255) NOT NULL,
      customer_phoneNumber BIGINT,
      customer_email VARCHAR(255) NOT NULL UNIQUE,
      customer_password VARCHAR(255),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  
      lastLoginAt TIMESTAMP,
      wallet_amount INTEGER,
      group_id INTEGER,
      access_token VARCHAR(255),
      isDeactivated BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (group_id) REFERENCES groups(group_id)
    );
  `;
}    

// Create Payment Table
function createPaymentTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS payment (
      PaymentId SERIAL PRIMARY KEY,
      PaymentType VARCHAR(50),
      MerchantReferenceId VARCHAR(255),
      PhonePeReferenceId VARCHAR(255),
      "From" VARCHAR(255),
      Instrument VARCHAR(50),
      CreationDate DATE,
      TransactionDate DATE,
      SettlementDate DATE,
      BankReferenceNo VARCHAR(255),
      Amount INTEGER NOT NULL,
      Fee FLOAT,
      IGST FLOAT,
      CGST FLOAT,
      SGST FLOAT,
      customer_generated_id VARCHAR(255),
      paymentDate TIMESTAMP,
      FOREIGN KEY (customer_generated_id) REFERENCES customer(customer_generated_id)
    );
  `;
}

// Create Corporate Orders Table
function createCorporateOrdersTableQuery() {
  return `
    -- Create function to generate corporateorder_generated_id
    CREATE OR REPLACE FUNCTION generate_corporateorder_id() RETURNS TRIGGER AS $$
    DECLARE
        today_date TEXT;
        order_count INT;
        customer_gen_id TEXT;
    BEGIN
        -- Only generate corporateorder_generated_id if it's not set
        IF NEW.corporateorder_generated_id IS NULL THEN
            -- Get today's date in YYYYMMDD format
            today_date := TO_CHAR(NOW(), 'YYYYMMDD');
            
            -- Get the customer's generated id
            SELECT customer_generated_id INTO customer_gen_id 
            FROM customer 
            WHERE customer_generated_id = NEW.customer_generated_id;
            
            -- Count the number of orders placed by the customer today
            SELECT COUNT(*) + 1 INTO order_count
            FROM corporate_orders
            WHERE customer_generated_id = NEW.customer_generated_id
            AND TO_CHAR(ordered_at, 'YYYYMMDD') = today_date;
            
            -- Concatenate CO, today's date, the order count, and the customer_generated_id
            NEW.corporateorder_generated_id := 'CO' || today_date || order_count || customer_gen_id;
        END IF;

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Drop the trigger if it already exists
    DROP TRIGGER IF EXISTS corporateorder_id_trigger ON corporate_orders;

    -- Create the corporate_orders table
    CREATE TABLE IF NOT EXISTS corporate_orders (
      corporateorder_id SERIAL PRIMARY KEY,
      corporateorder_generated_id VARCHAR(255) UNIQUE,
      customer_generated_id VARCHAR(100),
      order_details JSON,  
      total_amount FLOAT NOT NULL,
      PaymentId INTEGER,
      customer_address JSON,
      ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      payment_status VARCHAR(50),
      corporate_order_status VARCHAR(50),
      FOREIGN KEY (customer_generated_id) REFERENCES customer(customer_generated_id),
      FOREIGN KEY (PaymentId) REFERENCES payment(PaymentId)
    );

    -- Create trigger that calls the function to generate corporateorder_generated_id
    CREATE TRIGGER corporateorder_id_trigger
    BEFORE INSERT ON corporate_orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_corporateorder_id();
  `;
}


// Create Corporate Order Details Table
function createCorporateOrderDetailsTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS corporateorder_details (
      order_detail_id SERIAL PRIMARY KEY,
      corporateorder_id INTEGER,
      processing_date DATE,
      delivery_status VARCHAR(50),
      category_id INTEGER,
      quantity INTEGER,
      active_quantity INTEGER,
      media JSON,
      delivery_details JSON,
      addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (corporateorder_id) REFERENCES corporate_orders(corporateorder_id),
      FOREIGN KEY (category_id) REFERENCES corporate_category(category_id)
    );
  `;
}


// Create Event Orders Table
function createEventOrdersTableQuery() {
  return `
    -- Create function to generate eventorder_generated_id
    CREATE OR REPLACE FUNCTION generate_eventorder_id() RETURNS TRIGGER AS $$
    DECLARE
        today_date TEXT;
        order_count INT;
        customer_gen_id TEXT;
    BEGIN
        -- Get today's date in YYYYMMDD format
        today_date := TO_CHAR(NOW(), 'YYYYMMDD');
        
        -- Get the customer's generated id
        SELECT customer_generated_id INTO customer_gen_id FROM customer WHERE customer_id = NEW.customer_id;
        
        -- Count the number of orders placed by the customer today in the event_orders table
        SELECT COUNT(*) + 1 INTO order_count
        FROM event_orders
        WHERE customer_id = NEW.customer_id
        AND TO_CHAR(ordered_at, 'YYYYMMDD') = today_date;
        
        -- Concatenate EO, today's date, the order count, and the customer_generated_id
        NEW.eventorder_generated_id := 'EO' || today_date || order_count || customer_gen_id;
        
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

   -- Drop the trigger if it already exists
    DROP TRIGGER IF EXISTS eventorder_id_trigger ON event_orders;

    -- Create the event_orders table
    CREATE TABLE IF NOT EXISTS event_orders (
      eventorder_id SERIAL PRIMARY KEY,
      eventorder_generated_id VARCHAR(255) UNIQUE,
      customer_id INTEGER,
      ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      delivery_status VARCHAR(50),
      total_amount FLOAT NOT NULL,
      PaymentId INTEGER,
      delivery_details JSON,
      event_order_details JSON,
      event_media JSON,
      customer_address JSON,
      payment_status VARCHAR(50),
      event_order_status VARCHAR(50),
      number_of_plates INTEGER,
      processing_date DATE,
      processing_time VARCHAR,
      FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
      FOREIGN KEY (PaymentId) REFERENCES payment(PaymentId)
    );
    

    -- Create trigger that calls the function to generate eventorder_generated_id
    CREATE TRIGGER eventorder_id_trigger
    BEFORE INSERT ON event_orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_eventorder_id();
  `;
}


function createCorporateCategoryTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS corporate_category (
      category_id SERIAL PRIMARY KEY,
      category_name VARCHAR(255) NOT NULL UNIQUE,  -- Add UNIQUE constraint
      category_description VARCHAR(500),
      category_price FLOAT,
      category_media TEXT,
      addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Insert initial categories if the table is empty
    INSERT INTO corporate_category (category_name, category_description, category_price, category_media)
    VALUES
      ('Breakfast', 'We are offering tasty Breakfast here!!!', 40, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnZovlevz8SutD4Y3OAbDqEcbqiu-QV12l5w&s'),
      ('Veg Lunch', 'We are offering tasty Veg Lunch here!!!', 99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnZovlevz8SutD4Y3OAbDqEcbqiu-QV12l5w&s'),
      ('NonVeg Lunch', 'We are offering tasty Nonveg Lunch here!!!', 120, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnZovlevz8SutD4Y3OAbDqEcbqiu-QV12l5w&s'),
      ('Snacks', 'We are offering tasty Snacks here!!!', 50, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnZovlevz8SutD4Y3OAbDqEcbqiu-QV12l5w&s'),
      ('Veg Dinner', 'We are offering tasty Veg Dinner here!!!', 99, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnZovlevz8SutD4Y3OAbDqEcbqiu-QV12l5w&s'),
      ('NonVeg Dinner', 'We are offering tasty Nonveg Dinner here!!!', 120, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnZovlevz8SutD4Y3OAbDqEcbqiu-QV12l5w&s')
    ON CONFLICT (category_name) DO NOTHING;  -- Prevent inserting duplicate category names
  `;
}


// Create Event Category Table
function createEventCategoryTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS event_category (
      category_id SERIAL PRIMARY KEY,
      category_name VARCHAR(255) NOT NULL,
      category_media TEXT,
      addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

// Create Groups Table
function createGroupsTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS groups (
      group_id SERIAL PRIMARY KEY,
      group_location POINT,
      addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

// Create Addresses Table
  function createAddressesTableQuery() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS address (
            address_id SERIAL PRIMARY KEY,
            customer_id VARCHAR(600),
            tag VARCHAR(255),
            pincode BIGINT,
            line1 VARCHAR(255),
            line2 VARCHAR(255),
            location TEXT[],  -- Array of text
            ship_to_name VARCHAR(255),
            ship_to_phone_number BIGINT,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            group_id INTEGER
        );
    `;
    return createTableQuery;
  }


// Create Event Cart Table
function createEventCartTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS event_cart (
      eventcart_id SERIAL PRIMARY KEY,
      customer_id INTEGER,
      total_amount FLOAT,
      cart_order_details JSON,
      address JSON,
      number_of_plates INTEGER,
      processing_date DATE,
      processing_time VARCHAR,
      addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
    );
  `;
}function createAdminTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS admin (
      adminid SERIAL PRIMARY KEY,
      customer_generated_id VARCHAR,
      isadmin boolean,
      FOREIGN KEY (customer_generated_id) REFERENCES customer(customer_generated_id)
    );
  `;
}
// Create Corporate Cart Table
function createCorporateCartTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS corporate_cart (
      corporatecart_id SERIAL PRIMARY KEY,
      customer_generated_id VARCHAR,
      cart_order_details JSON,
      total_amount FLOAT,
      customer_address JSON,
      addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_generated_id) REFERENCES customer(customer_generated_id)
    );
  `;
}

// Create Event Products Table
function createEventProductsTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS event_products (
      product_id SERIAL PRIMARY KEY,
      productid VARCHAR(255),
      ProductName VARCHAR(255),
      Image TEXT,
      category_name VARCHAR(255),
      price_category VARCHAR(255),
      isdual BOOLEAN,
      Plate_Units VARCHAR(255),
      PriceperUnit INTEGER,
      minunitsperplate INTEGER,
      WtOrVol_Units VARCHAR(255),
      Price_Per_WtOrVol_Units INTEGER,
      Min_WtOrVol_Units_per_Plate INTEGER,
      addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  }


module.exports = {
  createCustomerTableQuery,
  createPaymentTableQuery,
  createCorporateOrdersTableQuery,
  createCorporateOrderDetailsTableQuery,
  createEventOrdersTableQuery,
  createCorporateCategoryTableQuery,
  createEventCategoryTableQuery,
  createGroupsTableQuery,
  createAddressesTableQuery,
  createEventCartTableQuery,
  createCorporateCartTableQuery,
  createEventProductsTableQuery,
  createAdminTableQuery
};

