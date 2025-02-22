const express = require('express');
const router = express.Router();
const eventController=require('../../controller/v1/eventorderController')

router.get('/products',eventController.fetchProducts);
router.post('/cart/add', eventController.addToCart);   
router.get('/myorders',eventController.getOrderDetails);
router.post('/transfer-cart-to-order', eventController.transferCartToOrder);
router.post('/orderbuyagain',eventController.orderbuyagain);
router.get('/cart/getcart',eventController.getFromCart)

module.exports = router;
