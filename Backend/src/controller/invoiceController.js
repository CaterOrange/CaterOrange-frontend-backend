
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const invoiceModel = require('../models/invoiceModel');

function generateInvoice(invoiceData) {
    const doc = new PDFDocument();
    const filePath = path.join(__dirname, '..', 'invoices', `invoice_${invoiceData.invoicenumber}.pdf`);
    doc.pipe(fs.createWriteStream(filePath));

    function addSection(title, data) {
        doc.fontSize(15).text(title, { underline: true });
        doc.fontSize(12);
        Object.entries(data).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
                doc.text(`${key}:`);
                Object.entries(value).forEach(([subKey, subValue]) => {
                    doc.text(`  ${subKey}: ${subValue}`);
                });
            } else {
                doc.text(`${key}: ${value}`);
            }
        });
        doc.moveDown();
    }

    // Title and Invoice Number
    doc.fontSize(25).text('Invoice', { align: 'center' });
    doc.fontSize(15).text(`Invoice Number: ${invoiceData.invoiceNumber}`, { align: 'right' });
    doc.moveDown();

    // Order Details
    addSection('Order Details', {
        Date: invoiceData.orderedAt,
        'Delivery Address': invoiceData.deliveryAddress,
        'Ordered At': invoiceData.orderedAt,
        
    });

    // Customer Details
    addSection('Customer Details', invoiceData.customer);

    // Items
    doc.fontSize(15).text('Order Items', { underline: true });
    doc.fontSize(12);
    
    // Table header
    const tableTop = doc.y + 10;
    const columns = ['Category', 'Description', 'Quantity', 'Price', 'Total'];
    const columnWidth = 100;
    columns.forEach((column, i) => {
        doc.text(column, i * columnWidth + 50, tableTop);
    });
    doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke();

    // Table rows
    let yPosition = tableTop + 30;
    let subtotal = 0;
    invoiceData.items.forEach(item => {
        const total = item.quantity * item.price;
        subtotal += total;
        [item.categoryName, item.description, item.quantity, `$${item.price}`, `$${total}`]
            .forEach((text, i) => {
                doc.text(text, i * columnWidth + 50, yPosition);
            });
        yPosition += 20;
    });

    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
    doc.moveDown();

    // Order Summary
    const total = subtotal + invoiceData.tax;
    addSection('Order Summary', {
        Subtotal: `$${subtotal}`,
        Tax: `$${invoiceData.tax}`,
        Total: `$${total}`,
        'Payment Method': invoiceData.paymentMethod
    });

    // Additional Data (if any)
    const additionalData = Object.entries(invoiceData).filter(([key]) => 
        !['invoiceNumber', 'date', 'restaurantName', 'orderNumber', 'deliveryAddress', 'orderedAt', 'customer', 'items', 'tax', 'deliveryCharges', 'paymentMethod'].includes(key)
    );

    if (additionalData.length > 0) {
        doc.addPage();
        doc.fontSize(20).text('Additional Information', { align: 'center' });
        doc.moveDown();
        additionalData.forEach(([key, value]) => {
            doc.fontSize(15).text(key, { underline: true });
            doc.fontSize(12).text(JSON.stringify(value, null, 2));
            doc.moveDown();
        });
    }

    doc.end();
    return filePath;
}

// Function to send email with invoice attached
function sendInvoiceByEmail(emailTo, invoiceFile) {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: emailTo,
            subject: 'Your Invoice from CaterOrange',
            html: `<!DOCTYPE html>
                   <html lang="en">
                   <head>
                       <meta charset="UTF-8">
                       <meta name="viewport" content="width=device-width, initial-scale=1.0">
                       <title>Thank You for Your Order - CaterOrange</title>
                       <style>
                           /* Add your email styles here */
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
                console.log(`Error sending email to ${emailTo}:`, error);
                reject(error);
            } else {
                console.log('Email sent to:', emailTo, 'Response:', info.response);
                resolve(info);
            }
        });
    });
}

// Function to process an order
async function processOrder(orderId) {
    try {
        const results = await invoiceModel.getInvoiceData(orderId);
        console.log("check",results);
        if (!results || results.length === 0) {
            throw new Error(`No order found for orderId: ${orderId}`);
        }
        const dateObj = new Date(results[0].orderedat);

// Extract day, month, and year
const day = String(dateObj.getUTCDate()).padStart(2, '0'); // Get the day and pad it to 2 digits
const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0'); // Get the month (0-indexed, so add 1) and pad to 2 digits
const year = dateObj.getUTCFullYear(); // Get the year

// Format the date as dd-mm-yyyy
const formattedDate = `${day}-${month}-${year}`;

console.log(formattedDate);

        const invoiceData = {
            invoiceNumber: `INV${results[0].invoicenumber ||''}`,
            date: formattedDate,
            restaurantName: results[0].corporateorder_details || 'N/A',
            orderNumber: results[0].invoicenumber || 'N/A',
            deliveryAddress: results[0].deliverydetails.delivery_address || 'N/A',
            orderedAt: formattedDate,
            customer: {
                ID:results[0].customerid || 'N/A',
                name: results[0].customername|| 'N/A',
                phone: results[0].customerphone || 'N/A',
                email: results[0].customeremail || 'N/A'
                
            },
            items: results.map(item => ({
                categoryName: item.categoryname || 'N/A',
                quantity: item.quantity || 0,
                price: item.payment_amount || 0
            })),
            tax: (results[0].IGST || 0) + (results[0].CGST || 0) + (results[0].SGST || 0),
            paymentMethod: results[0].paymenttype || 'N/A'
        };
        

        // Get customer email
        const customerEmail = invoiceData.customer.email;

        // Ensure the invoices directory exists
        const invoiceDir = path.join(__dirname, '..', 'invoices');
        if (!fs.existsSync(invoiceDir)) {
            fs.mkdirSync(invoiceDir, { recursive: true });
        }

        // Generate the invoice PDF
        const invoiceFile = generateInvoice(invoiceData);

        // Send the invoice via email
        await sendInvoiceByEmail(customerEmail, invoiceFile);

        // Clean up the generated PDF file
        fs.unlinkSync(invoiceFile);

        return { message: 'Invoice generated and sent successfully' };

    } catch (error) {
        console.error('Error processing order:', error);
        throw error; // Re-throw the error to be handled by the caller
    }
}

module.exports = {
    processOrder
};
