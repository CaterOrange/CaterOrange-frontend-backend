
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, MinusCircleIcon, UserCircleIcon } from '@heroicons/react/solid';
import axios from 'axios';
import { Loader } from 'lucide-react';
import OrderDashboard from '../events/myorders';
import { VerifyToken } from '../../MiddleWare/verifyToken';

// Navbar Component
const Navbar = ({ activeTab, toggleSidenav, cartCount }) => {
  return (
    <header className="fixed top-0 left-0 w-full bg-gradient-to-r from-teal-700 to-teal-600 text-white shadow-md py-4 px-6 z-20">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0">
          <UserCircleIcon
            className="h-9 w-9 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={toggleSidenav} 
          />
        </div>

        <div className="flex-1 flex justify-center">
          <h2 className="text-lg md:text-2xl font-bold text-white text-center font-serif">
            My Orders
          </h2>
        </div>
      </div>
    </header>
  );
};

// Sidenav Component
const Sidenav = ({ isOpen, onClose, sidenavRef, userDP }) => {
  const navigate = useNavigate();
  
  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    return names.map((n) => n[0]).join('').toUpperCase();
  };

  const handleNavigation = (path) => {
    onClose();
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userDP');
    localStorage.removeItem('address');
    window.location.href = '/';
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div
        ref={sidenavRef}
        className={`fixed top-0 left-0 h-full w-72 bg-white text-black shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 bg-teal-800 text-white">
          <div className="flex justify-end p-2">
            <button 
              className="text-white hover:opacity-80 transition-opacity" 
              onClick={onClose}
              aria-label="Close menu"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>

          <div className="flex flex-col items-center">
            {userDP.picture ? (
              <img
                src={userDP.picture}
                alt="Profile"
                className="rounded-full w-16 h-16 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="rounded-full w-16 h-16 bg-gray-300 flex items-center justify-center text-xl font-bold text-gray-700">
                {getInitials(userDP.name)}
              </div>
            )}

            <h3 className="mt-2 font-medium">{userDP.name || 'Hello'}</h3>
            {userDP.phone && <p className="text-sm mt-1">{userDP.phone}</p>}
            <p className="text-sm mt-1">{userDP.email || 'Email Address'}</p>
          </div>
        </div>

        <nav>
          <ul className="p-2 space-y-1">
            {[
              {label:'Home', path:'/home'},
              { label: 'My Orders', path: '/orders' },
              { label: 'Contact Us', path: '/contact' },
              // { label: 'Wallet', path: '/wallet' },
              { label: 'Settings', path: '/settings' }
            ].map((item) => (
              <li key={item.path}>
                <button
                  className="w-full p-3 text-left rounded hover:bg-gray-100 transition-colors"
                  onClick={() => handleNavigation(item.path)}
                >
                  {item.label}
                </button>
              </li>
            ))}
            <li>
              <button
                className="w-full p-3 text-left text-red-600 rounded hover:bg-red-50 transition-colors"
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

// Main Component
const CorporateOrders = () => {
  const [showCorporate, setShowCorporate] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);
  const [isSidenavOpen, setIsSidenavOpen] = useState(false);
  const [userDP, setUserDP] = useState({});
  const sidenavRef = useRef(null);
  const navigate = useNavigate();

  VerifyToken();

  useEffect(() => {
    const userDPData = localStorage.getItem('userDP');
    if (userDPData) {
      setUserDP(JSON.parse(userDPData));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidenavRef.current && !sidenavRef.current.contains(event.target)) {
        setIsSidenavOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function parseNestedJSON(input) {
    if (typeof input !== 'string') return input;

    try {
      const parsed = JSON.parse(input);
      if (typeof parsed === 'string') {
        return parseNestedJSON(parsed);
      }
      return parsed;
    } catch (error) {
      console.error('Failed to parse JSON', input);
      return input;
    }
  }

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_URL}/api/customer/corporate/myorders`, {
          headers: { token: token },
        });

        const parsedOrders = parseNestedJSON(response.data.data);

        if (parsedOrders && parsedOrders.length > 0) {
          const ordersWithCategoryNames = await Promise.all(
            parsedOrders.map(async (order) => {
              const orderDetails = typeof order.order_details === 'string'
                ? JSON.parse(order.order_details)
                : order.order_details;

              const updatedOrderDetails = await Promise.all(
                orderDetails.map(async (detail) => {
                  const categoryName = await fetchCategoryName(detail.category_id);
                  return { ...detail, category_name: categoryName };
                })
              );

              return { ...order, order_details: updatedOrderDetails };
            })
          );

          setOrderData(ordersWithCategoryNames);
        } else {
          setError('No corporate orders found.');
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
        { categoryId },
        { headers: { token: localStorage.getItem('token') } }
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
      return newExpandedOrders;
    });
  }, []);

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

    return (
      <div key={order.corporateorder_generated_id} className="w-full bg-white rounded-lg border shadow-md hover:shadow-xl transition-shadow duration-300 mb-4">
        <div
          className="flex justify-between items-center p-4 sm:p-6 bg-blue-100 cursor-pointer hover:bg-blue-200 transition-colors rounded-t-lg"
          onClick={() => toggleOrderDetails(order.corporateorder_generated_id)}
        >
          <div className="w-full flex justify-between items-start">
            <div>
              <p className="text-lg sm:text-xl font-bold text-teal-800">Order ID: {order.corporateorder_generated_id}</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Date: {new Date(order.ordered_at).toLocaleDateString('en-GB', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })} {new Date(order.ordered_at).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg sm:text-xl font-bold text-blue-100 bg-teal-700 px-3 py-1 rounded-lg shadow-md">
                Total: ₹ {order.total_amount}
              </p>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="p-4 sm:p-6 overflow-x-auto">
            <table className="w-full bg-white min-w-max">
              <thead className="bg-gray-100 text-left text-xs sm:text-sm">
                <tr>
                  <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Category Name</th>
                  <th className="p-2 sm:p-6 lg:p-4 whitespace-nowrap w-1/3 text-center">Progress</th>
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
                    <td className="p-2 sm:p-6 lg:p-4 whitespace-nowrap w-1/4">
                      {renderProgressIcons(detail.delivery_status)}
                    </td>
                    <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">{detail.processing_date}</td>
                    <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">{detail.quantity}</td>
                    <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">{detail.active_quantity}</td>
                    <td className={`p-2 sm:p-3 lg:p-4 font-bold whitespace-nowrap ${
                      detail.accept_status === 'rejected' ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {detail.accept_status}
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar 
        activeTab="orders"
        toggleSidenav={() => setIsSidenavOpen(!isSidenavOpen)}
      />
      
      <Sidenav
        isOpen={isSidenavOpen}
        onClose={() => setIsSidenavOpen(false)}
        sidenavRef={sidenavRef}
        userDP={userDP}
      />

      <div className="pt-24 px-4 lg:px-8 flex-grow">
        <div className="bg-gradient-to-r from-blue-50 to-white shadow-xl rounded-lg p-4">
          {showCorporate ? (
            <div className="space-y-4 sm:space-y-8 w-full">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader />
                </div>
              ) : error ? (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative flex flex-col items-center" role="alert">
                  <span className="block sm:inline">Go and place an order to see it here.</span>
                  <button
                    className="mt-4 bg-teal-800 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition"
                    onClick={() => navigate('/home')}
                  >
                    Order Now
                  </button>
                </div>
              ) : orderData && orderData.length > 0 ? (
                orderData.map(renderOrder)
              ) : (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative flex flex-col items-center" role="alert">
                  <span className="block sm:inline">Go and place an order to see it here.</span>
                  <button
                    className="mt-4 bg-teal-800 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition"
                    onClick={() => navigate('/home')}
                  >
                    Order Now
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <OrderDashboard />
            </div>
          )}
        </div>
      </div>

      <footer className="bg-teal-800 text-white text-center py-4">
        <p>Good food is just an order away! 🍜📦</p>
      </footer>
    </div>
  );
};

export default CorporateOrders;