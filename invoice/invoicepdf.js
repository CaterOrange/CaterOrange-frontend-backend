const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

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

    // File path
    const filePath = path.join(__dirname, 'invoices', `invoice_${invoiceData.invoiceNumber}.pdf`);
    doc.pipe(fs.createWriteStream(filePath));

    // Title
    doc.fontSize(25).text('Invoice', { align: 'center' });
    doc.fontSize(15).text(`Invoice Number: ${invoiceData.invoiceNumber}`, { align: 'right' });
    doc.fontSize(15).text(`Date: ${invoiceData.date}`);

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

    // Total
    doc.moveDown();
    doc.fontSize(15).text(`Total Amount: $${total.toFixed(2)}`, { align: 'right' });

    // Finalize the PDF
    doc.end();
}

// Generate a new invoice
function generateNewInvoice(invoiceData) {
    const lastInvoiceNumber = readCounter();
    const newInvoiceNumber = (lastInvoiceNumber + 1).toString().padStart(6, '0'); // Format as INV001, INV002, etc.

    invoiceData.invoiceNumber = `INV${newInvoiceNumber}`;
    writeCounter(parseInt(newInvoiceNumber));

    // Ensure the invoices directory exists
    if (!fs.existsSync('./invoices')) {
        fs.mkdirSync('./invoices');
    }

    // Generate the invoice PDF
    generateInvoice(invoiceData);
}

// Example invoice data
const invoiceData = {
    date: '2024-09-17',
    customer: {
        name: 'John Doe',
        address: '123 Elm Street, Springfield, IL'
    },
    items: [
        { description: 'Widget A', quantity: 2, price: 10.00 },
        { description: 'Widget B', quantity: 1, price: 20.00 }
    ]
};

// Generate the new invoice with a unique ID
generateNewInvoice(invoiceData);