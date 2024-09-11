function createCustomerTableQuery() {
    const createTableQuery = `
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
        FOREIGN KEY (group_id) REFERENCES groups(group_id),
        is_deactivated BOOLEAN DEFAULT FALSE
      );
    `;
    return createTableQuery;
  }
  
  function createVendorsTableQuery() {
    const createTableQuery = `
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
        vendor_location POINT
      );
    `;
    return createTableQuery;
  }
  
  function createLogisticCompaniesTableQuery() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS logistic_companies (
        logistic_id SERIAL PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        contact_number BIGINT,
        alternate_number BIGINT,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255),
        company_address JSON
      );
    `;
    return createTableQuery;
  }
  
  function createDriversTableQuery() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS drivers (
        driver_id SERIAL PRIMARY KEY,
        driver_name VARCHAR(255) NOT NULL,
        contact_number BIGINT,
        license_number VARCHAR(255) NOT NULL,
        license_expiry_date DATE NOT NULL,
        logistic_id INTEGER,
        status VARCHAR(50),
        FOREIGN KEY (logistic_id) REFERENCES logistic_companies(logistic_id)
      );
    `;
    return createTableQuery;
  }
  
  function createPaymentTableQuery() {
    const createTableQuery = `
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
        order_id INTEGER,
        customer_id INTEGER,
        FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
      );
    `;
    return createTableQuery;
  }
  
  function createOrdersTableQuery() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS orders (
        order_id SERIAL PRIMARY KEY,
        customer_id INTEGER,
        order_date DATE NOT NULL,
        order_type VARCHAR(50),
        status VARCHAR(50),
        total_amount INTEGER NOT NULL,
        PaymentId INTEGER,
        order_details JSON,
        vendor_id INTEGER,
        delivery_id INTEGER,
        FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
        FOREIGN KEY (PaymentId) REFERENCES payment(PaymentId),
        FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id),
        FOREIGN KEY (delivery_id) REFERENCES deliveries(delivery_id)
      );
    `;
    return createTableQuery;
  }
  
  function createCategoryTableQuery() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS category (
        category_id SERIAL PRIMARY KEY,
        category_name VARCHAR(255) NOT NULL,
        category_media BYTEA
      );
    `;
    return createTableQuery;
  }
  
  function createGroupsTableQuery() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS groups (
        group_id SERIAL PRIMARY KEY,
        group_location POINT
      );
    `;
    return createTableQuery;
  }
  
  function createItemsTableQuery() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS items (
        item_id SERIAL PRIMARY KEY,
        item_name VARCHAR(255) NOT NULL,
        item_media BYTEA,
        price_per_piece INTEGER NOT NULL
      );
    `;
    return createTableQuery;
  }
  
  function createDeliveriesTableQuery() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS deliveries (
        delivery_id SERIAL PRIMARY KEY,
        delivery_details JSON,
        delivery_address JSON
      );
    `;
    return createTableQuery;
  }
  
  function createOrderMediaTableQuery() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS order_media (
        order_id INTEGER,
        your_order BYTEA,
        under_cooking BYTEA,
        packing BYTEA,
        delivered BYTEA,
        FOREIGN KEY (order_id) REFERENCES orders(order_id)
      );
    `;
    return createTableQuery;
  }
  
  function createAddressesTableQuery() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS addresses (
        address_id SERIAL PRIMARY KEY,
        tag VARCHAR(50),
        line1 VARCHAR(255) NOT NULL,
        line2 VARCHAR(255),
        pincode INTEGER NOT NULL,
        group_id INTEGER,
        location POINT,
        FOREIGN KEY (group_id) REFERENCES groups(group_id)
      );
    `;
    return createTableQuery;
  }
  
  function createOrderDetailsTableQuery() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS order_details (
        processing_id SERIAL PRIMARY KEY,
        processing_date date,
        category_id INTEGER,
        items JSON,
        quantity INTEGER NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(order_id),
        FOREIGN KEY (category_id) REFERENCES category(category_id)
      );
    `;
    return createTableQuery;
  }
  
module.exports = 
{
    createAddressesTableQuery,
    createCategoryTableQuery,
    createDeliveriesTableQuery,
    createDriversTableQuery,
    createItemsTableQuery,
    createGroupsTableQuery,
    createLogisticCompaniesTableQuery,
    createOrderDetailsTableQuery,
    createOrdersTableQuery,
    createPaymentTableQuery,
    createVendorsTableQuery,
    createOrderMediaTableQuery,
    createCustomerTableQuery
}