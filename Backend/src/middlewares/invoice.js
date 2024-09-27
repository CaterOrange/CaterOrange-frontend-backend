const db = require('../config/dbConfig');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// File to store the last invoice number
const COUNTER_FILE_PATH = path.join(__dirname, 'counter.json');

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

// Function to generate an invoice
function generateInvoice(invoiceData) {
    const doc = new PDFDocument();
    const filePath = path.join(__dirname, 'invoices', `invoice_${invoiceData.invoiceNumber}.pdf`);
    doc.pipe(fs.createWriteStream(filePath));

    // Title
    doc.fontSize(25).text('Invoice', { align: 'center' });
    doc.fontSize(15).text(`Invoice Number: ${invoiceData.invoiceNumber}`, { align: 'right' });
    doc.fontSize(15).text(`Date: ${invoiceData.date}`);

    doc.moveDown();

    // Order Details
    doc.fontSize(15).text('Order Details');
    doc.text(`Order Number: ${invoiceData.orderNumber}`);
    doc.text(`Customer Address: ${invoiceData.deliveryAddress}`);
    doc.text(`Ordered At: ${invoiceData.orderedAt}`);

    doc.moveDown();

    // Restaurant Details
    doc.fontSize(15).text('Restaurant Details');
    doc.text(`Restaurant: ${invoiceData.restaurantName}`);

    doc.moveDown();

    // Billing Details
    doc.fontSize(15).text('Billing Details');
    doc.text(`Name: ${invoiceData.customer.name}`);
    doc.text(`Phone: ${invoiceData.customer.phone}`);
    doc.text(`Email: ${invoiceData.customer.email}`);

    doc.moveDown();

    // Draw table headers
    const tableTop = doc.y;
    doc.fontSize(15).text('Category', 50, tableTop);
    doc.fontSize(15).text('Description', 150, tableTop);
    doc.fontSize(15).text('Quantity', 300, tableTop);
    doc.fontSize(15).text('Price', 370, tableTop);
    doc.fontSize(15).text('Total', 440, tableTop);

    // Draw table separator line
    doc.moveTo(50, tableTop + 15)
        .lineTo(500, tableTop + 15)
        .stroke();

    // Add table rows
    let yPosition = tableTop + 30;
    let subtotal = 0;
    invoiceData.items.forEach(item => {
        const itemTotal = item.quantity * item.price;
        subtotal += itemTotal;

        doc.fontSize(12).text(item.categoryName, 50, yPosition);
        doc.fontSize(12).text(item.description, 150, yPosition);
        doc.fontSize(12).text(item.quantity, 300, yPosition);
        doc.fontSize(12).text(`$${item.price.toFixed(2)}`, 370, yPosition);
        doc.fontSize(12).text(`$${itemTotal.toFixed(2)}`, 440, yPosition);

        yPosition += 20;
    });

    // Draw table bottom border
    doc.moveTo(50, yPosition)
        .lineTo(500, yPosition)
        .stroke();

    // Add order summary
    doc.moveDown();
    doc.fontSize(15).text('Order Summary', { align: 'left' });
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`);
    doc.text(`Tax: $${invoiceData.tax.toFixed(2)}`);
    doc.text(`Delivery Charges: $${invoiceData.deliveryCharges.toFixed(2)}`);
    doc.text(`Total Amount: $${(subtotal + invoiceData.tax + invoiceData.deliveryCharges).toFixed(2)}`, { align: 'right' });

    // Finalize the PDF
    doc.end();

    return filePath;
}

// Function to send email with invoice attached
function sendInvoiceByEmail(emailTo, invoiceFile) {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: "srivallika@scaleorange.com", // Replace with your email
            pass: 'avhh gsou bkta cahp' // Replace with your email password
        }
    });

    const mailOptions = {
        from: 'srivallika@scaleorange.com', // Replace with your email
        to: emailTo,
        subject: 'Your Invoice from CaterOrange',
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You for Your Order - CaterOrange</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .container {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 12px;
            max-width: 600px;
            margin: 0 auto;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        h1 {
            color: #ff6600;
            font-size: 24px;
            margin-bottom: 10px;
        }
        p {
            font-size: 16px;
            line-height: 1.6;
            color: #555;
        }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #777;
        }
        .footer a {
            color: #ff6600;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Thank You for Your Order!</h1>
        <p>Dear Customer,</p>
        <p>Thank you for placing your order with CaterOrange. We have attached your invoice in PDF format to this email.</p>
    </div>
</body>
</html>`,
        attachments: [
            {
                filename: path.basename(invoiceFile),
                path: invoiceFile
            }
        ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(`Error sending email to ${emailTo}:`, error);
        }
        console.log('Email sent to:', emailTo, 'Response:', info.response);
    });
}

// Function to process an order
async function processOrder(orderId) {
    try {
        // Fetch invoice data and customer email from the database
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
            JOIN 
                corporateorder_details od ON co.corporateorder_id = od.corporateorder_id
            JOIN 
                payment p ON co.Paymentid = p.Paymentid
            JOIN 
                customer c ON co.customer_id = c.customer_id
            JOIN 
                corporate_category cc ON od.category_id = cc.category_id
            WHERE 
                co.corporateorder_id = ?;
        `;

        const results = await db.query(query, [orderId]);

        if (results.length === 0) {
            throw new Error('Order not found');
        }

        // Extract and format the invoice data
        const invoiceData = {
            invoiceNumber: `INV${results[0].invoiceNumber}`,
            date: results[0].orderedAt,
            restaurantName: results[0].corporateorder_details, // Assuming the restaurant name is in corporateorder_details
            orderNumber: results[0].invoiceNumber,
            deliveryAddress: results[0].deliveryAddress,
            orderedAt: results[0].orderedAt,
            customer: {
                name: results[0].customerName,
                phone: results[0].customerPhone,
                email: results[0].customerEmail
            },
            items: results.map(item => ({
                categoryName: item.categoryName,
                description: item.description,
                quantity: item.quantity,
                price: item.payment_amount // Assuming payment_amount is the item price
            })),
            tax: results[0].IGST + results[0].CGST + results[0].SGST,
            deliveryCharges: results[0].deliveryDetails, // Assuming deliveryDetails includes delivery charges
            paymentMethod: results[0].PaymentType
        };

        // Get customer email
        const customerEmail = invoiceData.customer.email;

        // Ensure the invoices directory exists
        if (!fs.existsSync('./invoices')) {
            fs.mkdirSync('./invoices');
        }

        // Generate the invoice PDF
        const invoiceFile = generateInvoice(invoiceData);

        // Send the invoice via email
        sendInvoiceByEmail(customerEmail, invoiceFile);

    } catch (error) {
        console.error('Error processing order:', error);
    }
}

// Example usage
const orderId = 123; // Replace with your order ID
processOrder(orderId);
