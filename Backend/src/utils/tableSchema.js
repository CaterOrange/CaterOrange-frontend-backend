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

function createLogisticCompaniesTableQuery() {
  return `
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
}

function createDriversTableQuery() {
  return `
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
}

function createCorporatePaymentTableQuery() {
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
      order_id INTEGER,
      customer_id INTEGER,
      FOREIGN KEY (order_id) REFERENCES corporate_orders(corporateorder_id),
      FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
    );
  `;
}
function createEventPaymentTableQuery() {
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
      order_id INTEGER,
      customer_id INTEGER,
      FOREIGN KEY (order_id) REFERENCES event_orders(eventorder_id),
      FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
    );
  `;
}

function createCorporateOrdersTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS corporate_orders (
      corporateorder_id SERIAL PRIMARY KEY,
      customer_id INTEGER,
      order_details JSON[],
      total_amount INTEGER NOT NULL,
      PaymentId INTEGER,
      vendor_id INTEGER,
      delivery_id INTEGER,
      corporatecart_id INTEGER,
      FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
      FOREIGN KEY (PaymentId) REFERENCES payment(PaymentId),
      FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id),
      FOREIGN KEY (delivery_id) REFERENCES deliveries(delivery_id),
      FOREIGN KEY (corporatecart_id) REFERENCES corporate_cart(corporatecart_id)
    );
  `;
}

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

function createEventOrdersTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS event_orders (
      eventorder_id SERIAL PRIMARY KEY,
      customer_id INTEGER,
      order_date DATE NOT NULL,
      status VARCHAR(50),
      total_amount INTEGER NOT NULL,
      PaymentId INTEGER,
      vendor_id INTEGER,
      delivery_id INTEGER,
      eventcart_id INTEGER,
      FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
      FOREIGN KEY (PaymentId) REFERENCES payment(PaymentId),
      FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id),
      FOREIGN KEY (delivery_id) REFERENCES deliveries(delivery_id),
      FOREIGN KEY (eventcart_id) REFERENCES event_cart(eventcart_id)
    );
  `;
}

function createEventOrderDetailsTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS eventorder_details (
      details_id SERIAL PRIMARY KEY,
      processing_date DATE,
      status VARCHAR(50),
      category_id INTEGER,
      FOREIGN KEY (category_id) REFERENCES category(category_id)
    );
  `;
}

function createCategoryTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS category (
      category_id SERIAL PRIMARY KEY,
      category_name VARCHAR(255) NOT NULL,
      category_media BYTEA
    );
  `;
}

function createGroupsTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS groups (
      group_id SERIAL PRIMARY KEY,
      group_location POINT
    );
  `;
}

function createDeliveriesTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS deliveries (
      delivery_id SERIAL PRIMARY KEY,
      delivery_details JSON,
      delivery_address JSON
    );
  `;
}

function createCorporateOrderMediaTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS corporateorder_media (
      corporateorder_id INTEGER,
      your_order BYTEA,
      under_cooking BYTEA,
      packing BYTEA,
      delivered BYTEA,
      FOREIGN KEY (corporateorder_id) REFERENCES corporate_orders(corporateorder_id)
    );
  `;
}

function createEventOrderMediaTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS eventorder_media (
      eventorder_id INTEGER,
      your_order BYTEA,
      under_cooking BYTEA,
      packing BYTEA,
      delivered BYTEA,
      FOREIGN KEY (eventorder_id) REFERENCES event_orders(eventorder_id)
    );
  `;
}

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

function createEventCartTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS event_cart (
      eventcart_id SERIAL PRIMARY KEY,
      category_id INTEGER,
      processing_date DATE,
      quantity INTEGER,
      customer_id INTEGER,
      FOREIGN KEY (category_id) REFERENCES category(category_id),
      FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
    );
  `;
}

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

function createEventMasterTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS event_master (
      category_id SERIAL PRIMARY KEY,
      category_name VARCHAR(255) NOT NULL,
      category_media BYTEA
    );
  `;
}

function createQuantityTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS quantity (
      quantity_id SERIAL PRIMARY KEY,
      quantity_name VARCHAR(255),
      quantity_rate INTEGER,
      quantity_media BYTEA,
      no_of_quantity INTEGER,
      category_id INTEGER,
      FOREIGN KEY (category_id) REFERENCES event_master(category_id)
    );
  `;
}

function createKgTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS kg (
      kg_id SERIAL PRIMARY KEY,
      kg_name VARCHAR(255),
      kg_rate INTEGER,
      kg_media BYTEA,
      no_of_kgs INTEGER,
      category_id INTEGER,
      FOREIGN KEY (category_id) REFERENCES event_master(category_id)

    );
  `;
}

function createLitreTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS litre (
      litre_id SERIAL PRIMARY KEY,
      litre_name VARCHAR(255),
      litre_rate INTEGER,
      litre_media BYTEA,
      no_of_litres INTEGER,
      category_id INTEGER,
      FOREIGN KEY (category_id) REFERENCES event_master(category_id)

    );
  `;
}

function createKgQuantityTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS kg_quantity (
      kg_quantity_id SERIAL PRIMARY KEY,
      kg_quantity_name VARCHAR(255),
      kg_quantity_unit1 INTEGER,
      kg_quantity_rate1 INTEGER,
      kg_quantity_unit2 INTEGER,
      kg_quantity_rate2 INTEGER,
      grams_unit FLOAT,
      kgpiece_unit INTEGER,
      category_id INTEGER,
      FOREIGN KEY (category_id) REFERENCES event_master(category_id)

    );
  `;
}

function createLitreQuantityTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS litre_quantity (
      litre_quantity_id SERIAL PRIMARY KEY,
      litre_quantity_name VARCHAR(255),
      litre_quantity_unit1 INTEGER,
      litre_quantity_rate1 INTEGER,
      litre_quantity_unit2 INTEGER,
      litre_quantity_rate2 INTEGER,
      mls_unit FLOAT,
      lqpiece_unit INTEGER,
      category_id INTEGER,
      FOREIGN KEY (category_id) REFERENCES event_master(category_id)

    );
  `;
}

module.exports = {
  createCustomerTableQuery,
  createVendorsTableQuery,
  createLogisticCompaniesTableQuery,
  createDriversTableQuery,
  createCorporateOrdersTableQuery,
  createCorporateOrderDetailsTableQuery,
  createEventOrdersTableQuery,
  createEventOrderDetailsTableQuery,
  createCategoryTableQuery,
  createGroupsTableQuery,
  createDeliveriesTableQuery,
  createCorporateOrderMediaTableQuery,
  createEventOrderMediaTableQuery,
  createAddressesTableQuery,
  createEventCartTableQuery,
  createCorporateCartTableQuery,
  createEventMasterTableQuery,
  createQuantityTableQuery,
  createKgTableQuery,
  createLitreTableQuery,
  createKgQuantityTableQuery,
  createLitreQuantityTableQuery,
  createCorporatePaymentTableQuery,
  createEventPaymentTableQuery
};
