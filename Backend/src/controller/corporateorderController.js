const corporateOrderDetailsModel = require('../models/corporateorderModels');
const customerController=require('../controller/customerController')
const addCorporateOrderDetails = async (req, res) => {
  const { corporateorder_id, orderDetails } = req.body;

  if (!corporateorder_id || !Array.isArray(orderDetails) || orderDetails.length === 0) {
    return res.status(400).json({ message: 'Invalid data provided' });
  }

  try {
    const insertedDetails = [];
    
    for (const detail of orderDetails) {
      const formattedDate = new Date(detail.date.split('/').reverse().join('-')); // Convert dd/mm/yyyy to yyyy-mm-dd
      const detailData = {
        processing_date: formattedDate,
        delivery_status: detail.progress,
        category_id: detail.category_id, // Assuming category_id is static, otherwise get it dynamically
        quantity: detail.quantity,
        active_quantity: detail.active_quantity,
        media: null, // As per your requirement, media is not to be inserted
        delivery_details: { status: detail.status }
      };

      // Insert into the database using the model
      const insertedDetail = await corporateOrderDetailsModel.insertCorporateOrderDetails(corporateorder_id, detailData);
      insertedDetails.push(insertedDetail);
    }

    res.status(201).json({
      message: 'Order details added successfully',
      data: insertedDetails
    });
  } catch (error) {
    console.error('Error adding order details:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};



    // Controller function to handle the API request
   const getOrderDetails = async (req, res) => {
      // Extract order ID from request params
  
      try {
        // Fetch order details using the model function

        const token = req.headers["access_token"]
        const response = await customerController.getuserbytoken({ body: { access_token: token } })
        const customer_id = response.customer_id
        console.log(customer_id)
        const order = await corporateOrderDetailsModel.getOrderDetailsById(customer_id);
        
        if (!order) {
          return res.status(404).json({ message: 'Order not found' });
        }
  
        // Send back only corporateorder_generated_id and order_details
        res.status(200).json({
          corporateorder_generated_id: order.corporateorder_generated_id,
          order_details: order.order_details
        });
      } catch (error) {
        console.error('Error retrieving order details:', error);
        res.status(500).json({ message: 'Server error' });
      }
    }
  
module.exports = {
  addCorporateOrderDetails,getOrderDetails
};