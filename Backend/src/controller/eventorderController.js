const {
    createEventOrder,
    getEventOrderById,
    getAllEventOrdersByCustomerId,
} = require('../models/eventorderModels');

async function createEventOrderController(req, res) {
    const { customer_id, order_date, status, total_amount, vendor_id, delivery_id, eventcart_id } = req.body;
  
    try {
        const order = await createEventOrder(customer_id, { order_date, status, total_amount, vendor_id, delivery_id, eventcart_id });
        res.status(201).json({ message: 'Event order created successfully', order });
    } catch (error) {
        console.error('Error creating event order:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function getEventOrderByIdController(req, res) {
    const { id } = req.params;
  
    try {
        const order = await getEventOrderById(id);
  
        if (!order) {
            return res.status(404).json({ message: 'Event order not found' });
        }
  
        res.status(200).json({ order });
    } catch (error) {
        console.error('Error retrieving event order:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function getAllEventOrdersByCustomerIdController(req, res) {
    const { customer_id } = req.body; 
  
    try {
        const orders = await getAllEventOrdersByCustomerId(customer_id);
        res.status(200).json({ orders });
    } catch (error) {
        console.error('Error retrieving event orders:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    createEventOrderController,
    getAllEventOrdersByCustomerIdController,
    getEventOrderByIdController
};
