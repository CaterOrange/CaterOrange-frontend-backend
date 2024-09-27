const client = require('../config/dbConfig');
const fs = require('fs');
const path = require('path');

// File to store the last invoice number
const COUNTER_FILE_PATH = path.join(__dirname, '..', 'counter.json');

// Function to read the last used invoice number
function readCounter() {
    if (fs.existsSync(COUNTER_FILE_PATH)) {
        const data = fs.readFileSync(COUNTER_FILE_PATH);
        return JSON.parse(data).lastInvoiceNumber || 0;
    }
    return 0;
}

// Function to write the current invoice number to the counter file
function writeCounter(newInvoiceNumber) {
    fs.writeFileSync(COUNTER_FILE_PATH, JSON.stringify({ lastInvoiceNumber: newInvoiceNumber }));
}

// Function to get invoice data from the database
async function getInvoiceData(orderId) {
    const query = `
        SELECT 
            eo.eventorder_generated_id AS invoiceNumber,
            eo.event_order_details AS eventOrderDetails,
            eo.total_amount AS totalAmount,
            eo.customer_address AS deliveryAddress,
            eo.ordered_at AS orderedAt,
            eo.number_of_plates,
            p.PaymentType,
            p.PhonePeReferenceId,
            p.TransactionDate,
            p.BankReferenceNo,
            p.Amount AS paymentAmount,
            p.IGST,
            p.CGST,
            p.SGST,
            c.customer_generated_id AS customerId,
            c.customer_name AS customerName,
            c.customer_phoneNumber AS customerPhone,
            c.customer_email AS customerEmail
        FROM 
            event_orders eo
        LEFT JOIN 
            payment p ON eo.PaymentId = p.PaymentId
        LEFT JOIN 
            customer c ON eo.customer_id = c.customer_id   
        WHERE 
            eo.eventorder_id = $1;
    `;

    try {
        const response = await client.query(query, [orderId]);
        console.log('Invoice Data: ', response);
        if (response.rows.length === 0) {
            console.log(`No results found for orderId: ${orderId}`);
        }
        
        return response.rows;
    } catch (error) {
        console.error('Error executing database query:', error);
        throw error;
    }
}

module.exports = {
    readCounter,
    writeCounter,
    getInvoiceData
};
