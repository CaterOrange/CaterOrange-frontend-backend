const express = require('express');
const router = express.Router(); 
const { updateCorporateOrderMedia , getTodayCorporateOrders,bulkUpdateCorporateOrderMedia} = require('../../controller/v2/admincontroller.js');
const auth = require('../../middlewares/authMiddleware.js');



router.put('/co/media/:corporateOrderGeneratedId/:categoryId', updateCorporateOrderMedia);
router.get('/co/getTodayOrders',getTodayCorporateOrders);

router.post('/co/media/bulk/:categoryId', bulkUpdateCorporateOrderMedia);

 
module.exports = router;
