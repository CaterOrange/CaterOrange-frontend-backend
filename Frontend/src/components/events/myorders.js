

import React, { useEffect, useState } from 'react';
import { myorders, addtocart } from './action';
import { CheckCircleIcon, ChevronDown, ChevronUp, MinusCircleIcon } from 'lucide-react';

const OrderDashboard = ({selectedDate,numberOfPlates}) => {
  const [openOrderId, setOpenOrderId] = useState(null);
  const [OrdersData, setOrderData] = useState([]);
  const [processingOrders, setProcessingOrders] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  console.log("selected date",selectedDate)
  console.log("number of plates",numberOfPlates);
  
  const formatOrderDate = (selectedDate) => {
    const date = selectedDate;
    console.log("date:",date);
    return date;
  };

  useEffect(() => {
    const fetchOrders = async () => {
      const orderData = await myorders();
      console.log("Order data here:",orderData)
      setOrderData(orderData);
    };
    fetchOrders();
  }, []);
  
  const formattedOrders = OrdersData.map((order) => {
    const formattedItems = order.event_order_details.map((item) => ({
      name: item.productname,
      // plates: item.number_of_plates,
      pricePerUnit: item.priceperunit,
      pricePerKg: item.isdual ? item.priceperunit : undefined,
      quantity: item.quantity,
      amount: item.quantity * item.priceperunit,
      delivery_status: item.delivery_status
      
    }));

   
    const date = new Date(order.processing_date);

  const formattedDate = date.toLocaleDateString('en-GB');
    return {
      id: order.eventorder_generated_id,
      date: formattedDate,
      plates:order.number_of_plates,
      amount: order.total_amount,
      items: formattedItems,
      status: order.delivery_status,
    };

  });
  console.log("Formatted Orders",OrdersData)

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

  const renderProgressIcons = (progress) => {
    const stages = ['processing', 'shipped', 'delivered'];
    const activeIndex = stages.indexOf(progress);
    
    return (
      <div className="flex justify-between items-center">
      
        {stages.map((stage, index) => (
          <div key={stage} className="flex flex-col items-center">
            {index <= activeIndex ? (
              <CheckCircleIcon className="text-green-500 h-6 w-6 sm:h-7 sm:w-7 mb-1 transition-transform transform hover:scale-110" />
            ) : (
              <MinusCircleIcon className="text-gray-300 h-6 w-6 sm:h-7 sm:w-7 mb-1 transition-transform transform hover:scale-110" />
            )}
            <span className={`text-xs ${index <= activeIndex ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
              {stage.charAt(0).toUpperCase() + stage.slice(1)}
            </span>
          </div>
        ))}
      </div>
    );
  };
  return (
    <div>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{success}</div>}
      <div className='p-4'>
        {formattedOrders.length > 0 && formattedOrders.map((order) => (
          <div key={order.id} className=" rounded-lg border border-green-500 shadow-md overflow-hidden mb-4">
            <div className="p-4 cursor-pointer" onClick={() => handleOrderClick(order)}>
              <div className="flex flex-col sm:flex-row justify-between items-center mb-2 p-4 border border-gray-400 rounded-lg shadow-sm">
                  <div className="mb-2 sm:mb-0">
                    <p className="font-semibold text-lg">Order ID: {order.id}</p>
                    <p className="text-sm text-gray-600">Date of Order: {order.date}</p>
                    <p className="font-semibold text-xl">Amount: ₹{order.amount}</p>
                  </div>
                  {/* Uncomment the button if needed */}
                  {/* <button 
                    className="bg-red-100 text-red-500 px-3 py-1 rounded-full text-sm font-semibold"
                    onClick={(e) => { e.stopPropagation(); handleBuyAgain(order.id); }}
                    disabled={processingOrders[order.id]}
                  >
                    {processingOrders[order.id] ? 'Adding to Cart...' : 'Buy again'}
                  </button> */}
                </div>

              <div className="bg-gray-200 p-3 rounded-lg">
              {renderProgressIcons(order.status)}
              </div>
            </div>
            {openOrderId === order.id && (
              <div className="bg-gray-100 p-4 border-t border-gray-200">
                <h2 className="text-xl font-bold mb-4">Order Details</h2>
                <ul className="space-y-4">
                  {order.items.map((item, index) => (
                    <li key={index} className="flex items-center bg-green-50 space-x-4">
                      <img src="/api/placeholder/80/80" alt={item.name} className="w-20 h-20 rounded-full object-cover" />
                      <div className="flex-grow">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-600">No of plates: {order.plates}</p>
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