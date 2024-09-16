// Create Customer Table
function createCustomerTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS customer (
      customer_id SERIAL PRIMARY KEY,
      customer_generated_id VARCHAR UNIQUE,
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
      customer_id INTEGER,
      paymentDate TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
    );
  `;
}

// Create Corporate Orders Table
function createCorporateOrdersTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS corporate_orders (
      corporateorder_id SERIAL PRIMARY KEY,
      corporateorder_generated_id VARCHAR UNIQUE,
      customer_id INTEGER,
      order_details JSON,
      total_amount FLOAT NOT NULL,
      PaymentId INTEGER,
      customer_address JSON,
      ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      payment_status VARCHAR(50),
      corporate_order_status VARCHAR(50),
      FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
      FOREIGN KEY (PaymentId) REFERENCES payment(PaymentId)
    );
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
    CREATE TABLE IF NOT EXISTS event_orders (
      eventorder_id SERIAL PRIMARY KEY,
      eventorder_generated_id VARCHAR UNIQUE,
      customer_id INTEGER,
      ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      delivery_status VARCHAR(50),
      total_amount INTEGER NOT NULL,
      PaymentId INTEGER,
      delivery_details JSON,
      event_order_details JSON,
      event_media JSON,
      customer_address JSON,
      payment_status VARCHAR(50),
      event_order_status VARCHAR(50),
      FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
      FOREIGN KEY (PaymentId) REFERENCES payment(PaymentId)
    );
  `;
}

// Create Corporate Category Table
function createCorporateCategoryTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS corporate_category (
      category_id SERIAL PRIMARY KEY,
      category_name VARCHAR(255) NOT NULL,
      category_media TEXT,
      addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      price FLOAT
    );
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
  return `
    CREATE TABLE IF NOT EXISTS addresses (
      address_id SERIAL PRIMARY KEY,
      tag VARCHAR(50),
      line1 VARCHAR(255) NOT NULL,
      line2 VARCHAR(255),
      pincode INTEGER,
      group_id INTEGER,
      location POINT,
      ship_to_name VARCHAR(255),
      ship_to_phone_no BIGINT, 
      customer_id INTEGER,
      addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups(group_id),
      FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
    );
  `;
}

// Create Event Cart Table
function createEventCartTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS event_cart (
      eventcart_id SERIAL PRIMARY KEY,
      order_date DATE,
      customer_id INTEGER,
      total_amount FLOAT,
      cart_order_details JSON,
      address JSON,
      addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
    );
  `;
}

// Create Corporate Cart Table
function createCorporateCartTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS corporate_cart (
      corporatecart_id SERIAL PRIMARY KEY,
      customer_id INTEGER,
      cart_order_details JSON,
      total_amount FLOAT,
      customer_address JSON,
      addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
    );
  `;
}

// Create Event Products Table
function createEventProductsTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS event_products (
      product_id SERIAL PRIMARY KEY,
      product_name VARCHAR(255),
      image TEXT,
      category_name VARCHAR(255),
      price_category VARCHAR(255),
      isdual BOOLEAN,
      unit_1 VARCHAR(255),
      price_per_unit1 FLOAT,
      min_unit1_per_plate INTEGER,
      unit_2 VARCHAR(255),
      price_per_unit2 FLOAT,
      min_unit2_per_plate INTEGER,
      addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      category_id INTEGER,
      FOREIGN KEY (category_id) REFERENCES event_category(category_id)
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
  createEventProductsTableQuery
};
