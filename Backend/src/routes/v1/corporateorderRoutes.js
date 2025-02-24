const express = require('express');
const router = express.Router();
const auth= require('../../middlewares/authMiddleware')


const corporateOrderController = require('../../controller/v1/corporateorderController');

router.post('/customer/cart/corporate',auth,corporateOrderController.add_Corporate_Cart)


router.get('/customer/getCorporateCarts',auth,corporateOrderController.getCorporateCart)
router.get('/customer/getCartCount', auth,corporateOrderController.getCartCount)
router.put('/customer/updateCartItem/:corporatecart_id',auth,corporateOrderController.updateCartItem);
router.delete('/customer/removeCartItem/:corporatecart_id',auth,corporateOrderController.deleteCartItem)



router.post('/customer/corporateOrderDetails',auth,corporateOrderController.addCorporateOrderDetails);
router.get('/customer/corporate/myorders',auth,corporateOrderController.getOrderDetails);
router.post('/customer/corporate/transfer-cart-to-order', auth,corporateOrderController.transferCartToOrder);


router.put('/customer/corporate/update-order-details/:corporateOrderId',auth,corporateOrderController.updateOrderDetails);





router.post('/customer/getcategorynameByid', auth,corporateOrderController.getcategorynameById)



module.exports = router;