const express = require('express');
const router = express.Router()
const adminController = require('../controller/adminController');


router.get('/api/customers/:id',adminController.getCustomerById)
router.get('/api/customers',adminController.getCustomers)
router.delete('/api/deleteCustomer/:id',adminController.deleteCustomer)
router.put('/api/updatecustomer/:id',adminController.updateUser)

router.get('/api/corporateorders',adminController.getCorporateOrders);
router.get('/api/eventorders',adminController.getEventOrders);

router.get('/api/itemslist',adminController.getItemslist);

router.get('/api/payment',adminController.getPayment);
router.delete('/api/deletecorporateorder',adminController.deleteCorporateOrder);
router.delete('/api/deleteeventorder',adminController.deleteEventOrder);


router.delete('/api/deletecorporateorderbyid/:id',adminController.deleteCorporateorderByOrderId)

router.delete('/api/deleteeventorderbyid/:id',adminController.deleteEventorderByOrderId);

router.put('/api/updateorderstatus/:id',adminController.updateOrderStatus);

router.put('/api/updatecorporateorderstatus/:id',adminController.updateCorporateOrderStatus);

router.get('/api/corporatecategories',adminController.getcorporatecategory);

router.put('/api/deactivetrue/:id',adminController.toggleDeactivation);
router.get('/api/analytics', adminController.getAnalyticsData);

module.exports = router;