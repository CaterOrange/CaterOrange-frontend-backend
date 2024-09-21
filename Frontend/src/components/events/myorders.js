import React, { useEffect, useState } from 'react';
import { myorders, addtocart } from './action';
import { ChevronDown, ChevronUp } from 'lucide-react';

const OrderDashboard = () => {
  const [openOrderId, setOpenOrderId] = useState(null);
  const [OrdersData, setOrderData] = useState([]);
  const [processingOrders, setProcessingOrders] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
 

  const formatOrderDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  useEffect(() => {
    const fetchOrders = async () => {
      const orderData = await myorders();
      setOrderData(orderData);
    };
    fetchOrders();
  }, []);

  const formattedOrders = OrdersData.map((order) => {
    const formattedItems = order.event_order_details.map((item) => ({
      name: item.productname,
      plates: item.minunitsperplate,
      pricePerUnit: item.priceperunit,
      pricePerKg: item.isdual ? item.priceperunit : undefined,
      quantity: item.quantity,
      amount: item.quantity * item.priceperunit,
    }));
    return {
      id: order.eventorder_generated_id,
      date: formatOrderDate(order.ordered_at),
      amount: order.total_amount,
      items: formattedItems,
      status: order.event_order_status,
    };
  });

  const handleOrderClick = (order) => {
    if (openOrderId === order.id) {
      setOpenOrderId(null);
    } else {
      setOpenOrderId(order.id);
    }
  };

  const handleBuyAgain = async (orderId) => {
    setError(null);
    setSuccess(null);
    setProcessingOrders((prev) => ({ ...prev, [orderId]: true }));
  
    try {
      const cart = getCartFromOrderId(orderId);
  
      const { cart_id } = await addtocart(cart);
      setCartId(cart_id);
  
      setSuccess(`Order ${orderId} was successfully added to the cart.`);
    } catch (error) {
      setError(`Failed to add order ${orderId} to the cart.`);
    } finally {
      setProcessingOrders((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 bg-green-600 text-white p-2 rounded-t-lg">Your Orders</h1>
      <div className="flex space-x-2 mb-4">
        <button className="bg-orange-100 text-orange-500 border border-orange-500 rounded-full px-4 py-1">CORPORATE</button>
        <button className="bg-blue-100 text-blue-500 border border-blue-500 rounded-full px-4 py-1">EVENT</button>
      </div>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{success}</div>}
      <div className="space-y-4">
        {formattedOrders.length > 0 && formattedOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 cursor-pointer" onClick={() => handleOrderClick(order)}>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-semibold">Order ID: {order.id}</p>
                  <p className="text-sm text-gray-600">Date of Order: {order.date}</p>
                  <p className="font-semibold">Amount: ₹{order.amount}</p>
                </div>
                <button 
                  className="bg-red-100 text-red-500 px-3 py-1 rounded-full text-sm font-semibold"
                  onClick={(e) => { e.stopPropagation(); handleBuyAgain(order.id); }}
                  disabled={processingOrders[order.id]}
                >
                  {processingOrders[order.id] ? 'Adding to Cart...' : 'Buy again'}
                </button>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <h3 className="text-center font-semibold mb-2">Order progress</h3>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-400 mb-1"></div>
                    <span className="text-xs">Processing</span>
                  </div>
                  <div className="h-1 flex-grow bg-gray-300 mx-2"></div>
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-400 mb-1"></div>
                    <span className="text-xs">Shipped</span>
                  </div>
                  <div className="h-1 flex-grow bg-gray-300 mx-2"></div>
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-green-400 mb-1"></div>
                    <span className="text-xs">Delivery</span>
                  </div>
                </div>
              </div>
            </div>
            {openOrderId === order.id && (
              <div className="bg-white p-4 border-t border-gray-200">
                <h2 className="text-xl font-bold mb-4">Order Details</h2>
                <ul className="space-y-4">
                  {order.items.map((item, index) => (
                    <li key={index} className="flex items-center space-x-4">
                      <img src="/api/placeholder/80/80" alt={item.name} className="w-20 h-20 rounded-full object-cover" />
                      <div className="flex-grow">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-600">No of plates: {item.plates}</p>
                        <p className="text-sm text-gray-600">Price per {item.pricePerUnit ? 'unit' : 'kg'}: ₹{item.pricePerUnit || item.pricePerKg}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity} {item.pricePerUnit ? 'units' : 'kgs'}</p>
                        <p className="text-sm font-semibold">Amount: ₹{item.amount}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderDashboard;