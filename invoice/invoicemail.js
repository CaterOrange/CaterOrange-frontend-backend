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

    // Restaurant Details
    doc.fontSize(15).text('Restaurant Details');
    doc.text(`Restaurant: ${invoiceData.restaurantName}`);
    doc.text(`Order Number: ${invoiceData.orderNumber}`);
    doc.text(`Delivery Address: ${invoiceData.deliveryAddress}`);

    doc.moveDown();

    // Billing Details
    doc.fontSize(15).text('Billing Details');
    doc.text(`Name: ${invoiceData.customer.name}`);
    doc.text(`Address: ${invoiceData.customer.address}`);

    doc.moveDown();

    // Draw table headers
    const tableTop = doc.y;
    doc.fontSize(15).text('Item Description', 50, tableTop);
    doc.fontSize(15).text('Quantity', 250, tableTop);
    doc.fontSize(15).text('Price', 330, tableTop);
    doc.fontSize(15).text('Total', 400, tableTop);

    // Draw table separator line
    doc.moveTo(50, tableTop + 15)
        .lineTo(500, tableTop + 15)
        .stroke();

    // Add table rows
    let yPosition = tableTop + 30;
    let total = 0;
    invoiceData.items.forEach(item => {
        const itemTotal = item.quantity * item.price;
        total += itemTotal;

        doc.fontSize(12).text(item.description, 50, yPosition);
        doc.fontSize(12).text(item.quantity, 250, yPosition);
        doc.fontSize(12).text(`$${item.price.toFixed(2)}`, 330, yPosition);
        doc.fontSize(12).text(`$${itemTotal.toFixed(2)}`, 400, yPosition);

        yPosition += 20;
    });

    // Draw table bottom border
    doc.moveTo(50, yPosition)
        .lineTo(500, yPosition)
        .stroke();

    // Add order summary
    doc.moveDown();
    doc.fontSize(15).text('Order Summary', { align: 'left' });
    doc.text(`Subtotal: $${total.toFixed(2)}`);
    doc.text(`Tax: $${invoiceData.tax.toFixed(2)}`);
    doc.text(`Delivery Charges: $${invoiceData.deliveryCharges.toFixed(2)}`);
    doc.text(`Payment Method: ${invoiceData.paymentMethod}`);
    doc.text(`Total Amount: $${(total + invoiceData.tax + invoiceData.deliveryCharges).toFixed(2)}`, { align: 'right' });

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

// Function to generate a new invoice and send it via email
function processOrder(invoiceData, customerEmail) {
    const lastInvoiceNumber = readCounter();
    const newInvoiceNumber = (lastInvoiceNumber + 1).toString().padStart(6, '0'); // Format as INV001, INV002, etc.

    invoiceData.invoiceNumber = `INV${newInvoiceNumber}`;
    writeCounter(parseInt(newInvoiceNumber));

    // Ensure the invoices directory exists
    if (!fs.existsSync('./invoices')) {
        fs.mkdirSync('./invoices');
    }

    // Generate the invoice PDF
    const invoiceFile = generateInvoice(invoiceData);

    // Send the invoice via email
    sendInvoiceByEmail(customerEmail, invoiceFile);
}

// Example invoice data and email
const invoiceData = {
    date: '2024-09-17',
    restaurantName: 'CaterOrange',
    orderNumber: 'ORD123456',
    deliveryAddress: '123 Foodie Street, Madhapur',
    customer: {
        name: 'Chandrika'
    },
    items: [
        { description: 'Breakfast', quantity: 2, price: 30.00 },
        { description: 'Lunch', quantity: 1, price: 99.00 }
    ],
    tax: 12.00, // Example tax amount
    deliveryCharges: 5.00, // Example delivery charge
    paymentMethod: 'Credit Card' // Example payment method
};

const customerEmail = 'kondapallichandrika17@gmail.com';

// Process the order (generate and email invoice)
processOrder(invoiceData, customerEmail);