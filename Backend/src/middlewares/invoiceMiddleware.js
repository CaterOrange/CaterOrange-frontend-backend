// middleware/invoiceMiddleware.js
const fs = require('fs');
const path = require('path');

// Middleware to ensure invoices directory exists
function ensureInvoicesDirectory(req, res, next) {
    const invoicesPath = path.join(__dirname, '..', 'invoices');
    if (!fs.existsSync(invoicesPath)) {
        fs.mkdirSync(invoicesPath);
    }
    next();
}

module.exports = {
    ensureInvoicesDirectory
};
