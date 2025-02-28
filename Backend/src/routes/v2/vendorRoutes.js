const express = require('express');
const router = express.Router(); 
const { updateCorporateOrderMedia, bulkUpdateCorporateOrderMedia, getTodayCorporateOrders,updateCorporateOrderDeliveryStatus ,bulkUpdateCorporateOrderDeliveryStatus} = require('../../controller/v2/vendorController');
const auth = require('../../middlewares/authMiddleware.js');



router.put('/vendor/co/media/:corporateOrderGeneratedId/:categoryId', updateCorporateOrderMedia);
router.get('/vendor/co/getTodayOrders',getTodayCorporateOrders);

router.post('/vendor/co/media/bulk/:categoryId', bulkUpdateCorporateOrderMedia);

router.put('/vendor/co/deliveryStatus/:corporateOrderGeneratedId',updateCorporateOrderDeliveryStatus);


// In your routes file
router.put('/vendor/co/delivery-status/bulk', bulkUpdateCorporateOrderDeliveryStatus);

 
module.exports = router;
