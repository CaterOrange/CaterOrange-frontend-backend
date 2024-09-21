const express = require('express');
const router = express.Router();
const eventController = require('../controller/eventorderController');


router.get('/products', eventController.fetchProducts);
router.post('/cart/add', eventController.addToCart);   
router.get('/myorders',eventController.getOrderDetails);
router.post('/transfer-cart-to-order', eventController.transferCartToOrder);
router.post('/orderbuyagain',eventController.orderbuyagain);
// router.get('/getcartitems',eventController.fetchCartItems);
router.get('/cart/:customer_id', eventController.fetchCartItems);

module.exports = router;