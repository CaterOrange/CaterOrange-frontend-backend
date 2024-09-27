// routes/invoiceRoutes.js
const express = require('express');
const router = express.Router();
const eoinvoiceController=require('../controller/eoinvoiceController')
const invoiceController = require('../controller/invoiceController');
const invoiceMiddleware = require('../middlewares/invoiceMiddleware');

// Ensure invoices directory exists before processing
router.use(invoiceMiddleware.ensureInvoicesDirectory);

// Route to process order
router.post('/processOrder/:orderId', async (req, res) => {
    try {
        const orderId = req.params.orderId;
        await invoiceController.processOrder(orderId);
        res.status(200).json({ message: 'Invoice processed and sent' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/eventprocessOrder/:orderId', async (req, res) => {
    try {
        const orderId = req.params.orderId;
        await eoinvoiceController.processOrder(orderId);
        res.status(200).json({ message: 'Invoice processed and sent' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;
