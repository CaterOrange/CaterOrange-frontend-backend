
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, MinusCircleIcon, UserCircleIcon } from '@heroicons/react/solid';
import axios from 'axios';
import { Loader } from 'lucide-react';
import OrderDashboard from '../events/myorders';
import { VerifyToken } from '../../MiddleWare/verifyToken';
import Footer from './Footer';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  ShoppingBag,
  MapPin,
  ChevronDown,
  ChevronUp,
  Calendar,
  Box,
  UserCheck,
  XCircle
} from 'lucide-react';

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

// Status Step Component for Delivery Progress
const StatusStep = ({ status, isActive, isCompleted, icon: Icon, title, description, timestamp, isLast }) => (
  <div className="flex items-start relative">
    {/* Vertical line - only show if not the last item */}
    {!isLast && (
      <div className="absolute left-4 top-8 h-full w-0.5 bg-gray-200">
        <div
          className={`w-full ${isCompleted ? 'bg-green-500' : isActive ? 'bg-blue-500' : 'bg-gray-200'}`}
          style={{ height: isActive ? '50%' : isCompleted ? '100%' : '0%' }}
        />
      </div>
    )}
   
    {/* Status circle and content */}
    <div className="flex items-start z-10">
      <div className={`rounded-full p-2 ${
        isCompleted ? 'bg-green-500 text-white' :
        isActive ? 'bg-blue-500 text-white' :
        'bg-gray-200 text-gray-500'
      }`}>
        <Icon size={20} />
      </div>
      <div className="ml-4">
        <h4 className={`font-semibold ${
          isCompleted ? 'text-green-600' :
          isActive ? 'text-blue-600' :
          'text-gray-500'
        }`}>
          {title}
        </h4>
        <p className="text-sm text-gray-500">{description}</p>
        {timestamp && (
          <p className="text-xs text-gray-400 mt-1">
            {new Date(timestamp).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  </div>
);

// Delivery Progress Component
const DeliveryProgress = ({ status, details }) => {
  const steps = [
    {
      status: 'pending',
      icon: Clock,
      title: 'Order Placed',
      description: 'Your order has been placed successfully'
    },
    {
      status: 'accepted',
      icon: UserCheck,
      title: 'Order Confirmed',
      description: 'Seller has processed your order'
    },
    {
      status: 'shipped',
      icon: Truck,
      title: 'Shipped',
      description: 'Your order is on the way'
    },
    {
      status: 'delivered',
      icon: CheckCircle,
      title: 'Delivered',
      description: 'Order has been delivered'
    }
  ];

  const statusIndex = steps.findIndex(step => step.status === status.toLowerCase());
 
  // If the current status is "delivered", mark it as completed
  const isDelivered = status.toLowerCase() === 'delivered';

  return (
    <div className="space-y-8 py-6">
      {steps.map((step, index) => (
        <StatusStep
          key={step.status}
          {...step}
          isCompleted={isDelivered && step.status === 'delivered' ? true : index < statusIndex}
          isActive={index === statusIndex}
          timestamp={index <= statusIndex ? (index === 0 ? details.addedat : details.processing_date ? new Date(details.processing_date) : new Date()) : null}
          isLast={index === steps.length - 1}
        />
      ))}
    </div>
  );
};

// Order Card Component
const OrderCard = ({ order, orderDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);

  const handleItemClick = (index) => {
    setSelectedItemIndex(selectedItemIndex === index ? null : index);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'accepted':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled by user':
      case 'cancelled by admin':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
      {/* Order Header */}
      <div
        className="cursor-pointer p-6 border-b"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-3">
              <ShoppingBag className="text-teal-600" size={24} />
              <h3 className="text-lg font-semibold text-gray-800">
                {order.corporateorder_generated_id}
              </h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Ordered on {new Date(order.ordered_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xl font-bold text-teal-600">
              ₹{order.total_amount}
            </span>
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </div>
        </div>

        {/* Delivery Address Preview */}
        {order.customer_address && (
          <div className="mt-4 flex items-start space-x-2 text-sm text-gray-600">
            <MapPin size={16} className="flex-shrink-0 mt-1" />
            <p>{order.customer_address.line1}, {order.customer_address.line2}</p>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="divide-y divide-gray-100">
          {orderDetails.map((item, index) => (
            <div key={item.order_detail_id} className="p-4">
              <div
                className="cursor-pointer"
                onClick={() => handleItemClick(index)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package size={24} className="text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">
                        {item.category_name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      getStatusColor(item.delivery_status)
                    }`}>
                      {item.delivery_status}
                    </span>
                    {selectedItemIndex === index ? <ChevronUp /> : <ChevronDown />}
                  </div>
                </div>
              </div>

              {/* Delivery Progress */}
              {selectedItemIndex === index && (
                <div className="mt-6 pl-20">
                  <DeliveryProgress
                    status={item.delivery_status}
                    details={item}
                  />
                </div>
              )}
            </div>
          ))}

          {/* Order Summary */}
          <div className="p-6 bg-gray-50">
            <h4 className="font-medium text-gray-800 mb-4">Order Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Items</span>
                <span className="font-medium">
                  {orderDetails.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-medium">₹{order.total_amount}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main CorporateOrders Component
const CorporateOrders = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState([]);
  const [error, setError] = useState(null);
  const [isSidenavOpen, setIsSidenavOpen] = useState(false);
  const [userDP, setUserDP] = useState({});
  const sidenavRef = useRef(null);
  const navigate = useNavigate();

  // Verify user token
  VerifyToken();

  // Load user display picture
  useEffect(() => {
    const userDPData = localStorage.getItem('userDP');
    if (userDPData) {
      setUserDP(JSON.parse(userDPData));
    }
  }, []);

  // Handle sidenav click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidenavRef.current && !sidenavRef.current.contains(event.target)) {
        setIsSidenavOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Process order data
  const processOrderData = (rawData) => {
    // Group by corporateorder_generated_id
    const groupedOrders = {};
    
    rawData.forEach(item => {
      const orderId = item.corporateorder_generated_id;
      
      if (!groupedOrders[orderId]) {
        groupedOrders[orderId] = {
          orderInfo: {
            corporateorder_generated_id: item.corporateorder_generated_id,
            total_amount: item.total_amount,
            ordered_at: item.ordered_at
          },
          orderDetails: []
        };
      }
      
      // Add order detail
      groupedOrders[orderId].orderDetails.push({
        order_detail_id: item.order_detail_id,
        delivery_status: item.delivery_status,
        category_id: item.category_id,
        category_name: item.category_name,
        quantity: item.quantity,
        active_quantity: item.active_quantity,
        processing_date: item.processing_date,
        addedat: item.addedat
      });
    });
    
    return Object.values(groupedOrders);
  };

  // Fetch orders data
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${process.env.REACT_APP_URL}/api/customer/corporate/myorders`,
          { headers: { token } }
        );

        if (response.data && response.data.data && response.data.data.length > 0) {
          const processedData = processOrderData(response.data.data);
          setOrderData(processedData);
        } else {
          setError('No corporate orders found.');
        }
      } catch (error) {
        console.error('Error fetching corporate order data:', error);
        setError('Failed to fetch orders. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      <Navbar
        activeTab="orders"
        toggleSidenav={() => setIsSidenavOpen(!isSidenavOpen)}
        cartCount={0}
      />
      <Sidenav
        isOpen={isSidenavOpen}
        onClose={() => setIsSidenavOpen(false)}
        sidenavRef={sidenavRef}
        userDP={userDP}
      />
      <div className="max-w-7xl mx-auto px-4 py-8 pt-20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
          <button
            onClick={() => navigate('/home')}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg
                     transition-colors duration-200 flex items-center space-x-2"
          >
            <ShoppingBag size={20} />
            <span>Place New Order</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <AlertCircle className="mx-auto text-yellow-500 mb-4" size={48} />
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{error}</h2>
            <button
              onClick={() => navigate('/home')}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Start Ordering
            </button>
          </div>
        ) : orderData && orderData.length > 0 ? (
          <div className="space-y-6">
            {orderData.map(orderGroup => (
              <OrderCard
                key={orderGroup.orderInfo.corporateorder_generated_id}
                order={orderGroup.orderInfo}
                orderDetails={orderGroup.orderDetails}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center">
            <ShoppingBag className="mx-auto text-gray-400 mb-4" size={48} />
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              No orders yet
            </h2>
            <p className="text-gray-500 mb-6">
              Start shopping to see your orders here
            </p>
            <button
              onClick={() => navigate('/home')}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Browse Products
            </button>
          </div>
        )}
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default CorporateOrders;