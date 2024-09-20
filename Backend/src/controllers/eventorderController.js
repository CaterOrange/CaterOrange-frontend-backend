const logger = require('../config/logger');
const cartModel = require('../../models/eventorderModels.js')

const fetchProducts = async (req, res) => {
  try {
    const categories = await cartModel.getAllProductCategories();
    res.send(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

const fetchCartItems = async (req, res) => {
  try {
    const { customer_id } = req.params;
    const cartItems = await cartModel.getCartItems(customer_id);
    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addToCart = async (req, res) => {
  const { totalAmount,cartData,address} = req.body;
  try { 
   // const token = req.headers["access_token"]
   //  const response = await customerController.getuserbytoken({ body: { access_token: token } })
   const customer_id = 1;
    const result = await cartModel.addCart( customer_id,totalAmount,cartData,address);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};


const getOrderDetails = async (req, res) => {
  try {
    // const token = req.headers["access_token"]
    // const response = await customerController.getuserbytoken({ body: { access_token: token } })
    const customer_id = 1
    const order = await cartModel.getOrderDetailsById(customer_id); 
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('Error retrieving order details:', error);
    res.status(500).json({ message: 'Server error' });
  }
}


const transferCartToOrder = async (req, res) => {
  console.log("in add to order controller",req.body)
  const { eventcart_id } = req.body;
  const customer_id = 1;
  try {
    const cart = await cartModel.getCartById(eventcart_id);
    console.log("cart data",cart);
    if (!cart) {
        return res.status(400).json({ error: 'Cart is empty or not found' });
      }
      const cartData = cart[0];
      const orderData = {
        customer_id: customer_id,
        delivery_status: 'Pending', 
        total_amount: cartData.total_amount,
        delivery_details: cartData.delivery_details,
        cart_order_details: cartData.cart_order_details,
        event_media: null, 
        customer_address: cartData.address,
        payment_status: 'Unpaid', 
        event_order_status: 'New' 
      };
    console.log("ordered data",orderData);
    const order = await cartModel.insertEventOrder(orderData);
    console.log("order",order);
    await cartModel.deleteCart(eventcart_id);
    res.status(201).json(order);
  } catch (error) {
    logger.error('Error transferring cart to order: ', error);
    res.status(500).json({ error: 'Error transferring cart to order', details: error.message });
  }
};


const orderbuyagain = async(req,res)=>{
  const customer_id = 1
  try{
    console.log("orderbuyagain:",req.body);
    const cartData = req.body;
    const orderData = {
      customer_id: customer_id,
      delivery_status: 'Pending', 
      total_amount: cartData.total_amount,
      delivery_details: cartData.delivery_details,
      cart_order_details: cartData.event_order_details,
      event_media: null, 
      customer_address: cartData.customer_address,
      payment_status: 'Unpaid', 
      event_order_status: 'New' 
    };
    console.log("ordered data",orderData);
    const order = await cartModel.insertEventOrder(orderData);
    console.log("order",order); 
  }catch(error){
    console.log("error in adding data to my orders table");
  }
}

const getCartItemCount = async (req, res) => {
  try {
    const customerId = req.user.id; 
    const query = 'SELECT cart_order_details FROM Cart WHERE customer_id = $1';
    const result = await client.query(query, [customerId]);
    if (result.rows.length > 0) {
      const cart = result.rows[0];
      const itemCount = cart.cart_order_details.length; 
      return res.status(200).json({ count: itemCount });
    } else {
      return res.status(200).json({ count: 0 }); 
    }
  } catch (error) {
    console.error('Error fetching cart item count:', error);
    return res.status(500).json({ error: 'An error occurred while fetching the cart item count' });
  }
};

module.exports = {
  fetchProducts,
  addToCart,
  getOrderDetails,
  transferCartToOrder,
  orderbuyagain,
  getCartItemCount,
  fetchCartItems
};

