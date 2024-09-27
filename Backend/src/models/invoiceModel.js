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
            co.corporateorder_generated_id AS invoiceNumber,
            co.order_details AS corporateorder_details,
            co.total_amount,
            co.customer_address AS deliveryAddress,
            co.ordered_at AS orderedAt,
            od.category_id,
            cc.category_name AS categoryName,
            od.quantity,
            od.media AS description,
            od.delivery_details AS deliveryDetails,
            p.PaymentType,
            p.PhonePeReferenceId,
            p.TransactionDate,
            p.BankReferenceNo,
            p.Amount AS payment_amount,
            p.IGST,
            p.CGST,
            p.SGST,
            c.customer_generated_id AS customerId,
            c.customer_name AS customerName,
            c.customer_phoneNumber AS customerPhone,
            c.customer_email AS customerEmail
        FROM 
            corporate_orders co
        LEFT JOIN 
            corporateorder_details od ON co.corporateorder_id = od.corporateorder_id
        LEFT JOIN 
            payment p ON co.Paymentid = p.Paymentid
        LEFT JOIN 
            customer c ON co.customer_id = c.customer_id
        LEFT JOIN 
            corporate_category cc ON od.category_id = cc.category_id
        WHERE 
            co.corporateorder_id = $1;`;

    try {
        const response = await client.query(query, [orderId]);
        console.log('CHecking   ',response)
        if (response.length === 0) {
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
