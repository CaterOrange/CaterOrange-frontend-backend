const express = require('express');
const router = express.Router();
const eventController = require('../controller/eventorderController');
const auth = require('../middlewares/authMiddleware');


router.get('/products',auth, eventController.fetchProducts);
router.post('/cart/add',auth, eventController.addToCart);   
router.get('/myorders',auth,eventController.getOrderDetails);
router.post('/transfer-cart-to-order',auth, eventController.transferCartToOrder);
router.post('/orderbuyagain',auth,eventController.orderbuyagain);
router.get('/cart/getcart',auth,eventController.getFromCart)

module.exports = router;
