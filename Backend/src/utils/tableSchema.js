// Create Customer Table
function createCustomerTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS customer (
      customer_id SERIAL PRIMARY KEY,
      customer_name VARCHAR(255) NOT NULL,
      customer_phoneNumber BIGINT,
      customer_email VARCHAR(255) NOT NULL UNIQUE,
      customer_address JSON,
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

// Create Vendors Table
function createVendorsTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS vendors (
      vendor_id SERIAL PRIMARY KEY,
      vendor_name VARCHAR(255) NOT NULL,
      vendor_address VARCHAR(255),
      contact_person VARCHAR(255),
      contact_number BIGINT,
      alternate_number BIGINT,
      vendor_email VARCHAR(255) NOT NULL UNIQUE,
      vendor_password VARCHAR(255),
      vendor_status VARCHAR(50),
      rating FLOAT,
      vendor_wallet FLOAT,
      vendor_location POINT,
      isDeactivated BOOLEAN DEFAULT FALSE
    );
  `;
}

// Create Drivers Table
function createDriversTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS drivers (
      driver_id SERIAL PRIMARY KEY,
      driver_name VARCHAR(255) NOT NULL,
      contact_number BIGINT,
      license_number VARCHAR(255) NOT NULL,
      license_expiry_date DATE NOT NULL,
      status VARCHAR(50)
    );
  `;
}

// Create Corporate Payment Table
function createCorporatePaymentTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS corporate_payment (
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
      order_id INTEGER,
      customer_id INTEGER,
      FOREIGN KEY (order_id) REFERENCES corporate_orders(corporateorder_id),
      FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
    );
  `;
}

// Create Event Payment Table
function createEventPaymentTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS event_payment (
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
      order_id INTEGER,
      customer_id INTEGER,
      FOREIGN KEY (order_id) REFERENCES event_orders(eventorder_id),
      FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
    );
  `;
}

// Create Corporate Orders Table
function createCorporateOrdersTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS corporate_orders (
      corporateorder_id SERIAL PRIMARY KEY,
      customer_id INTEGER,
      order_details JSON[],
      total_amount INTEGER NOT NULL,
      PaymentId INTEGER,
      vendor_id INTEGER,
      corporatecart_id JSON[],
      FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
      FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id)
    );
  `;
}

// Create Corporate Order Details Table
function createCorporateOrderDetailsTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS corporateorder_details (
      details_id SERIAL PRIMARY KEY,
      processing_date DATE UNIQUE,
      status VARCHAR(50),
      category_id INTEGER,
      quantity INTEGER,
      FOREIGN KEY (category_id) REFERENCES category(category_id)
    );
  `;
}

// Create Event Orders Table
function createEventOrdersTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS event_orders (
      eventorder_id SERIAL PRIMARY KEY,
      customer_id INTEGER,
      order_date DATE NOT NULL,
      status VARCHAR(50),
      total_amount INTEGER NOT NULL,
      vendor_id INTEGER,
      eventcart_id JSON[],
      FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
      FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id)
    );
  `;
}

// Create Event Order Details Table
function createEventOrderDetailsTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS eventorder_details (
      details_id SERIAL PRIMARY KEY,
      processing_date DATE,
      status VARCHAR(50),
      itemInBag JSONB
    );
  `;
}

// Create Category Table
function createCategoryTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS category (
      category_id SERIAL PRIMARY KEY,
      category_name VARCHAR(255) NOT NULL,
      category_description TEXT,
      category_price INTEGER NOT NULL,
      category_media TEXT
    );
  `;
}

// Create Groups Table
function createGroupsTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS groups (
      group_id SERIAL PRIMARY KEY,
      group_location POINT
    );
  `;
}

// Create Corporate Order Media Table
function createCorporateOrderMediaTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS corporateorder_media (
      corporateorder_id INTEGER,
      your_order TEXT,
      under_cooking TEXT,
      packing TEXT,
      delivered TEXT,
      FOREIGN KEY (corporateorder_id) REFERENCES corporate_orders(corporateorder_id)
    );
  `;
}

// Create Event Order Media Table
function createEventOrderMediaTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS eventorder_media (
      eventorder_id INTEGER,
      your_order TEXT,
      under_cooking TEXT,
      packing TEXT,
      delivered TEXT,
      FOREIGN KEY (eventorder_id) REFERENCES event_orders(eventorder_id)
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
      FOREIGN KEY (group_id) REFERENCES groups(group_id)
    );
  `;
}

// Create Event Cart Table
function createEventCartTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS event_cart (
      eventcart_id SERIAL PRIMARY KEY,
      product_id INTEGER,
      processing_date DATE,
      quantity INTEGER,
      customer_id INTEGER,
      unit_name VARCHAR(255),
      FOREIGN KEY (product_id) REFERENCES all_products(product_id),
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
      category_id INTEGER,
      processing_date DATE,
      quantity INTEGER,
      FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
      FOREIGN KEY (category_id) REFERENCES category(category_id)
    );
  `;
}

// Create All Products Table
function createAllProductsTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS all_products (
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
      min_unit2_per_plate INTEGER
    );
  `;
}

// Create Event Address Table
function createEventAddressTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS eventaddress_table (
      address_id SERIAL PRIMARY KEY,
      eventcustomer_name VARCHAR(255),
      phone_number INTEGER,
      event_address JSON,
      no_of_plates INTEGER,
      customer_id INTEGER,
      FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
    );
  `;
}

module.exports = {
  createCustomerTableQuery,
  createVendorsTableQuery,
  createDriversTableQuery,
  createCorporateOrdersTableQuery,
  createCorporateOrderDetailsTableQuery,
  createEventOrdersTableQuery,
  createEventOrderDetailsTableQuery,
  createCategoryTableQuery,
  createGroupsTableQuery,
  createCorporateOrderMediaTableQuery,
  createEventOrderMediaTableQuery,
  createAddressesTableQuery,
  createEventCartTableQuery,
  createCorporateCartTableQuery,
  createCorporatePaymentTableQuery,
  createEventPaymentTableQuery,
  createAllProductsTableQuery,
  createEventAddressTableQuery
};
