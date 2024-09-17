const express = require('express');
const router = express.Router();
const eventController = require('../controller/eventorderController');
const { menuPage } = require('../controller/eventorderController');

// Transfer cart data to orders
router.post('/transfer-cart-to-order', eventController.transferCartToOrder);
router.post('/cart/add', eventController.addToCart);

// Route to get cart details by customer ID
router.get('/cart/:id', eventController.getCartByCustomerId);
router.get('/cart', eventController.getCart);
// Route to update cart by cart ID
router.put('/cart/:id', eventController.updateCart);
//Route to get the categories
router.get('/categories', eventController.fetchEventCategories);
// Route to delete a cart item by cart ID
router.delete('/cart/:id', eventController.deleteCart);

router.get('/menuPage',menuPage);   

module.exports = router;
