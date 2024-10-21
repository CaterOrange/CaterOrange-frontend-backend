import React, { useEffect, useState, useCallback } from 'react';
import { CakeIcon, CalendarIcon, CheckCircleIcon, HomeIcon, MinusCircleIcon } from '@heroicons/react/solid';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import OrderDashboard from '../events/myorders';

const CorporateOrders = () => {
  const [showCorporate, setShowCorporate] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('hiiiiii')
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_URL}/api/customer/corporate/myorders`, {
          headers: { token: `${token}` },
        });
        if (response.data && response.data.data) {
          const ordersWithCategoryNames = await Promise.all(
            response.data.data.map(async (order) => {
              const updatedOrderDetails = await Promise.all(
                order.order_details.map(async (detail) => {
                  const categoryName = await fetchCategoryName(detail.category_id);
                  return { ...detail, category_name: categoryName };
                })
              );
              return { ...order, order_details: updatedOrderDetails };
            })
          );
          setOrderData(ordersWithCategoryNames);
        } else {
          setError('No data received from the server.');
          setOrderData(null);
        }
      } catch (error) {
        console.error('Error fetching corporate order data:', error);
        setError('Failed to fetch orders. Please try again later.');
        setOrderData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const fetchCategoryName = async (categoryId) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_URL}/api/customer/getcategorynameById`,
        { categoryId }
      );
      return response.data.categoryname.category_name;
    } catch (error) {
      console.error('Error fetching category name:', error);
      return 'Unknown Category';
    }
  };

  const toggleOrderDetails = useCallback((orderId) => {
    setExpandedOrders(prev => {
      const newExpandedOrders = prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId];
      console.log('Toggled order:', orderId, 'New expanded orders:', newExpandedOrders);
      return newExpandedOrders;
    });
  }, []);

  const handleViewHome = () => {
    if(showCorporate){
    navigate('/home');
   }else{
      navigate('/home'); 
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
              <CheckCircleIcon className="text-green-500 h-4 w-4 sm:h-6 sm:w-6 mb-1 transition-transform transform hover:scale-110" />
            ) : (
              <MinusCircleIcon className="text-gray-400 h-4 w-4 sm:h-6 sm:w-6 mb-1 transition-transform transform hover:scale-110" />
            )}
            <span className={`text-xs ${index <= activeIndex ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
              {stage.charAt(0).toUpperCase() + stage.slice(1)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderOrder = useCallback((order) => {
    const isExpanded = expandedOrders.includes(order.corporateorder_generated_id);
    console.log('Rendering order:', order.corporateorder_generated_id, 'Expanded:', isExpanded);
    
    return (
      <div key={order.corporateorder_generated_id} className="w-full bg-white rounded-lg border shadow-md hover:shadow-xl transition-shadow duration-300 mx-3 sm:mx-4 mb-4">
        <div
          className="flex justify-between items-center p-4 sm:p-6 bg-blue-100 cursor-pointer hover:bg-blue-200 transition-colors rounded-t-lg"
          onClick={() => toggleOrderDetails(order.corporateorder_generated_id)}
        >
          <div className="w-full">
            <p className="text-lg sm:text-xl font-bold text-blue-700">Order ID: {order.corporateorder_generated_id}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
  Date: {new Date(order.ordered_at).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })} {new Date(order.ordered_at).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, // This enables AM/PM formatting
  })}
</p>

          </div>
         
        </div>

        {/* {isExpanded && (
          <div className="p-4 sm:p-6 overflow-x-auto">
            <table className="w-full bg-white min-w-max">
              <thead className="bg-gray-100 text-left text-xs sm:text-sm">
                <tr>
                  <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Category Name</th>
                  <th className="p-2 sm:p-6 lg:p-4 whitespace-nowrap">Progress</th>
                  <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Date</th>
                  <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Qty</th>
                  <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Active Qty</th>
                  <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {order.order_details.map((detail, i) => (
                  <tr key={i} className="border-t text-xs sm:text-sm hover:bg-gray-50">
                    <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">
                      {detail.category_name || 'Unknown Category'}
                    </td>
                    <td className="p-2 sm:p-6 lg:p-4 whitespace-nowrap">{renderProgressIcons(detail.delivery_status)}</td>
                    <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">{detail.processing_date}</td>
                    <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">{detail.quantity}</td>
                    <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">{detail.active_quantity}</td>
                    <td
                      className={`p-2 sm:p-3 lg:p-4 font-bold whitespace-nowrap ${
                        detail.status === 'cancelled' ? 'text-red-500' : 'text-green-500'
                      }`}
                    >
                      {detail.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )} */}

{isExpanded && (
  <div className="p-4 sm:p-6 overflow-x-auto">
    <table className="w-full bg-white min-w-max">
      <thead className="bg-gray-100 text-left text-xs sm:text-sm">
        <tr>
          <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Category Name</th>
          <th className="p-2 sm:p-6 lg:p-4 whitespace-nowrap w-1/3 text-center">Progress</th> {/* Adjust the width here */}
          <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Date</th>
          <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Qty</th>
          <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Active Qty</th>
          <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Status</th>
        </tr>
      </thead>
      <tbody>
        {order.order_details.map((detail, i) => (
          <tr key={i} className="border-t text-xs sm:text-sm hover:bg-gray-50">
            <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">
              {detail.category_name || 'Unknown Category'}
            </td>
            <td className="p-2 sm:p-6 lg:p-4 whitespace-nowrap w-1/4"> {/* Ensure the same width in the body as in the header */}
              {renderProgressIcons(detail.delivery_status)}
            </td>
            <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">{detail.processing_date}</td>
            <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">{detail.quantity}</td>
            <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">{detail.active_quantity}</td>
            <td
              className={`p-2 sm:p-3 lg:p-4 font-bold whitespace-nowrap ${
                detail.status === 'cancelled' ? 'text-red-500' : 'text-green-500'
              }`}
            >
              {detail.status}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

      </div>
    );
  }, [expandedOrders, toggleOrderDetails]);

  // return (
  //   <>

  //     <header className="fixed top-0 left-0 w-full bg-green-500 h-16 flex items-center pl-4">
  //       <Link to='/home'>
  //         <HomeIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white mr-2" onClick={handleViewHome}/> 
  //       </Link>
  //       <h1 className="text-2xl sm:text-3xl lg:text-4xl text-white">
  //         My Orders
  //       </h1>
  //     </header>

  //     <div className="w-full my-4 sm:my-10 px-4 sm:px-6 lg:px-8 xl:px-0 bg-gradient-to-r from-blue-50 to-white shadow-xl rounded-lg">
  //       <div className="flex justify-center gap-4 sm:gap-6 mb-6 sm:mb-10">
  //         <button
  //           className={`py-2 px-4 sm:py-3 sm:px-8 rounded-full font-semibold text-sm sm:text-lg transition-all duration-300 transform ${
  //             showCorporate ? 'bg-yellow-500 text-white shadow-lg hover:scale-105' : 'bg-gray-300 text-gray-700 hover:scale-105'
  //           }`}
  //           onClick={() => setShowCorporate(true)}
  //         >
  //           <CakeIcon className="h-5 w-5 inline-block mr-2" />
  //           Corporate
  //         </button>
  //         <button
  //           className={`py-2 px-4 sm:py-3 sm:px-8 rounded-full font-semibold text-sm sm:text-lg transition-all duration-300 transform ${
  //             !showCorporate ? 'bg-green-500 text-white shadow-lg hover:scale-105' : 'bg-gray-300 text-gray-700 hover:scale-105'
  //           }`}
  //           onClick={() => setShowCorporate(false)}
  //         >
  //           <CalendarIcon className="h-5 w-5 inline-block mr-2" />
  //           Events
  //         </button>
  //       </div>

  //       {showCorporate && (
  //         <div className="space-y-4 sm:space-y-8 w-full">
  //           {isLoading ? (
  //             <p>Loading orders...</p>
  //           ) : error ? (
  //             <p className="text-red-500">{error}</p>
  //           ) : orderData ? (
  //             orderData.map(renderOrder)
  //           ) : (
  //             <p>No corporate orders found.</p>
  //           )}
  //         </div>
  //       )}

  //       {!showCorporate && (
  //         <div className="text-center py-8">
  //           <p className="text-lg text-gray-700"><OrderDashboard /></p>
  //         </div>
  //       )}
  //     </div>
  //   </>
  // );
  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-green-500 h-16 flex items-center pl-4 z-50">
     
          <HomeIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white mr-2" onClick={handleViewHome}/> 
   
        <h1 className="text-2xl sm:text-3xl lg:text-4xl text-white">
          My Orders
        </h1>
      </header>
  
      {/* Fixed Button Group below the header */}
      <div className="fixed p-5 top-16 left-0 w-full bg-white shadow-md z-40 flex justify-center gap-4 sm:gap-6 py-2 sm:py-4">
        <button
          className={`py-2 px-4 sm:py-3 sm:px-8 w-full max-w-[200px] rounded-full font-semibold text-sm sm:text-lg transition-all duration-300 transform ${
            showCorporate ? 'bg-yellow-500 text-white shadow-lg hover:scale-105' : 'bg-gray-300 text-gray-700 hover:scale-105'
          }`}
          onClick={() => setShowCorporate(true)}
        >
          <CakeIcon className="sm:h-5 w-5 lg:h-10inline-block mr-2" />
          Corporate
        </button>
        <button
          className={`py-2 px-4 sm:py-3 sm:px-8 w-full max-w-[200px] rounded-full font-semibold text-sm sm:text-lg transition-all duration-300 transform ${
            !showCorporate ? 'bg-green-500 text-white shadow-lg hover:scale-105' : 'bg-gray-300 text-gray-700 hover:scale-105'
          }`}
          onClick={() => setShowCorporate(false)}
        >
          <CalendarIcon className="h-5 w-5 inline-block mr-2" />
          Events
        </button>
      </div>
  
      {/* Content Container */}
      <div className="w-full mt-32 sm:mt-48 px-4 sm:px-4 lg:px-8 xl:px-8 bg-gradient-to-r from-blue-50 to-white shadow-xl rounded-lg">
        {showCorporate ? (
          <div className="space-y-4 sm:space-y-8 w-full">
            {isLoading ? (
              <p>Loading orders...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : orderData ? (
              orderData.map(renderOrder)
            ) : (
              <p>No corporate orders found.</p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-lg text-gray-700"><OrderDashboard /></p>
          </div>
        )}
      </div>
    </>
  );
  
  
};

export default CorporateOrders;