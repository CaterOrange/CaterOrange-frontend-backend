const express = require('express');
const router = express.Router();
const auth= require('../middlewares/authMiddleware')
const corporateOrderController = require('../controller/corporateorderController');

router.post('/customer/cart/corporate',corporateOrderController.add_Corporate_Cart)
router.get('/customer/getCorporateCarts',corporateOrderController.getCorporateCart)
router.get('/customer/getCustomerDetails', auth, corporateOrderController.getCustomerDetails);
router.put('/customer/updateCartItem/:corporatecart_id',corporateOrderController.updateCartItem);
router.delete('/customer/removeCartItem/:corporatecart_id',corporateOrderController.deleteCartItem)
router.post('/customer/corporateOrderDetails',corporateOrderController.addCorporateOrderDetails);
router.get('/customer/corporate/myorders',corporateOrderController.getOrderDetails);
router.post('/customer/corporate/transfer-cart-to-order', corporateOrderController.transferCartToOrder);
router.post('/customer/getcategorynameByid', corporateOrderController.getcategorynameById)

module.exports = router;