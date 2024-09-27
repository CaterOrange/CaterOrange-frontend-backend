
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const invoiceModel = require('../models/eoinvoiceModel');

function safeNumber(value, defaultValue = 0) {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
}

function generateInvoice(invoiceData) {
    const doc = new PDFDocument();
    const filePath = path.join(__dirname, '..', 'invoices', `invoice_${invoiceData.invoiceNumber}.pdf`);
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
        'Total Amount': `$${safeNumber(invoiceData.totalAmount).toFixed(2)}`
    });

    // Customer Details
    addSection('Customer Details', invoiceData.customer);

    // Items
    doc.fontSize(15).text('Order Items', { underline: true });
    doc.fontSize(12);

    // Table header
    const tableTop = doc.y + 10;
    const columns = ['Category', 'Description', 'Quantity', 'Price', 'NO. of plates', 'Total'];
    const columnWidths = [80, 120, 60, 60, 80, 80];
    let xPosition = 50;
    columns.forEach((column, i) => {
        doc.text(column, xPosition, tableTop);
        xPosition += columnWidths[i];
    });
    doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke();

    // Table rows
    let yPosition = tableTop + 30;
    let subtotal = 0;
    invoiceData.items.forEach(item => {
        const quantity = safeNumber(item.quantity);
        const price = safeNumber(item.price);
        const price2 = safeNumber(item.price2);
        const number_of_plates = safeNumber(item.number_of_plates, 1);
        const minunits2perplate = safeNumber(item.minunits2perplate, 1);

        let total;
        
        if (item.unit=="plate_units") {
            total = price * number_of_plates * quantity;
            console.log(`${price}*${number_of_plates} * ${quantity}=${price*number_of_plates*quantity}`)
        } else {
            total = minunits2perplate * number_of_plates * price2 * quantity;
            console.log(`${price2}*${number_of_plates} * ${minunits2perplate}*${quantity}=${price2*number_of_plates*quantity*minunits2perplate}`)

        }
        
        subtotal += total;
        xPosition = 50;
        [
            item.categoryName,
            item.productName,
            quantity.toString(),
            `$${(price > 0 ? price : price2).toFixed(2)}`,
            number_of_plates.toString(),
            `$${total.toFixed(2)}`
        ].forEach((text, i) => {
            doc.text(text, xPosition, yPosition, { width: columnWidths[i], align: 'left' });
            xPosition += columnWidths[i];
        });
        yPosition += 20;
    });

    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
    doc.moveDown();

    // Order Summary
    const tax = safeNumber(invoiceData.tax);
    const total = subtotal + tax;
    addSection('Order Summary', {
        Subtotal: `$${subtotal.toFixed(2)}`,
        Tax: `$${tax.toFixed(2)}`,
        Total: `$${total.toFixed(2)}`,
        'Payment Method': invoiceData.paymentMethod,
        'Payment Reference ID': invoiceData.paymentReferenceId
    });

    doc.end();
    return filePath;
}

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
            html: `
                <h1>Thank You for Your Order!</h1>
                <p>Dear Customer,</p>
                <p>Thank you for placing your order with CaterOrange. We have attached your invoice in PDF format to this email.</p>
            `,
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

async function processOrder(orderId) {
    try {
        const results = await invoiceModel.getInvoiceData(orderId);
        console.log("Invoice data:", JSON.stringify(results, null, 2));

        if (!results || results.length === 0) {
            throw new Error(`No order found for orderId: ${orderId}`);
        }

        const dateObj = new Date(results[0].orderedat);
        const formattedDate = dateObj.toLocaleDateString('en-GB');

        const invoiceData = {
            invoiceNumber: `INV${results[0].invoicenumber || ''}`,
            orderedAt: formattedDate,
            deliveryAddress: results[0].deliveryaddress || 'N/A',
            totalAmount: safeNumber(results[0].totalamount),
            customer: {
                ID: results[0].customerid || 'N/A',
                name: results[0].customername || 'N/A',
                phone: results[0].customerphone || 'N/A',
                email: results[0].customeremail || 'N/A'
            },
            items: (() => {
                try {
                    return (results[0].eventorderdetails).map(item => ({
                        productName: item.productname,
                        categoryName: item.category_name,
                        quantity: safeNumber(item.quantity),
                        price: safeNumber(item.priceperunit),
                        price2: safeNumber(item.price_per_wtorvol_units),
                        number_of_plates: safeNumber(results[0].number_of_plates, 1),
                        minunits2perplate: safeNumber(item.min_wtorvol_units_per_plate || 1, 1),
                        isdual:item.isdual,
                        unit:item.unit
                    }));
                } catch (error) {
                    console.error('Error parsing eventorderdetails:', error);
                    return [];
                }
            })(),
            tax: safeNumber(results[0].IGST) + safeNumber(results[0].CGST) + safeNumber(results[0].SGST),
            paymentMethod: results[0].PaymentType || 'N/A',
            paymentReferenceId: results[0].PhonePeReferenceId || 'N/A'
        };

        console.log("Prepared invoiceData:", JSON.stringify(invoiceData, null, 2));

        const customerEmail = invoiceData.customer.email;

        const invoiceDir = path.join(__dirname, '..', 'invoices');
        if (!fs.existsSync(invoiceDir)) {
            fs.mkdirSync(invoiceDir, { recursive: true });
        }

        const invoiceFile = generateInvoice(invoiceData);
        await sendInvoiceByEmail(customerEmail, invoiceFile);
        fs.unlinkSync(invoiceFile);

        return { message: 'Invoice generated and sent successfully' };

    } catch (error) {
        console.error('Error processing order:', error);
        throw error;
    }
}

module.exports = {
    processOrder
};